package com.railway.reservation.model;

import java.io.Serializable;

/**
 * Audit slip representing a processed reservation cancellation and refund.
 */
public class CancellationSlip implements Serializable {

    private static final long serialVersionUID = 1L;

    private int cancellationId;
    private String pnr;
    private String cancelledAt;
    private double cancellationFee;
    private double refundAmount;
    private String cancellationReason;
    private String refundReferenceId;

    public CancellationSlip() {
    }

    public CancellationSlip(int cancellationId, String pnr, String cancelledAt,
                            double cancellationFee, double refundAmount,
                            String cancellationReason, String refundReferenceId) {
        this.cancellationId = cancellationId;
        this.pnr = pnr;
        this.cancelledAt = cancelledAt;
        this.cancellationFee = cancellationFee;
        this.refundAmount = refundAmount;
        this.cancellationReason = cancellationReason;
        this.refundReferenceId = refundReferenceId;
    }

    public int getCancellationId() {
        return cancellationId;
    }

    public void setCancellationId(int cancellationId) {
        this.cancellationId = cancellationId;
    }

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public String getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(String cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public double getCancellationFee() {
        return cancellationFee;
    }

    public void setCancellationFee(double cancellationFee) {
        this.cancellationFee = cancellationFee;
    }

    public double getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(double refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getRefundReferenceId() {
        return refundReferenceId;
    }

    public void setRefundReferenceId(String refundReferenceId) {
        this.refundReferenceId = refundReferenceId;
    }
}
