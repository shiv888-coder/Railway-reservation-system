package com.railway.reservation.exception;

/**
 * Thrown when a reservation cannot be located for a given PNR number.
 */
public class ReservationNotFoundException extends RuntimeException {
    public ReservationNotFoundException(String pnr) {
        super("Reservation not found for PNR: " + pnr);
    }
}
