package com.railway.reservation.model;

import java.io.Serializable;

/**
 * Entity representing a route stop along a train's journey.
 */
public class TrainRoute implements Serializable {

    private static final long serialVersionUID = 1L;

    private int routeId;
    private String trainNumber;
    private String stationCode;
    private int stopSequence;
    private int distanceKm;

    public TrainRoute() {
    }

    public TrainRoute(int routeId, String trainNumber, String stationCode, int stopSequence, int distanceKm) {
        this.routeId = routeId;
        this.trainNumber = trainNumber;
        this.stationCode = stationCode;
        this.stopSequence = stopSequence;
        this.distanceKm = distanceKm;
    }

    public int getRouteId() {
        return routeId;
    }

    public void setRouteId(int routeId) {
        this.routeId = routeId;
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

    public int getStopSequence() {
        return stopSequence;
    }

    public void setStopSequence(int stopSequence) {
        this.stopSequence = stopSequence;
    }

    public int getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(int distanceKm) {
        this.distanceKm = distanceKm;
    }
}
