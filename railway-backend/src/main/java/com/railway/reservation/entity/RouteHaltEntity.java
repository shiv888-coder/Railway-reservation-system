package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.io.Serializable;
import java.util.Objects;

/**
 * Entity representing an intermediate or terminal scheduled halt for a train route.
 *
 * OOP Concept: Composition & Association
 * - Connects a BaseTrainEntity to a StationEntity with arrival/departure timestamps.
 */
@Entity
@Table(name = "route_halts")
public class RouteHaltEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "halt_id")
    private Long haltId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_number", nullable = false)
    @JsonBackReference(value = "train-halts")
    private BaseTrainEntity train;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "station_code", nullable = false)
    @NotNull(message = "Halt station is required")
    private StationEntity station;

    @Column(name = "arrival_time", length = 15, nullable = false)
    private String arrivalTime;

    @Column(name = "departure_time", length = 15, nullable = false)
    private String departureTime;

    @Column(name = "halt_minutes", nullable = false)
    private int haltMinutes;

    @Column(name = "distance_km", nullable = false)
    private int distanceKm;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(name = "stop_sequence", nullable = false)
    private int stopSequence;

    public RouteHaltEntity() {
    }

    public RouteHaltEntity(BaseTrainEntity train, StationEntity station,
                           String arrivalTime, String departureTime,
                           int haltMinutes, int distanceKm, int dayNumber, int stopSequence) {
        this.train = train;
        this.station = station;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.haltMinutes = haltMinutes;
        this.distanceKm = distanceKm;
        this.dayNumber = dayNumber;
        this.stopSequence = stopSequence;
    }

    // --- Getters & Setters ---

    public Long getHaltId() {
        return haltId;
    }

    public void setHaltId(Long haltId) {
        this.haltId = haltId;
    }

    public BaseTrainEntity getTrain() {
        return train;
    }

    public void setTrain(BaseTrainEntity train) {
        this.train = train;
    }

    public StationEntity getStation() {
        return station;
    }

    public void setStation(StationEntity station) {
        this.station = station;
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

    public int getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(int distanceKm) {
        this.distanceKm = distanceKm;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RouteHaltEntity that = (RouteHaltEntity) o;
        return Objects.equals(haltId, that.haltId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(haltId);
    }
}
