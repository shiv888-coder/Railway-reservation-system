package com.railway.reservation.repository;

import com.railway.reservation.entity.CancellationSlipEntity;
import com.railway.reservation.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for CancellationSlipEntity (Audit Vouchers & Refunds).
 *
 * Primary Key: Long (Slip ID)
 */
@Repository
public interface CancellationSlipRepository extends JpaRepository<CancellationSlipEntity, Long> {

    /**
     * Find cancellation slip for a reservation entity.
     */
    Optional<CancellationSlipEntity> findByReservation(ReservationEntity reservation);

    /**
     * Find cancellation slip by 10-digit PNR.
     */
    Optional<CancellationSlipEntity> findByReservation_Pnr(String pnr);

    /**
     * Find cancellation slip by unique refund reference ID (e.g. "REF-8492017420").
     */
    Optional<CancellationSlipEntity> findByRefundReferenceId(String refundReferenceId);

    /**
     * Check if a refund reference ID already exists.
     */
    boolean existsByRefundReferenceId(String refundReferenceId);
}
