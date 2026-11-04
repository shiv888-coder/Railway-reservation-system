package com.railway.reservation.exception;

/**
 * Exception thrown when a user requests more seats than currently available in train inventory.
 */
public class InsufficientSeatsException extends RuntimeException {

    public InsufficientSeatsException(String message) {
        super(message);
    }

    public InsufficientSeatsException(String trainNumber, String coachClass, int requested, int available) {
        super(String.format("Insufficient seats on Train %s for class %s. Requested: %d, Available: %d",
                trainNumber, coachClass, requested, available));
    }
}
