package com.railway.reservation.controller;

import com.railway.reservation.dto.CancellationRequestDto;
import com.railway.reservation.entity.CancellationSlipEntity;
import com.railway.reservation.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Ticket Cancellation and Refund Voucher Issuance.
 */
@RestController
@RequestMapping("/api")
public class CancellationController {

    private final BookingService bookingService;

    public CancellationController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * POST /api/reservations/{pnr}/cancel
     * POST /api/booking/{pnr}/cancel
     * Cancels an existing confirmed reservation, calculates railway deductions,
     * replenishes train seats, and returns an official refund voucher slip.
     */
    @PostMapping({"/reservations/{pnr}/cancel", "/booking/{pnr}/cancel"})
    public ResponseEntity<CancellationSlipEntity> cancelReservation(
            @PathVariable("pnr") String pnr,
            @RequestBody(required = false) CancellationRequestDto request) {
        String reason = (request != null && request.getReason() != null)
                ? request.getReason()
                : "Passenger voluntary cancellation";

        CancellationSlipEntity slip = bookingService.cancelReservation(pnr, reason);
        return ResponseEntity.ok(slip);
    }

    /**
     * POST /api/cancellation/cancel
     * Body-based cancellation endpoint supporting { pnr: "...", reason: "..." } payload.
     */
    @PostMapping("/cancellation/cancel")
    public ResponseEntity<CancellationSlipEntity> cancelReservationByBody(
            @RequestBody CancellationRequestDto request) {
        String pnr = (request != null) ? request.getPnr() : null;
        String reason = (request != null && request.getReason() != null)
                ? request.getReason()
                : "Passenger voluntary cancellation";

        CancellationSlipEntity slip = bookingService.cancelReservation(pnr, reason);
        return ResponseEntity.ok(slip);
    }
}
