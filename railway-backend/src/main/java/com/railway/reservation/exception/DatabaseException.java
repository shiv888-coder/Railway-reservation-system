package com.railway.reservation.exception;

/**
 * Custom runtime exception wrapping SQLite JDBC and data access failures.
 */
public class DatabaseException extends RuntimeException {

    public DatabaseException(String message) {
        super(message);
    }

    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
