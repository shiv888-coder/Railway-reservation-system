package com.railway.reservation.service;

import com.railway.reservation.dto.FareBreakdownDto;
import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.enums.CoachClass;

import java.math.BigDecimal;

/**
 * Service interface for railway tariff and fare calculation.
 *
 * OOP Concept: Polymorphism & Strategy Pattern
 * - Dispatches calculateFare calls to polymorphic train subclass instances.
 */
public interface FareCalculationService {

    /**
     * Polymorphically computes total ticket fare for a train journey.
     *
     * @param train Train instance (Rajdhani, Vande Bharat, or Superfast)
     * @param coachClass Requested coach class (e.g. FIRST_AC, THIRD_AC, CHAIR_CAR)
     * @param passengerCount Total number of seats requested
     * @param seniorCount Number of senior citizens eligible for discount
     * @return Total payable fare as BigDecimal
     */
    BigDecimal calculateTotalFare(BaseTrainEntity train, CoachClass coachClass, int passengerCount, int seniorCount);

    /**
     * Generates a detailed itemized fare breakdown (Base Fare, Reservation Fee,
     * Surcharges, Catering, Senior Concessions, GST) for audit and voucher display.
     *
     * @param train Train instance
     * @param coachClass Requested coach class
     * @param passengerCount Total passengers
     * @param seniorCount Senior passengers
     * @return Detailed FareBreakdownDto
     */
    FareBreakdownDto calculateFareBreakdown(BaseTrainEntity train, CoachClass coachClass, int passengerCount, int seniorCount);
}
