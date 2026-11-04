package com.railway.reservation.exception;

/**
 * Exception thrown when a ticket booking request fails domain validation
 * (e.g., date in past, empty passenger manifest, exceeds 6 passengers).
 */
public class InvalidBookingException extends RuntimeException {

    public InvalidBookingException(String message) {
        super(message);
    }
}
