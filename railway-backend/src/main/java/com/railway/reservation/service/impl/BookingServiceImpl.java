package com.railway.reservation.service.impl;

import com.railway.reservation.dto.BookingRequestDto;
import com.railway.reservation.dto.FareBreakdownDto;
import com.railway.reservation.dto.PassengerDto;
import com.railway.reservation.entity.*;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.exception.InsufficientSeatsException;
import com.railway.reservation.exception.InvalidBookingException;
import com.railway.reservation.exception.ResourceNotFoundException;
import com.railway.reservation.repository.*;
import com.railway.reservation.service.BookingService;
import com.railway.reservation.service.FareCalculationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;

/**
 * Concrete implementation of BookingService.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Encapsulation:
 *    - All database repositories and domain collaborators are private final fields.
 *    - Validates business constraints before initiating state transitions.
 *
 * 2. Abstraction & Interface-Based Programming:
 *    - Implements BookingService contract.
 *    - Injects FareCalculationService interface rather than concrete class.
 *
 * 3. Polymorphism:
 *    - Relies on BaseTrainEntity polymorphic hierarchy to calculate accurate fares.
 *
 * 4. Concurrency Control:
 *    - Utilizes @Version optimistic locking on TrainSeatEntity to prevent race
 *      conditions when multiple users attempt to reserve the last available seats.
 */
@Service
public class BookingServiceImpl implements BookingService {

    private final TrainRepository trainRepository;
    private final TrainSeatRepository trainSeatRepository;
    private final PassengerRepository passengerRepository;
    private final ReservationRepository reservationRepository;
    private final SeatAllocationRepository seatAllocationRepository;
    private final CancellationSlipRepository cancellationSlipRepository;
    private final FareCalculationService fareCalculationService;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Parameterized Constructor Injection
     */
    public BookingServiceImpl(TrainRepository trainRepository,
                              TrainSeatRepository trainSeatRepository,
                              PassengerRepository passengerRepository,
                              ReservationRepository reservationRepository,
                              SeatAllocationRepository seatAllocationRepository,
                              CancellationSlipRepository cancellationSlipRepository,
                              FareCalculationService fareCalculationService) {
        this.trainRepository = trainRepository;
        this.trainSeatRepository = trainSeatRepository;
        this.passengerRepository = passengerRepository;
        this.reservationRepository = reservationRepository;
        this.seatAllocationRepository = seatAllocationRepository;
        this.cancellationSlipRepository = cancellationSlipRepository;
        this.fareCalculationService = fareCalculationService;
    }

    /**
     * Transactional Ticket Booking Operation.
     * Any failure or runtime exception automatically rolls back database transactions.
     */
    @Override
    @Transactional
    public ReservationEntity bookTicket(BookingRequestDto request) {
        // Step 1: Validate Passenger Manifest and Journey Date
        validateBookingRequest(request);

        // Step 2: Retrieve Train Entity
        BaseTrainEntity train = trainRepository.findByTrainNumber(request.getTrainNumber().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Train", "trainNumber", request.getTrainNumber()));

        // Step 3: Check Seat Availability & Concurrency Inventory Lock
        TrainSeatEntity seatInventory = trainSeatRepository.findByTrain_TrainNumberAndCoachClass(
                train.getTrainNumber(), request.getTravelClass())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seat Configuration for class " + request.getTravelClass() + " on Train",
                        "trainNumber", train.getTrainNumber()));

        int requestedSeats = request.getPassengers().size();
        if (seatInventory.getAvailableSeats() < requestedSeats) {
            throw new InsufficientSeatsException(
                    train.getTrainNumber(),
                    request.getTravelClass().getCode(),
                    requestedSeats,
                    seatInventory.getAvailableSeats()
            );
        }

        // Step 4: Calculate Fares using Polymorphic FareCalculationService
        int seniorCount = (int) request.getPassengers().stream()
                .filter(PassengerDto::isSeniorCitizen)
                .count();

        FareBreakdownDto fare = fareCalculationService.calculateFareBreakdown(
                train,
                request.getTravelClass(),
                requestedSeats,
                seniorCount
        );

        // Step 5: Safely Decrement Available Seats
        // The @Version field on TrainSeatEntity guarantees optimistic locking protection
        seatInventory.setAvailableSeats(seatInventory.getAvailableSeats() - requestedSeats);
        trainSeatRepository.save(seatInventory);

        // Step 6: Generate Unique 10-Digit PNR
        String pnr = generateUniquePnr();

        // Step 7: Construct Reservation Master Record
        ReservationEntity reservation = new ReservationEntity(
                pnr,
                train,
                train.getSourceStation(),
                train.getDestinationStation(),
                request.getJourneyDate(),
                request.getTravelClass(),
                fare.getBaseFare(),
                fare.getReservationCharge(),
                fare.getSuperfastCharge(),
                fare.getCateringCharge(),
                fare.getGstAmount(),
                fare.getSeniorDiscount(),
                fare.getTotalFare()
        );

        // Step 8: Persist Passengers & Assign Physical Coach / Berths
        String coachCode = getCoachPrefix(request.getTravelClass());
        int startBerthNumber = RANDOM.nextInt(35) + 1;
        String[] standardBerths = {"Lower Berth", "Middle Berth", "Upper Berth", "Side Lower", "Side Upper"};

