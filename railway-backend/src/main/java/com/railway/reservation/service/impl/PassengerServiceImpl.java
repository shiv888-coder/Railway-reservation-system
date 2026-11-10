package com.railway.reservation.service.impl;

import com.railway.reservation.dao.PassengerDAO;
import com.railway.reservation.exception.InvalidPassengerException;
import com.railway.reservation.exception.InvalidPnrException;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.service.PassengerService;

import java.util.List;

/**
 * Service implementation for passenger validation and retrieval.
 */
public class PassengerServiceImpl implements PassengerService {

    private final PassengerDAO passengerDAO;

    public PassengerServiceImpl() {
        this(new PassengerDAO());
    }

    public PassengerServiceImpl(PassengerDAO passengerDAO) {
        this.passengerDAO = passengerDAO;
    }

    @Override
    public void validatePassenger(Passenger p) {
        if (p == null) {
            throw new InvalidPassengerException("Passenger object cannot be null.");
        }
        if (p.getFullName() == null || p.getFullName().trim().isEmpty()) {
            throw new InvalidPassengerException("Passenger full name cannot be blank.");
        }
        if (p.getAge() <= 0 || p.getAge() > 125) {
            throw new InvalidPassengerException("Passenger age must be between 1 and 125 (was: " + p.getAge() + ").");
        }
        if (p.getGender() == null) {
            throw new InvalidPassengerException("Passenger gender must be specified.");
        }
    }

    @Override
    public void validatePassengers(List<Passenger> passengers) {
        if (passengers == null || passengers.isEmpty()) {
            throw new InvalidPassengerException("At least one passenger must be provided for booking.");
        }
        if (passengers.size() > 6) {
            throw new InvalidPassengerException("A maximum of 6 passengers are allowed per booking under Indian Railways rules.");
        }
        for (Passenger p : passengers) {
            validatePassenger(p);
        }
    }

    @Override
    public List<Passenger> getPassengersByPnr(String pnr) {
        if (pnr == null || pnr.trim().length() != 10) {
            throw new InvalidPnrException("PNR must be a 10-digit numeric string (was: " + pnr + ").");
        }
        return passengerDAO.findByPnr(pnr.trim());
    }

    @Override
    public List<Passenger> getAllPassengers() {
        return passengerDAO.findAll();
    }
}
