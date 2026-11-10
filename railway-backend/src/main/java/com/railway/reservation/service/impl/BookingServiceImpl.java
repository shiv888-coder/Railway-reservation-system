package com.railway.reservation.service.impl;

import com.railway.reservation.dao.ReservationDAO;
import com.railway.reservation.dto.BookingRequest;
import com.railway.reservation.dto.BookingResult;
import com.railway.reservation.dto.FareBreakdown;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.exception.InsufficientSeatsException;
import com.railway.reservation.exception.InvalidJourneyException;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service implementation for Ticket Booking.
 * Orchestrates validation, tariff computation, berth assignment, and transactional persistence.
 */
public class BookingServiceImpl implements BookingService {

    private final TrainSearchService trainSearchService;
    private final SeatAvailabilityService seatAvailabilityService;
    private final FareCalculationService fareCalculationService;
    private final PassengerService passengerService;
    private final ReservationDAO reservationDAO;

    public BookingServiceImpl() {
        this(new TrainSearchServiceImpl(), new SeatAvailabilityServiceImpl(),
             new FareCalculationServiceImpl(), new PassengerServiceImpl(), new ReservationDAO());
    }

    public BookingServiceImpl(TrainSearchService trainSearchService,
                              SeatAvailabilityService seatAvailabilityService,
                              FareCalculationService fareCalculationService,
                              PassengerService passengerService,
                              ReservationDAO reservationDAO) {
        this.trainSearchService = trainSearchService;
        this.seatAvailabilityService = seatAvailabilityService;
        this.fareCalculationService = fareCalculationService;
        this.passengerService = passengerService;
        this.reservationDAO = reservationDAO;
    }

    @Override
    public BookingResult bookTicket(BookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null.");
        }

        // 1. Validate Journey Date and Stations
        validateJourneyParameters(request);

        // 2. Validate Train and Intermediate Halts Sequence
        Train train = trainSearchService.getTrainByNumber(request.getTrainNumber());

        // 3. Validate Passenger Info
        List<Passenger> passengers = request.getPassengers();
        passengerService.validatePassengers(passengers);

        // 4. Verify Seat Availability (Prevent Overbooking)
        int requestedSeats = passengers.size();
        int availableSeats = seatAvailabilityService.getAvailableSeats(train.getTrainNumber(), request.getCoachClass());
        if (availableSeats < requestedSeats) {
            throw new InsufficientSeatsException(train.getTrainNumber(), request.getCoachClass().getCode(), requestedSeats, availableSeats);
        }

        // 5. Calculate Fare Breakdown
        FareBreakdown fare = fareCalculationService.calculateFare(
                train.getTrainNumber(),
                request.getCoachClass(),
                request.getSourceStationCode(),
                request.getDestinationStationCode(),
                passengers
        );

        // 6. Assemble Reservation Master Entity
        Reservation reservation = new Reservation();
        reservation.setTrainNumber(train.getTrainNumber());
        reservation.setSourceStationCode(request.getSourceStationCode().trim().toUpperCase());
        reservation.setDestinationStationCode(request.getDestinationStationCode().trim().toUpperCase());
        reservation.setJourneyDate(request.getJourneyDate().trim());
        reservation.setCoachClass(request.getCoachClass());
        reservation.setBookingStatus(BookingStatus.CONFIRMED);
        reservation.setBaseFare(fare.getBaseFare());
        reservation.setReservationCharge(fare.getReservationCharge());
        reservation.setSuperfastCharge(fare.getSuperfastCharge());
        reservation.setCateringCharge(fare.getCateringCharge());
        reservation.setGstAmount(fare.getGstAmount());
        reservation.setSeniorDiscount(fare.getSeniorDiscount());
        reservation.setTotalFare(fare.getTotalFare());

        // 7. Persist Reservation, Passengers, and Berth Allocations in a Single ACID Transaction
        Reservation confirmed = reservationDAO.createReservation(reservation, passengers);

        // 8. Return Confirmation Result
        return new BookingResult(
                true,
                "Ticket booked successfully with PNR: " + confirmed.getPnr(),
                confirmed.getPnr(),
                confirmed,
                fare
        );
    }

    private void validateJourneyParameters(BookingRequest request) {
        if (request.getSourceStationCode() == null || request.getSourceStationCode().trim().isEmpty()) {
            throw new InvalidJourneyException("Source station code is required.");
        }
        if (request.getDestinationStationCode() == null || request.getDestinationStationCode().trim().isEmpty()) {
            throw new InvalidJourneyException("Destination station code is required.");
        }
        if (request.getSourceStationCode().trim().equalsIgnoreCase(request.getDestinationStationCode().trim())) {
            throw new InvalidJourneyException("Source and destination stations cannot be identical.");
        }
        if (request.getJourneyDate() == null || request.getJourneyDate().trim().isEmpty()) {
            throw new InvalidJourneyException("Journey date is required.");
        }
        if (request.getCoachClass() == null) {
            throw new InvalidJourneyException("Travel coach class must be selected.");
        }

        // Prevent booking dates in the past
        try {
            LocalDate date = LocalDate.parse(request.getJourneyDate().trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            if (date.isBefore(LocalDate.now())) {
                throw new InvalidJourneyException("Journey date cannot be in the past: " + request.getJourneyDate());
            }
        } catch (Exception e) {
            if (e instanceof InvalidJourneyException) throw (InvalidJourneyException) e;
            throw new InvalidJourneyException("Invalid journey date format (expected YYYY-MM-DD): " + request.getJourneyDate());
        }
    }
}
