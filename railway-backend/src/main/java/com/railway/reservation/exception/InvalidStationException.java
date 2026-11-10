package com.railway.reservation.exception;

/**
 * Thrown when an invalid or non-existent station code or name is provided.
 */
public class InvalidStationException extends RuntimeException {
    public InvalidStationException(String message) {
        super(message);
    }
}
