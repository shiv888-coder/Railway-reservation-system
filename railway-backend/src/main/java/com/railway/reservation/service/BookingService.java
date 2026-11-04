package com.railway.reservation.service;

import com.railway.reservation.dto.BookingRequestDto;
import com.railway.reservation.entity.CancellationSlipEntity;
import com.railway.reservation.entity.ReservationEntity;

import java.util.List;

/**
 * Service interface for railway ticket reservations and cancellations.
 *
 * OOP Concept: Interface-Based Architecture & Transactional Boundary
 * - Manages multi-passenger ticket bookings, seat allocation, and lifecycle audits.
 */
public interface BookingService {

    /**
     * Books a railway ticket with seat allocation, inventory updates, and fare computation.
     *
     * @param request Booking request containing train number, journey date, class, and passenger manifest
     * @return Confirmed ReservationEntity containing 10-digit PNR and allocated berths
     */
    ReservationEntity bookTicket(BookingRequestDto request);

    /**
     * Retrieves an existing ticket reservation by its unique 10-digit PNR.
     *
     * @param pnr 10-digit PNR string
     * @return ReservationEntity
     */
    ReservationEntity getReservationByPnr(String pnr);

    /**
     * Cancels an existing reservation, issues a cancellation slip, and replenishes seats.
     *
     * @param pnr 10-digit PNR
     * @param reason Cancellation reason
     * @return CancellationSlipEntity audit voucher with refund reference ID
     */
    CancellationSlipEntity cancelReservation(String pnr, String reason);

    /**
     * Retrieves all ticket reservations in the system.
     *
     * @return List of all reservations
     */
    List<ReservationEntity> getAllReservations();
}
