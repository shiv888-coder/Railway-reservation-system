package com.railway.reservation.service;

import com.railway.reservation.dto.BookingRequest;
import com.railway.reservation.dto.BookingResult;

/**
 * Service interface orchestrating the complete ticket booking lifecycle.
 */
public interface BookingService {

    /**
     * Executes the end-to-end booking workflow:
     * Validates journey, checks seat inventory, calculates fares, generates unique PNR,
     * assigns berths, and persists the reservation in an ACID transaction.
     */
    BookingResult bookTicket(BookingRequest request);
}
