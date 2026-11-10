package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;

import java.io.Serializable;
import java.util.Objects;

/**
 * Abstract Base Class representing a passenger train in the Indian Railway network.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Abstraction:
 *    - Marked 'abstract'; cannot be instantiated directly.
 *    - Declares the abstract calculateFare() contract that concrete train subclasses override.
 * 2. Inheritance:
 *    - Serves as the parent class for specialized train categories (Rajdhani, Vande Bharat, Superfast, Mail/Express).
 * 3. Encapsulation:
 *    - Fields are private/protected with validated accessors and mutators.
 * 4. Polymorphism:
 *    - Subclasses dynamically calculate fares based on train operational category and amenities.
 */
public abstract class Train implements Serializable, FareCalculable {

    private static final long serialVersionUID = 1L;

    protected String trainNumber;
    protected String trainName;
    protected TrainType trainType;
    protected String sourceStationCode;
    protected String destinationStationCode;
    protected String departureTime;
    protected String arrivalTime;
    protected String duration;
    protected int distanceKm;
    protected String operatingDays;

    /**
     * Default constructor (Constructor Overloading).
     */
    public Train() {
        this.trainType = TrainType.MAIL_EXPRESS;
        this.operatingDays = "Daily";
    }

    /**
     * Minimal parameterized constructor (Constructor Overloading).
     */
    public Train(String trainNumber, String trainName) {
        this();
        this.trainNumber = trainNumber != null ? trainNumber.trim() : "";
        this.trainName = trainName != null ? trainName.trim() : "";
    }

    /**
     * Full parameterized constructor (Constructor Overloading).
     */
    public Train(String trainNumber, String trainName, TrainType trainType,
                 String sourceStationCode, String destinationStationCode,
                 String departureTime, String arrivalTime, String duration,
                 int distanceKm, String operatingDays) {
        this.trainNumber = trainNumber != null ? trainNumber.trim() : "";
        this.trainName = trainName != null ? trainName.trim() : "";
        this.trainType = trainType != null ? trainType : TrainType.MAIL_EXPRESS;
        this.sourceStationCode = sourceStationCode != null ? sourceStationCode.trim().toUpperCase() : "";
        this.destinationStationCode = destinationStationCode != null ? destinationStationCode.trim().toUpperCase() : "";
        this.departureTime = departureTime != null ? departureTime.trim() : "";
        this.arrivalTime = arrivalTime != null ? arrivalTime.trim() : "";
        this.duration = duration != null ? duration.trim() : "";
        this.distanceKm = distanceKm;
        this.operatingDays = operatingDays != null ? operatingDays.trim() : "Daily";
    }

    /**
     * Polymorphic contract: Subclasses implement dynamic class tariff calculations.
     *
     * @param coachClass Accommodation class (1A, 2A, 3A, SL, CC, EC, 2S)
     * @param distance   Journey distance in kilometers
     * @return Base fare in Indian Rupees (INR)
     */
    public abstract double calculateFare(CoachClass coachClass, double distance);

    /**
     * Category identifier for persistence and UI rendering.
     */
    public abstract String getCategoryName();

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public TrainType getTrainType() {
        return trainType;
    }

    public void setTrainType(TrainType trainType) {
        this.trainType = trainType;
    }

    public String getSourceStationCode() {
        return sourceStationCode;
    }

    public void setSourceStationCode(String sourceStationCode) {
        this.sourceStationCode = sourceStationCode;
    }

    public String getDestinationStationCode() {
        return destinationStationCode;
    }

    public void setDestinationStationCode(String destinationStationCode) {
        this.destinationStationCode = destinationStationCode;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public int getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(int distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getOperatingDays() {
        return operatingDays;
    }

    public void setOperatingDays(String operatingDays) {
        this.operatingDays = operatingDays;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Train train = (Train) o;
        return Objects.equals(trainNumber, train.trainNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(trainNumber);
    }

    @Override
    public String toString() {
        return trainNumber + " - " + trainName + " (" + sourceStationCode + " -> " + destinationStationCode + ")";
    }
}
