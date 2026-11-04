package com.railway.reservation.dto;

import com.railway.reservation.enums.CoachClass;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;

/**
 * Request payload for POST /api/booking/calculate-fare
 */
public class FareCalculationRequestDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Train number is required")
    private String trainNumber;

    @NotNull(message = "Coach class is required")
    private CoachClass coachClass;

    @Min(value = 1, message = "Passenger count must be at least 1")
    private int passengerCount = 1;

    @Min(value = 0, message = "Senior citizen count cannot be negative")
    private int seniorCount = 0;

    public FareCalculationRequestDto() {
    }

    public FareCalculationRequestDto(String trainNumber, CoachClass coachClass, int passengerCount, int seniorCount) {
        this.trainNumber = trainNumber;
        this.coachClass = coachClass;
        this.passengerCount = passengerCount;
        this.seniorCount = seniorCount;
    }

    // --- Getters & Setters ---

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

    public int getPassengerCount() {
        return passengerCount;
    }

    public void setPassengerCount(int passengerCount) {
        this.passengerCount = passengerCount;
    }

    public int getSeniorCount() {
        return seniorCount;
    }

    public void setSeniorCount(int seniorCount) {
        this.seniorCount = seniorCount;
    }
}
