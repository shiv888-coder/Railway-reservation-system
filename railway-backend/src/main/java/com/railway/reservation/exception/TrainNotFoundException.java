package com.railway.reservation.exception;

/**
 * Thrown when a train with the requested train number cannot be found in the system.
 */
public class TrainNotFoundException extends RuntimeException {
    public TrainNotFoundException(String trainNumber) {
        super("Train not found with number: " + trainNumber);
    }
}
