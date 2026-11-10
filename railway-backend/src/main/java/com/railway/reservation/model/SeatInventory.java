package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;

import java.io.Serializable;

/**
 * Entity tracking total seats and live remaining availability for each train and class.
 */
public class SeatInventory implements Serializable {

    private static final long serialVersionUID = 1L;

    private int inventoryId;
    private String trainNumber;
    private CoachClass coachClass;
    private int totalSeats;
    private int availableSeats;

    public SeatInventory() {
    }

    public SeatInventory(int inventoryId, String trainNumber, CoachClass coachClass, int totalSeats, int availableSeats) {
        this.inventoryId = inventoryId;
        this.trainNumber = trainNumber;
        this.coachClass = coachClass;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
    }

    public int getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(int inventoryId) {
        this.inventoryId = inventoryId;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }
}
