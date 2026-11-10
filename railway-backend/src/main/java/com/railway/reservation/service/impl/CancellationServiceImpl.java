package com.railway.reservation.service.impl;

import com.railway.reservation.dao.CancellationDAO;
import com.railway.reservation.dao.ReservationDAO;
import com.railway.reservation.dto.CancellationResult;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.exception.InvalidPnrException;
import com.railway.reservation.exception.ReservationNotFoundException;
import com.railway.reservation.model.CancellationSlip;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.CancellationService;

import java.util.List;

/**
 * Service implementation for Ticket Cancellation and Refund handling.
 * Enforces transactional execution, status verification, refund calculation, and seat restoration.
 */
public class CancellationServiceImpl implements CancellationService {

    private final CancellationDAO cancellationDAO;
    private final ReservationDAO reservationDAO;

    public CancellationServiceImpl() {
        this(new CancellationDAO(), new ReservationDAO());
    }

    public CancellationServiceImpl(CancellationDAO cancellationDAO, ReservationDAO reservationDAO) {
        this.cancellationDAO = cancellationDAO;
        this.reservationDAO = reservationDAO;
    }

    @Override
    public CancellationResult cancelTicket(String pnr, String reason) {
        if (pnr == null || pnr.trim().length() != 10) {
            throw new InvalidPnrException("PNR must be a 10-digit number (was: " + pnr + ").");
        }
        String cleanPnr = pnr.trim();

        // 1. Verify existence of reservation
        Reservation res = reservationDAO.findByPnr(cleanPnr)
                .orElseThrow(() -> new ReservationNotFoundException(cleanPnr));

        // 2. Validate booking status
        if (res.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Ticket with PNR " + cleanPnr + " has already been cancelled.");
        }

        int seatCount = res.getPassengers() != null && !res.getPassengers().isEmpty()
                ? res.getPassengers().size()
                : 1;

        // 3. Perform transactional cancellation and seat restoration in SQLite
        CancellationSlip slip = cancellationDAO.cancelTicket(cleanPnr, reason);

        // 4. Return formatted cancellation result
        return new CancellationResult(
                true,
                String.format("Ticket %s cancelled successfully. Refund of ₹%.2f processed (Ref: %s).",
                        cleanPnr, slip.getRefundAmount(), slip.getRefundReferenceId()),
                cleanPnr,
                slip,
                seatCount
        );
    }

    @Override
    public CancellationSlip getCancellationSlip(String pnr) {
        if (pnr == null || pnr.trim().length() != 10) {
            throw new InvalidPnrException("PNR must be a 10-digit numeric string.");
        }
        return cancellationDAO.findByPnr(pnr.trim())
                .orElseThrow(() -> new ReservationNotFoundException("No cancellation record found for PNR: " + pnr));
    }

    @Override
    public List<CancellationSlip> getAllCancellations() {
        return cancellationDAO.findAll();
    }
}
