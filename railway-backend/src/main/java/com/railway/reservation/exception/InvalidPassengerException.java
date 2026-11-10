package com.railway.reservation.exception;

/**
 * Thrown when passenger validation fails (e.g., blank name, invalid age <= 0, or missing ID proof).
 */
public class InvalidPassengerException extends RuntimeException {
    public InvalidPassengerException(String message) {
        super(message);
    }
}
