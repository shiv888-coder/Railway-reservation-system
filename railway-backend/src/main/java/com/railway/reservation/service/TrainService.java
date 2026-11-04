package com.railway.reservation.service;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.RouteHaltEntity;
import com.railway.reservation.enums.CoachClass;

import java.util.List;

/**
 * Service interface for train scheduling, timetable lookup, and seat inventory queries.
 *
 * OOP Concept: Abstraction & Interface-Based Programming
 * - Defines the contract for train operations without exposing implementation details.
 */
public interface TrainService {

    /**
     * Search trains operating directly between origin and destination stations.
     *
     * @param sourceStationCode 2-5 letter station code (e.g. "NDLS")
     * @param destinationStationCode 2-5 letter station code (e.g. "HWH")
     * @return List of matching train entities
     */
    List<BaseTrainEntity> searchTrains(String sourceStationCode, String destinationStationCode);

    /**
     * Retrieve full train details by its unique train number.
     *
     * @param trainNumber 5-digit train number (e.g. "12301")
     * @return BaseTrainEntity (or specialized subclass: Rajdhani, Vande Bharat, Superfast)
     */
    BaseTrainEntity getTrainByNumber(String trainNumber);

    /**
     * Retrieve all scheduled route stops/halts for a train in ascending stop sequence order.
     *
     * @param trainNumber 5-digit train number
     * @return Chronologically ordered list of route halts
     */
    List<RouteHaltEntity> getRouteHalts(String trainNumber);

    /**
     * Check current available seats for a train and travel coach class.
     *
     * @param trainNumber 5-digit train number
     * @param coachClass Requested coach class (e.g. THIRD_AC, CHAIR_CAR)
     * @return Number of available seats
     */
    int getAvailableSeats(String trainNumber, CoachClass coachClass);

    /**
     * Retrieve all trains registered in the system.
     *
     * @return List of all trains
     */
    List<BaseTrainEntity> getAllTrains();

    /**
     * Retrieve all registered railway stations.
     *
     * @return List of all stations
     */
    List<com.railway.reservation.entity.StationEntity> getAllStations();

    /**
     * Retrieve a station by its official station code.
     *
     * @param stationCode 2-5 letter station code (e.g. "NDLS")
     * @return StationEntity
     */
    com.railway.reservation.entity.StationEntity getStationByCode(String stationCode);
}
