package com.railway.reservation.repository;

import com.railway.reservation.entity.StationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for StationEntity.
 *
 * Primary Key: String (Station Code, e.g. "NDLS", "HWH")
 */
@Repository
public interface StationRepository extends JpaRepository<StationEntity, String> {

    /**
     * Retrieve station by its official uppercase station code.
     */
    Optional<StationEntity> findByStationCode(String stationCode);

    /**
     * Check if a station exists by its station code.
     */
    boolean existsByStationCode(String stationCode);

    /**
     * Search stations matching or containing the given name (case-insensitive).
     */
    List<StationEntity> findByStationNameContainingIgnoreCase(String name);

    /**
     * Search stations located within a given city (e.g. "Delhi", "Kolkata").
     */
    List<StationEntity> findByCityIgnoreCase(String city);

    /**
     * List all stations within an Indian Railways administrative zone (e.g. "Northern Railway").
     */
    List<StationEntity> findByZoneIgnoreCase(String zone);
}
