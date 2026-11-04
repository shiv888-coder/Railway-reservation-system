package com.railway.reservation.controller;

import com.railway.reservation.dto.BookingRequestDto;
import com.railway.reservation.dto.FareBreakdownDto;
import com.railway.reservation.dto.FareCalculationRequestDto;
import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.ReservationEntity;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.service.BookingService;
import com.railway.reservation.service.FareCalculationService;
import com.railway.reservation.service.TrainService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Ticket Booking, Fare Computation, and PNR Reservation Lookups.
 */
@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final FareCalculationService fareCalculationService;
    private final TrainService trainService;

    public BookingController(BookingService bookingService,
                             FareCalculationService fareCalculationService,
                             TrainService trainService) {
        this.bookingService = bookingService;
        this.fareCalculationService = fareCalculationService;
        this.trainService = trainService;
    }

    /**
     * POST /api/booking/calculate-fare
     * POST /api/fare/calculate
     * Dynamically computes itemized fare breakdown without making a booking.
     */
    @PostMapping({"/booking/calculate-fare", "/fare/calculate"})
    public ResponseEntity<FareBreakdownDto> calculateFare(@Valid @RequestBody FareCalculationRequestDto request) {
        BaseTrainEntity train = trainService.getTrainByNumber(request.getTrainNumber());
        FareBreakdownDto breakdown = fareCalculationService.calculateFareBreakdown(
                train,
                request.getCoachClass(),
                request.getPassengerCount(),
                request.getSeniorCount()
        );
        return ResponseEntity.ok(breakdown);
    }

    /**
     * POST /api/reservations/book
     * POST /api/booking/reserve
     * Transactional multi-passenger ticket reservation.
     */
    @PostMapping({"/reservations/book", "/booking/reserve"})
    public ResponseEntity<ReservationEntity> bookTicket(@Valid @RequestBody BookingRequestDto request) {
        ReservationEntity reservation = bookingService.bookTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * GET /api/reservations/{pnr}
     * GET /api/booking/{pnr}
     * Retrieves electronic reservation slip (ERS) and manifest by 10-digit PNR.
     * Fully unifies both /api/reservations/{pnr} and /api/booking/{pnr} routes.
     */
    @GetMapping({"/reservations/{pnr}", "/booking/{pnr}"})
    public ResponseEntity<ReservationEntity> getReservationByPnr(@PathVariable("pnr") String pnr) {
        ReservationEntity reservation = bookingService.getReservationByPnr(pnr);
        return ResponseEntity.ok(reservation);
    }

    /**
     * GET /api/reservations?status=CONFIRMED
     * Lists all reservations, optionally filtered by BookingStatus (CONFIRMED, CANCELLED, WAITLIST).
     */
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationEntity>> getAllReservations(
            @RequestParam(name = "status", required = false) BookingStatus status) {
        List<ReservationEntity> all = bookingService.getAllReservations();
        if (status != null) {
            all = all.stream()
                    .filter(r -> r.getBookingStatus() == status)
                    .toList();
        }
        return ResponseEntity.ok(all);
    }
}
