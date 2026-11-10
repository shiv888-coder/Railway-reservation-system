package com.railway.reservation.model;

import java.io.Serializable;

/**
 * Entity linking a passenger to a reservation with assigned coach, berth number, and berth type.
 */
public class ReservationPassenger implements Serializable {

    private static final long serialVersionUID = 1L;

    private int id;
    private String pnr;
    private int passengerId;
    private String coachNumber;
    private int berthNumber;
    private String berthType;
    private double fareCharged;

    // Transient reference for UI convenience
    private Passenger passenger;

    public ReservationPassenger() {
    }

    public ReservationPassenger(int id, String pnr, int passengerId,
                                String coachNumber, int berthNumber,
                                String berthType, double fareCharged) {
        this.id = id;
        this.pnr = pnr;
        this.passengerId = passengerId;
        this.coachNumber = coachNumber;
        this.berthNumber = berthNumber;
        this.berthType = berthType;
        this.fareCharged = fareCharged;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public int getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(int passengerId) {
        this.passengerId = passengerId;
    }

    public String getCoachNumber() {
        return coachNumber;
    }

    public void setCoachNumber(String coachNumber) {
        this.coachNumber = coachNumber;
    }

    public int getBerthNumber() {
        return berthNumber;
    }

    public void setBerthNumber(int berthNumber) {
        this.berthNumber = berthNumber;
    }

    public String getBerthType() {
        return berthType;
    }

    public void setBerthType(String berthType) {
        this.berthType = berthType;
    }

    public double getFareCharged() {
        return fareCharged;
    }

    public void setFareCharged(double fareCharged) {
        this.fareCharged = fareCharged;
    }

    public Passenger getPassenger() {
        return passenger;
    }

    public void setPassenger(Passenger passenger) {
        this.passenger = passenger;
    }
}
