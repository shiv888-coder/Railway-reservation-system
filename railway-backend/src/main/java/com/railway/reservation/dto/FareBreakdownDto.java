package com.railway.reservation.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object representing the itemized financial fare calculation.
 *
 * Uses BigDecimal for all monetary amounts to ensure financial precision.
 */
public class FareBreakdownDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private BigDecimal baseFare = BigDecimal.ZERO;
    private BigDecimal reservationCharge = BigDecimal.ZERO;
    private BigDecimal superfastCharge = BigDecimal.ZERO;
    private BigDecimal cateringCharge = BigDecimal.ZERO;
    private BigDecimal seniorDiscount = BigDecimal.ZERO;
    private BigDecimal gstAmount = BigDecimal.ZERO;
    private BigDecimal totalFare = BigDecimal.ZERO;

    public FareBreakdownDto() {
    }

    public FareBreakdownDto(BigDecimal baseFare, BigDecimal reservationCharge,
                            BigDecimal superfastCharge, BigDecimal cateringCharge,
                            BigDecimal seniorDiscount, BigDecimal gstAmount,
                            BigDecimal totalFare) {
        this.baseFare = baseFare;
        this.reservationCharge = reservationCharge;
        this.superfastCharge = superfastCharge;
        this.cateringCharge = cateringCharge;
        this.seniorDiscount = seniorDiscount;
        this.gstAmount = gstAmount;
        this.totalFare = totalFare;
    }

    // --- Getters & Setters ---

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }

    public BigDecimal getReservationCharge() {
        return reservationCharge;
    }

    public void setReservationCharge(BigDecimal reservationCharge) {
        this.reservationCharge = reservationCharge;
    }

    public BigDecimal getSuperfastCharge() {
        return superfastCharge;
    }

    public void setSuperfastCharge(BigDecimal superfastCharge) {
        this.superfastCharge = superfastCharge;
    }

    public BigDecimal getCateringCharge() {
        return cateringCharge;
    }

    public void setCateringCharge(BigDecimal cateringCharge) {
        this.cateringCharge = cateringCharge;
    }

    public BigDecimal getSeniorDiscount() {
        return seniorDiscount;
    }

    public void setSeniorDiscount(BigDecimal seniorDiscount) {
        this.seniorDiscount = seniorDiscount;
    }

    public BigDecimal getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(BigDecimal gstAmount) {
        this.gstAmount = gstAmount;
    }

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public void setTotalFare(BigDecimal totalFare) {
        this.totalFare = totalFare;
    }
}
