package com.railway.reservation.dto;

import com.railway.reservation.enums.CoachClass;

import java.io.Serializable;

/**
 * Encapsulates itemized fare breakdown calculated for a booking.
 */
public class FareBreakdown implements Serializable {

    private static final long serialVersionUID = 1L;

    private String trainNumber;
    private CoachClass coachClass;
    private int passengerCount;
    private int seniorCitizenCount;
    private double baseFare;
    private double reservationCharge;
    private double superfastCharge;
    private double cateringCharge;
    private double gstAmount;
    private double seniorDiscount;
    private double totalFare;

    public FareBreakdown() {
    }

    public FareBreakdown(String trainNumber, CoachClass coachClass, int passengerCount, int seniorCitizenCount,
                         double baseFare, double reservationCharge, double superfastCharge,
                         double cateringCharge, double gstAmount, double seniorDiscount, double totalFare) {
        this.trainNumber = trainNumber;
        this.coachClass = coachClass;
        this.passengerCount = passengerCount;
        this.seniorCitizenCount = seniorCitizenCount;
        this.baseFare = baseFare;
        this.reservationCharge = reservationCharge;
        this.superfastCharge = superfastCharge;
        this.cateringCharge = cateringCharge;
        this.gstAmount = gstAmount;
        this.seniorDiscount = seniorDiscount;
        this.totalFare = totalFare;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public int getPassengerCount() {
        return passengerCount;
    }

    public int getSeniorCitizenCount() {
        return seniorCitizenCount;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public double getReservationCharge() {
        return reservationCharge;
    }

    public double getSuperfastCharge() {
        return superfastCharge;
    }

    public double getCateringCharge() {
        return cateringCharge;
    }

    public double getGstAmount() {
        return gstAmount;
    }

    public double getSeniorDiscount() {
        return seniorDiscount;
    }

    public double getTotalFare() {
        return totalFare;
    }

    @Override
    public String toString() {
        return String.format("FareBreakdown[Base=₹%.2f, Res=₹%.2f, SF=₹%.2f, Catering=₹%.2f, GST=₹%.2f, SeniorDiscount=-₹%.2f, Total=₹%.2f]",
                baseFare, reservationCharge, superfastCharge, cateringCharge, gstAmount, seniorDiscount, totalFare);
    }
}
