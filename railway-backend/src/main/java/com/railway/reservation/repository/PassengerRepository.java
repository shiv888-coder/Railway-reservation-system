package com.railway.reservation.repository;

import com.railway.reservation.entity.PassengerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for PassengerEntity.
 *
 * Primary Key: Long (Passenger ID)
 */
@Repository
public interface PassengerRepository extends JpaRepository<PassengerEntity, Long> {

    /**
     * Find a registered passenger by contact phone number.
     */
    Optional<PassengerEntity> findByPhone(String phone);

    /**
     * Find a passenger by email address.
     */
    Optional<PassengerEntity> findByEmailIgnoreCase(String email);

    /**
     * Check if an email address is already registered in the directory.
     */
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Search passengers by full name (case-insensitive partial match).
     */
    List<PassengerEntity> findByFullNameContainingIgnoreCase(String nameKeyword);

    /**
     * Find passenger by government ID proof number.
     */
    Optional<PassengerEntity> findByIdProofNumber(String idProofNumber);
}
