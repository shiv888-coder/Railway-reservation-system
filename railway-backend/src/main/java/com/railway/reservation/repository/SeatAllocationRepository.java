package com.railway.reservation.repository;

import com.railway.reservation.entity.PassengerEntity;
import com.railway.reservation.entity.ReservationEntity;
import com.railway.reservation.entity.SeatAllocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for SeatAllocationEntity.
 *
 * Primary Key: Long (Allocation ID)
 */
@Repository
public interface SeatAllocationRepository extends JpaRepository<SeatAllocationEntity, Long> {

    /**
     * Find all seat allocations for a given reservation entity.
     */
    List<SeatAllocationEntity> findByReservation(ReservationEntity reservation);

    /**
     * Find all seat allocations for a 10-digit PNR.
     */
    List<SeatAllocationEntity> findByReservation_Pnr(String pnr);

    /**
     * Find all seat allocations associated with a particular passenger.
     */
    List<SeatAllocationEntity> findByPassenger(PassengerEntity passenger);

    /**
     * Find allocations by passenger ID.
     */
    List<SeatAllocationEntity> findByPassenger_PassengerId(Long passengerId);
}
