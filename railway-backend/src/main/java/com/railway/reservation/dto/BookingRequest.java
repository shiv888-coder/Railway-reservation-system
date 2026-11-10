package com.railway.reservation.dto;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.model.Passenger;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates client request parameters for booking a multi-passenger ticket.
 */
public class BookingRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private String trainNumber;
    private String sourceStationCode;
    private String destinationStationCode;
    private String journeyDate;
    private CoachClass coachClass;
    private List<Passenger> passengers = new ArrayList<>();

    public BookingRequest() {
    }

    public BookingRequest(String trainNumber, String sourceStationCode, String destinationStationCode,
                          String journeyDate, CoachClass coachClass, List<Passenger> passengers) {
        this.trainNumber = trainNumber;
        this.sourceStationCode = sourceStationCode;
        this.destinationStationCode = destinationStationCode;
        this.journeyDate = journeyDate;
        this.coachClass = coachClass;
        if (passengers != null) {
            this.passengers.addAll(passengers);
        }
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
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

    public String getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(String journeyDate) {
        this.journeyDate = journeyDate;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public List<Passenger> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<Passenger> passengers) {
        this.passengers = passengers;
    }

    public void addPassenger(Passenger passenger) {
        if (passenger != null) {
            this.passengers.add(passenger);
        }
    }
}
