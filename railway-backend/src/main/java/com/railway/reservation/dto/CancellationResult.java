package com.railway.reservation.dto;

import com.railway.reservation.model.CancellationSlip;

import java.io.Serializable;

/**
 * Return result for ticket cancellation voucher and refund confirmation.
 */
public class CancellationResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private boolean success;
    private String message;
    private String pnr;
    private CancellationSlip slip;
    private int seatsRestored;

    public CancellationResult() {
    }

    public CancellationResult(boolean success, String message, String pnr, CancellationSlip slip, int seatsRestored) {
        this.success = success;
        this.message = message;
        this.pnr = pnr;
        this.slip = slip;
        this.seatsRestored = seatsRestored;
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

    public CancellationSlip getSlip() {
        return slip;
    }

    public CancellationSlip getCancellationSlip() {
        return slip;
    }

    public int getSeatsRestored() {
        return seatsRestored;
    }
}
