package com.railway.reservation.dto;

import com.railway.reservation.model.Reservation;

import java.io.Serializable;

/**
 * Return result containing confirmed booking details and generated PNR.
 */
public class BookingResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private boolean success;
    private String message;
    private String pnr;
    private Reservation reservation;
    private FareBreakdown fareBreakdown;

    public BookingResult() {
    }

    public BookingResult(boolean success, String message, String pnr, Reservation reservation, FareBreakdown fareBreakdown) {
        this.success = success;
        this.message = message;
        this.pnr = pnr;
        this.reservation = reservation;
        this.fareBreakdown = fareBreakdown;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getPnr() {
        return pnr;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public FareBreakdown getFareBreakdown() {
        return fareBreakdown;
    }
}
