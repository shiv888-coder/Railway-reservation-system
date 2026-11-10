package com.railway.reservation.model;

import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Reservation master entity representing a ticket booking with a unique 10-digit PNR.
 */
public class Reservation implements Serializable {

    private static final long serialVersionUID = 1L;

    private String pnr;
    private String trainNumber;
    private String sourceStationCode;
    private String destinationStationCode;
    private String journeyDate;
    private CoachClass coachClass;
    private BookingStatus bookingStatus;

    // Fare breakdown
    private double baseFare;
    private double reservationCharge;
    private double superfastCharge;
    private double cateringCharge;
    private double gstAmount;
    private double seniorDiscount;
    private double totalFare;

    private String bookedAt;
    private List<ReservationPassenger> passengers = new ArrayList<>();

    public Reservation() {
    }

    public Reservation(String pnr, String trainNumber, String sourceStationCode,
                       String destinationStationCode, String journeyDate,
                       CoachClass coachClass, BookingStatus bookingStatus,
                       double baseFare, double reservationCharge, double superfastCharge,
                       double cateringCharge, double gstAmount, double seniorDiscount,
                       double totalFare, String bookedAt) {
        this.pnr = pnr;
        this.trainNumber = trainNumber;
        this.sourceStationCode = sourceStationCode;
        this.destinationStationCode = destinationStationCode;
        this.journeyDate = journeyDate;
        this.coachClass = coachClass;
        this.bookingStatus = bookingStatus;
        this.baseFare = baseFare;
        this.reservationCharge = reservationCharge;
        this.superfastCharge = superfastCharge;
        this.cateringCharge = cateringCharge;
        this.gstAmount = gstAmount;
        this.seniorDiscount = seniorDiscount;
        this.totalFare = totalFare;
        this.bookedAt = bookedAt;
    }

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getSourceStationCode() {
        return sourceStationCode;
    }

    public void setSourceStationCode(String sourceStationCode) {
        this.sourceStationCode = sourceStationCode;
    }

    public String getDestinationStationCode() {
        return destinationStationCode;
    }

    public void setDestinationStationCode(String destinationStationCode) {
        this.destinationStationCode = destinationStationCode;
    }

    public String getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(String journeyDate) {
        this.journeyDate = journeyDate;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(double baseFare) {
        this.baseFare = baseFare;
    }

    public double getReservationCharge() {
        return reservationCharge;
    }

    public void setReservationCharge(double reservationCharge) {
        this.reservationCharge = reservationCharge;
    }

    public double getSuperfastCharge() {
        return superfastCharge;
    }

    public void setSuperfastCharge(double superfastCharge) {
        this.superfastCharge = superfastCharge;
    }

    public double getCateringCharge() {
        return cateringCharge;
    }

    public void setCateringCharge(double cateringCharge) {
        this.cateringCharge = cateringCharge;
    }

    public double getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(double gstAmount) {
        this.gstAmount = gstAmount;
    }

    public double getSeniorDiscount() {
        return seniorDiscount;
    }

    public void setSeniorDiscount(double seniorDiscount) {
        this.seniorDiscount = seniorDiscount;
    }

    public double getTotalFare() {
        return totalFare;
    }

    public void setTotalFare(double totalFare) {
        this.totalFare = totalFare;
    }

    public String getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(String bookedAt) {
        this.bookedAt = bookedAt;
    }

    public List<ReservationPassenger> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<ReservationPassenger> passengers) {
        this.passengers = passengers;
    }
}
