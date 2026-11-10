package com.railway.reservation.service;

import com.railway.reservation.dto.FareBreakdown;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.model.Passenger;

import java.util.List;

/**
 * Service interface for dynamic and database-backed railway fare calculations.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * - Method Overloading: Provides overloaded calculateFare() signatures.
 */
public interface FareCalculationService {

    /**
     * Overloaded method for standard passenger counts without specific passenger age breakdowns.
     */
    FareBreakdown calculateFare(String trainNumber, CoachClass coachClass, int passengerCount);

    /**
     * Overloaded method factoring in origin, destination, and passenger demographics (e.g. senior citizen discounts).
     */
    FareBreakdown calculateFare(String trainNumber, CoachClass coachClass,
                                String sourceStationCode, String destinationStationCode,
                                List<Passenger> passengers);
}
