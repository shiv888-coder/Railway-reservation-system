package com.railway.reservation.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Domain entity representing an Indian Railway station.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * - Encapsulation: Private state variables accessed via public getters/setters.
 * - Value equality: Overrides equals() and hashCode() based on station code.
 */
public class Station implements Serializable {

    private static final long serialVersionUID = 1L;

    private String stationCode;
    private String stationName;
    private String city;
    private String state;
    private String zone;
    private String category;

    public Station() {
    }

    public Station(String stationCode, String stationName, String city, String state, String zone, String category) {
        this.stationCode = stationCode != null ? stationCode.trim().toUpperCase() : "";
        this.stationName = stationName != null ? stationName.trim() : "";
        this.city = city != null ? city.trim() : "";
        this.state = state != null ? state.trim() : "";
        this.zone = zone != null ? zone.trim() : "";
        this.category = category != null ? category.trim() : "NSG-4";
    }

    public String getStationCode() {
        return stationCode;
    }

    public void setStationCode(String stationCode) {
        this.stationCode = stationCode != null ? stationCode.trim().toUpperCase() : "";
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Station station = (Station) o;
        return Objects.equals(stationCode, station.stationCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stationCode);
    }

    @Override
    public String toString() {
        return stationCode + " - " + stationName + " (" + city + ", " + state + ")";
    }
}
