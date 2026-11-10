package com.railway.reservation.service.impl;

import com.railway.reservation.dao.ReservationDAO;
import com.railway.reservation.exception.InvalidPnrException;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.ReservationService;

import java.util.List;
import java.util.Optional;

/**
 * Implementation of ReservationService using ReservationDAO.
 */
public class ReservationServiceImpl implements ReservationService {

    private final ReservationDAO reservationDAO;

    public ReservationServiceImpl() {
        this(new ReservationDAO());
    }

    public ReservationServiceImpl(ReservationDAO reservationDAO) {
        this.reservationDAO = reservationDAO;
    }

    @Override
    public Optional<Reservation> getReservationByPnr(String pnr) {
        if (!isValidPnr(pnr)) {
            throw new InvalidPnrException("PNR must be a valid 10-digit numeric string: " + pnr);
        }
        return reservationDAO.findByPnr(pnr.trim());
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationDAO.findAll();
    }

    @Override
    public int getTotalReservationsCount() {
        return reservationDAO.countReservations();
    }

    @Override
    public double getTotalRevenue() {
        return reservationDAO.calculateTotalRevenue();
    }

    @Override
    public boolean isValidPnr(String pnr) {
        if (pnr == null) return false;
        String trimmed = pnr.trim();
        return trimmed.length() == 10 && trimmed.chars().allMatch(Character::isDigit);
    }
}
