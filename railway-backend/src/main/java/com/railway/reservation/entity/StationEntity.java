package com.railway.reservation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.Objects;

/**
 * Entity representing a Railway Station in the national railway network.
 *
 * OOP Concept: Encapsulation & Domain Abstraction
 * - Uses private fields with validated getters and setters.
 * - Implements Serializable for standard enterprise Java entity portability.
 */
@Entity
@Table(name = "stations")
public class StationEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key: 2 to 5 letter Station Code (e.g. "NDLS", "HWH", "CSMT")
     */
    @Id
    @Column(name = "station_code", length = 10, nullable = false, updatable = false)
    @NotBlank(message = "Station code cannot be blank")
    @Size(min = 2, max = 10, message = "Station code must be between 2 and 10 characters")
    private String stationCode;

    @Column(name = "station_name", length = 100, nullable = false)
    @NotBlank(message = "Station name is required")
    private String stationName;

    @Column(name = "city", length = 80, nullable = false)
    @NotBlank(message = "City is required")
    private String city;

    @Column(name = "state", length = 80, nullable = false)
    @NotBlank(message = "State is required")
    private String state;

    @Column(name = "zone", length = 60, nullable = false)
    @NotBlank(message = "Railway Zone is required")
    private String zone;

    /**
     * Default No-Argument Constructor (Required by JPA / Hibernate)
     */
    public StationEntity() {
    }

    /**
     * Parameterized Constructor (OOP Object Instantiation)
     */
    public StationEntity(String stationCode, String stationName, String city, String state, String zone) {
        this.stationCode = stationCode != null ? stationCode.toUpperCase().trim() : null;
        this.stationName = stationName;
        this.city = city;
        this.state = state;
        this.zone = zone;
    }

    // --- Getters and Setters (Encapsulation) ---

    public String getStationCode() {
        return stationCode;
    }

    public void setStationCode(String stationCode) {
        this.stationCode = stationCode != null ? stationCode.toUpperCase().trim() : null;
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

    /**
     * Convenience display string method
     */
    public String getDisplayName() {
        return this.stationName + " (" + this.stationCode + ") - " + this.city;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StationEntity that = (StationEntity) o;
        return Objects.equals(stationCode, that.stationCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stationCode);
    }

    @Override
    public String toString() {
        return "StationEntity{" +
                "code='" + stationCode + '\'' +
                ", name='" + stationName + '\'' +
                ", city='" + city + '\'' +
                '}';
    }
}