        for (int i = 0; i < requestedSeats; i++) {
            PassengerDto pDto = request.getPassengers().get(i);

            // Save or find passenger profile in repository
            PassengerEntity passenger = passengerRepository.findByPhone(pDto.getPhone().trim())
                    .orElseGet(() -> passengerRepository.save(new PassengerEntity(
                            pDto.getFullName(),
                            pDto.getAge(),
                            pDto.getGender(),
                            pDto.getPhone(),
                            pDto.getEmail(),
                            pDto.getIdProofType(),
                            pDto.getIdProofNumber()
                    )));

            int assignedBerthNum = startBerthNumber + i;
            String assignedBerthType;
            if (request.getTravelClass() == CoachClass.CHAIR_CAR || request.getTravelClass() == CoachClass.EXECUTIVE_CHAIR) {
                assignedBerthType = (i % 2 == 0) ? "Window Chair" : "Aisle Chair";
            } else {
                assignedBerthType = standardBerths[i % standardBerths.length];
            }

            SeatAllocationEntity allocation = new SeatAllocationEntity(
                    reservation,
                    passenger,
                    coachCode,
                    assignedBerthNum,
                    assignedBerthType
            );

            reservation.addSeatAllocation(allocation);
        }

        // Step 9: Save Reservation (Cascades to Seat Allocations)
        return reservationRepository.save(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationEntity getReservationByPnr(String pnr) {
        if (pnr == null || pnr.trim().isEmpty()) {
            throw new IllegalArgumentException("PNR cannot be null or empty.");
        }

        String cleanPnr = pnr.replace("-", "").trim();
        return reservationRepository.findByPnr(cleanPnr)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "PNR", pnr));
    }

    /**
     * Transactional Ticket Cancellation Operation.
     * Computes refund, records cancellation voucher, marks status as CANCELLED,
     * and replenishes train seat inventory.
     */
    @Override
    @Transactional
    public CancellationSlipEntity cancelReservation(String pnr, String reason) {
        ReservationEntity reservation = getReservationByPnr(pnr);

        if (reservation.isCancelled()) {
            throw new InvalidBookingException("Reservation with PNR " + pnr + " is already cancelled.");
        }

        // Calculate Cancellation Penalty according to Railway time slabs (demo rules)
        BigDecimal totalFare = reservation.getTotalFare();
        BigDecimal minFee = BigDecimal.valueOf(120.00);
        BigDecimal feeRate = totalFare.multiply(BigDecimal.valueOf(0.15));
        BigDecimal cancellationFee = feeRate.max(minFee).min(totalFare).setScale(2, RoundingMode.HALF_UP);
        BigDecimal refundAmount = totalFare.subtract(cancellationFee).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        // Create Cancellation Slip Voucher
        String cancelReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Passenger requested cancellation";
        CancellationSlipEntity slip = new CancellationSlipEntity(
                reservation,
                cancellationFee,
                refundAmount,
                cancelReason
        );

        reservation.setBookingStatus(BookingStatus.CANCELLED);
        reservation.setCancellationSlip(slip);
        cancellationSlipRepository.save(slip);
        reservationRepository.save(reservation);

        // Replenish Seat Inventory in TrainSeatEntity
        trainSeatRepository.findByTrain_TrainNumberAndCoachClass(
                reservation.getTrain().getTrainNumber(), reservation.getTravelClass())
                .ifPresent(seatInventory -> {
                    int releasedCount = reservation.getSeatAllocations().size();
                    int newAvailable = Math.min(seatInventory.getTotalSeats(), seatInventory.getAvailableSeats() + releasedCount);
                    seatInventory.setAvailableSeats(newAvailable);
                    trainSeatRepository.save(seatInventory);
                });

        return slip;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationEntity> getAllReservations() {
        return reservationRepository.findAllByOrderByBookedAtDesc();
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    private void validateBookingRequest(BookingRequestDto request) {
        if (request == null) {
            throw new InvalidBookingException("Booking request payload cannot be null.");
        }
        if (request.getTrainNumber() == null || request.getTrainNumber().trim().isEmpty()) {
            throw new InvalidBookingException("Train number is required.");
        }
        if (request.getJourneyDate() == null) {
            throw new InvalidBookingException("Journey date is required.");
        }
        if (request.getJourneyDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Journey date cannot be in the past: " + request.getJourneyDate());
        }
        if (request.getTravelClass() == null) {
            throw new InvalidBookingException("Travel class is required.");
        }
        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new InvalidBookingException("At least one passenger must be specified.");
        }
        if (request.getPassengers().size() > 6) {
            throw new InvalidBookingException("Maximum 6 passengers allowed per ticket reservation.");
        }

        for (int i = 0; i < request.getPassengers().size(); i++) {
            PassengerDto p = request.getPassengers().get(i);
            if (p.getFullName() == null || p.getFullName().trim().length() < 2) {
                throw new InvalidBookingException("Passenger #" + (i + 1) + " must have a valid full name.");
            }
            if (p.getPhone() == null || p.getPhone().trim().length() < 8) {
                throw new InvalidBookingException("Passenger #" + (i + 1) + " must have a valid phone number.");
            }
            if (p.getIdProofNumber() == null || p.getIdProofNumber().trim().isEmpty()) {
                throw new InvalidBookingException("Passenger #" + (i + 1) + " must provide a valid ID proof number.");
            }
        }
    }

    private String generateUniquePnr() {
        String pnr;
        do {
            // Generate random 10-digit number between 2,000,000,000 and 9,999,999,999
            long num = 2000000000L + (long) (RANDOM.nextDouble() * 7999999999L);
            pnr = String.valueOf(num);
        } while (reservationRepository.existsByPnr(pnr));
        return pnr;
    }

    private String getCoachPrefix(CoachClass coachClass) {
        return switch (coachClass) {
            case FIRST_AC -> "H1";
            case SECOND_AC -> "A1";
            case THIRD_AC -> "B2";
            case EXECUTIVE_CHAIR -> "E1";
            case CHAIR_CAR -> "C2";
            case SLEEPER -> "S3";
        };
    }
}
