package com.railway.reservation.repository;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.RouteHaltEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for RouteHaltEntity.
 *
 * Primary Key: Long (Halt ID)
 */
@Repository
public interface RouteHaltRepository extends JpaRepository<RouteHaltEntity, Long> {

    /**
     * Find all route halts for a specific train entity, ordered chronologically by stop sequence.
     */
    List<RouteHaltEntity> findByTrainOrderByStopSequenceAsc(BaseTrainEntity train);

    /**
     * Find all route halts for a given train number, ordered by stop sequence.
     */
    List<RouteHaltEntity> findByTrain_TrainNumberOrderByStopSequenceAsc(String trainNumber);

    /**
     * Find all trains that halt at a specific station code.
     */
    List<RouteHaltEntity> findByStation_StationCode(String stationCode);
}
