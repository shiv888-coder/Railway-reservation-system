package com.railway.reservation.service.impl;

import com.railway.reservation.dao.SeatInventoryDAO;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.model.SeatInventory;
import com.railway.reservation.service.SeatAvailabilityService;

import java.util.List;

/**
 * Service implementation for Seat Availability checks.
 */
public class SeatAvailabilityServiceImpl implements SeatAvailabilityService {

    private final SeatInventoryDAO inventoryDAO;

    public SeatAvailabilityServiceImpl() {
        this(new SeatInventoryDAO());
    }

    public SeatAvailabilityServiceImpl(SeatInventoryDAO inventoryDAO) {
        this.inventoryDAO = inventoryDAO;
    }

    @Override
    public int getAvailableSeats(String trainNumber, CoachClass coachClass) {
        if (trainNumber == null || coachClass == null) return 0;
        return inventoryDAO.getAvailableSeats(trainNumber.trim(), coachClass);
    }

    @Override
    public boolean hasAvailableSeats(String trainNumber, CoachClass coachClass, int count) {
        if (count <= 0) return true;
        return getAvailableSeats(trainNumber, coachClass) >= count;
    }

    @Override
    public List<SeatInventory> getTrainSeatMatrix(String trainNumber) {
        if (trainNumber == null) return List.of();
        return inventoryDAO.getInventoryForTrain(trainNumber.trim());
    }
}
