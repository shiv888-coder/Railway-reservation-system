package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;

/**
 * Functional contract for entities capable of evaluating journey tariffs.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * - Interface: Defines a pure abstract contract without implementation details.
 * - Runtime Polymorphism: Different train types implement this contract differently.
 */
public interface FareCalculable {

    /**
     * Calculates the base passenger fare for a given accommodation class and journey distance.
     *
     * @param coachClass The travel class (e.g. 1A, 2A, 3A, SL, CC, EC, 2S)
     * @param distanceKm The journey distance in kilometers
     * @return The base fare in Indian Rupees (INR)
     */
    double calculateFare(CoachClass coachClass, double distanceKm);
}
