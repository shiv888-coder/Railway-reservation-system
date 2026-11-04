package com.railway.reservation.dto;

import java.io.Serializable;

/**
 * Request payload for POST /api/reservations/{pnr}/cancel
 */
public class CancellationRequestDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String pnr;
    private String reason;

    public CancellationRequestDto() {
    }

    public CancellationRequestDto(String reason) {
        this.reason = reason;
    }

    public CancellationRequestDto(String pnr, String reason) {
        this.pnr = pnr;
        this.reason = reason;
    }

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
