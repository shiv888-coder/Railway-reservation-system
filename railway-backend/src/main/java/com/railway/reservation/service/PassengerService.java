package com.railway.reservation.service;

import com.railway.reservation.model.Passenger;

import java.util.List;

/**
 * Service interface for passenger validation and profile retrieval.
 */
public interface PassengerService {

    void validatePassenger(Passenger passenger);

    void validatePassengers(List<Passenger> passengers);

    List<Passenger> getPassengersByPnr(String pnr);

    List<Passenger> getAllPassengers();
}
