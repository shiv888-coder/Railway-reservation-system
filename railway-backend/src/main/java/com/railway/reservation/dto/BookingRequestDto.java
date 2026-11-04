package com.railway.reservation.dto;

import com.railway.reservation.enums.CoachClass;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Transfer Object encapsulating a ticket reservation request payload.
 */
public class BookingRequestDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Train number is required")
    private String trainNumber;

    @NotNull(message = "Journey date is required")
    @FutureOrPresent(message = "Journey date cannot be in the past")
    private LocalDate journeyDate;

    @NotNull(message = "Travel class is required")
    private CoachClass travelClass;

    @NotEmpty(message = "At least one passenger must be specified")
    @Size(max = 6, message = "Maximum 6 passengers allowed per reservation")
    @Valid
    private List<PassengerDto> passengers = new ArrayList<>();

    public BookingRequestDto() {
    }

    public BookingRequestDto(String trainNumber, LocalDate journeyDate, CoachClass travelClass, List<PassengerDto> passengers) {
        this.trainNumber = trainNumber;
        this.journeyDate = journeyDate;
        this.travelClass = travelClass;
        this.passengers = passengers != null ? passengers : new ArrayList<>();
    }

    // --- Getters & Setters ---

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(LocalDate journeyDate) {
        this.journeyDate = journeyDate;
    }

    public CoachClass getTravelClass() {
        return travelClass;
    }

    public void setTravelClass(CoachClass travelClass) {
        this.travelClass = travelClass;
    }

    public List<PassengerDto> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerDto> passengers) {
        this.passengers = passengers;
    }
}
