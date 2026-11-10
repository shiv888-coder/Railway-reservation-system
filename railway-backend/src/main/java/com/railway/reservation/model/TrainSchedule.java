package com.railway.reservation.model;

import java.io.Serializable;

/**
 * Entity representing scheduled arrival and departure timings at a station stop.
 */
public class TrainSchedule implements Serializable {

    private static final long serialVersionUID = 1L;

    private int scheduleId;
    private String trainNumber;
    private String stationCode;
    private String arrivalTime;
    private String departureTime;
    private int haltMinutes;
    private int dayNumber;
    private int stopSequence;

    public TrainSchedule() {
    }

    public TrainSchedule(int scheduleId, String trainNumber, String stationCode,
                         String arrivalTime, String departureTime,
                         int haltMinutes, int dayNumber, int stopSequence) {
        this.scheduleId = scheduleId;
        this.trainNumber = trainNumber;
        this.stationCode = stationCode;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.haltMinutes = haltMinutes;
        this.dayNumber = dayNumber;
        this.stopSequence = stopSequence;
    }

    public int getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(int scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getStationCode() {
        return stationCode;
    }

    public void setStationCode(String stationCode) {
        this.stationCode = stationCode;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public int getHaltMinutes() {
        return haltMinutes;
    }

    public void setHaltMinutes(int haltMinutes) {
        this.haltMinutes = haltMinutes;
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public int getStopSequence() {
        return stopSequence;
    }

    public void setStopSequence(int stopSequence) {
        this.stopSequence = stopSequence;
    }
}
