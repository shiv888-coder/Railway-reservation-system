package com.railway.reservation.exception;

/**
 * Thrown when a PNR format is invalid (not a 10-digit numeric string).
 */
public class InvalidPnrException extends RuntimeException {
    public InvalidPnrException(String message) {
        super(message);
    }
}
