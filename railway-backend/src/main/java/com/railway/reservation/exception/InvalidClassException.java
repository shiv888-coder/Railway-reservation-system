package com.railway.reservation.exception;

/**
 * Thrown when a coach class is not supported on a specific train or is invalid.
 */
public class InvalidClassException extends RuntimeException {
    public InvalidClassException(String message) {
        super(message);
    }

    public InvalidClassException(String trainNumber, String coachClass) {
        super(String.format("Coach class '%s' is not available on Train %s.", coachClass, trainNumber));
    }
}
