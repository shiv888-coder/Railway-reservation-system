package com.railway.reservation.service;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.model.Train;
import com.railway.reservation.model.TrainRoute;
import com.railway.reservation.model.TrainSchedule;

import java.util.List;

/**
 * Service interface for train schedule exploration, route lookups, and timetable search.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * - Method Overloading: Provides multiple overloaded searchTrains() signatures.
 */
public interface TrainSearchService {

    Train getTrainByNumber(String trainNumber);

    List<Train> getAllTrains();

    /**
     * Basic train search by origin and destination station codes.
     */
    List<Train> searchTrains(String sourceStationCode, String destinationStationCode);

    /**
     * Overloaded search factoring in journey date and train operating days.
     */
    List<Train> searchTrains(String sourceStationCode, String destinationStationCode, String journeyDate);

    /**
     * Overloaded search factoring in journey date and travel class availability.
     */
    List<Train> searchTrains(String sourceStationCode, String destinationStationCode, String journeyDate, CoachClass coachClass);

    List<TrainRoute> getTrainRoute(String trainNumber);

    List<TrainSchedule> getTrainSchedule(String trainNumber);

    int calculateDistance(String trainNumber, String sourceStationCode, String destinationStationCode);
}
