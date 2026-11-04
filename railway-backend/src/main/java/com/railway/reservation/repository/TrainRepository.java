package com.railway.reservation.repository;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.StationEntity;
import com.railway.reservation.enums.TrainType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for BaseTrainEntity and its polymorphic subclasses
 * (RajdhaniTrainEntity, VandeBharatTrainEntity, SuperfastTrainEntity).
 *
 * Primary Key: String (Train Number, e.g. "12301")
 */
@Repository
public interface TrainRepository extends JpaRepository<BaseTrainEntity, String> {

    /**
     * Find train by its exact 5-digit train number.
     * Returns an Optional to safely handle absent records without NullPointerExceptions.
     */
    Optional<BaseTrainEntity> findByTrainNumber(String trainNumber);

    /**
     * Check if a train number is already registered in the system.
     */
    boolean existsByTrainNumber(String trainNumber);

    /**
     * Find trains originating from a given source station and terminating at a destination station.
     */
    List<BaseTrainEntity> findBySourceStationAndDestinationStation(StationEntity sourceStation, StationEntity destinationStation);

    /**
     * Derived query to search trains by origin and destination station codes.
     */
    List<BaseTrainEntity> findBySourceStation_StationCodeAndDestinationStation_StationCode(
            String sourceStationCode, String destinationStationCode);

    /**
     * Find all trains belonging to a specific operational category (e.g. RAJDHANI, VANDE_BHARAT).
     */
    List<BaseTrainEntity> findByTrainType(TrainType trainType);

    /**
     * Case-insensitive partial name search (e.g. "Rajdhani" -> Howrah Rajdhani, Mumbai Rajdhani).
     */
    List<BaseTrainEntity> findByTrainNameContainingIgnoreCase(String keyword);

    /**
     * Custom JPQL query to search trains connecting through station codes or names.
     */
    @Query("SELECT t FROM BaseTrainEntity t WHERE " +
           "LOWER(t.sourceStation.stationCode) = LOWER(:source) AND " +
           "LOWER(t.destinationStation.stationCode) = LOWER(:destination)")
    List<BaseTrainEntity> searchDirectTrains(
            @Param("source") String source,
            @Param("destination") String destination
    );
}
