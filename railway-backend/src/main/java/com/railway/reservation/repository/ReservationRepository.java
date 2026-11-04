package com.railway.reservation.repository;

import com.railway.reservation.entity.ReservationEntity;
import com.railway.reservation.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for ReservationEntity (PNR Master Records).
 *
 * Primary Key: String (10-digit unique PNR)
 */
@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, String> {

    /**
     * Retrieve complete reservation details by 10-digit PNR.
     */
    Optional<ReservationEntity> findByPnr(String pnr);

    /**
     * Check if a PNR already exists.
     */
    boolean existsByPnr(String pnr);

    /**
     * Filter reservations by lifecycle booking status (CONFIRMED, CANCELLED, WAITLIST).
     */
    List<ReservationEntity> findByBookingStatus(BookingStatus bookingStatus);

    /**
     * Find reservations for a specific journey travel date.
     */
    List<ReservationEntity> findByJourneyDate(LocalDate journeyDate);

    /**
     * Find all bookings made for a particular train number.
     */
    List<ReservationEntity> findByTrain_TrainNumber(String trainNumber);

    /**
     * Count reservations by status (used for operational dashboard KPIs).
     */
    long countByBookingStatus(BookingStatus bookingStatus);

    /**
     * Retrieve recent bookings ordered by creation timestamp descending.
     */
    List<ReservationEntity> findAllByOrderByBookedAtDesc();

    /**
     * Search reservations by train and journey date.
     */
    List<ReservationEntity> findByTrain_TrainNumberAndJourneyDate(String trainNumber, LocalDate journeyDate);

    /**
     * Sum total revenue collected from confirmed ticket reservations.
     */
    @Query("SELECT COALESCE(SUM(r.totalFare), 0) FROM ReservationEntity r WHERE r.bookingStatus = :status")
    Double calculateTotalRevenueByStatus(@Param("status") BookingStatus status);
}
