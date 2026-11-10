package com.railway.reservation.service;

import com.railway.reservation.model.Reservation;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for querying and auditing ticket reservations and PNR statuses.
 */
public interface ReservationService {

    /**
     * Looks up an existing reservation and passenger list by 10-digit PNR.
     */
    Optional<Reservation> getReservationByPnr(String pnr);

    /**
     * Retrieves all recorded reservations ordered by booking timestamp descending.
     */
    List<Reservation> getAllReservations();

    /**
     * Returns total count of booked reservations.
     */
    int getTotalReservationsCount();

    /**
     * Computes the cumulative confirmed booking revenue.
     */
    double getTotalRevenue();

    /**
     * Validates if a string adheres to the authentic 10-digit PNR format.
     */
    boolean isValidPnr(String pnr);
}
