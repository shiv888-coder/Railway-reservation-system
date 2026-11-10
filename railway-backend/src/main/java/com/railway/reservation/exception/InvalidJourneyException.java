package com.railway.reservation.exception;

/**
 * Thrown when journey parameters are logically invalid (e.g., origin matches destination, past date, or reverse station sequence).
 */
public class InvalidJourneyException extends RuntimeException {
    public InvalidJourneyException(String message) {
        super(message);
    }
}
