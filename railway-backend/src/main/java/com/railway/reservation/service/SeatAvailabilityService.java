package com.railway.reservation.service;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.model.SeatInventory;

import java.util.List;

/**
 * Service interface for train seat inventory and live availability enquiries.
 */
public interface SeatAvailabilityService {

    int getAvailableSeats(String trainNumber, CoachClass coachClass);

    boolean hasAvailableSeats(String trainNumber, CoachClass coachClass, int count);

    List<SeatInventory> getTrainSeatMatrix(String trainNumber);
}
