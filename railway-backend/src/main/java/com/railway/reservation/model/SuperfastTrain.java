package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;

/**
 * Concrete Subclass: Superfast / Shatabdi / Duronto Express.
 * Demonstrates standard Superfast surcharge and multi-class tariffs.
 */
public class SuperfastTrain extends Train {

    private static final long serialVersionUID = 1L;

    public SuperfastTrain() {
        super();
        this.trainType = TrainType.SUPERFAST;
    }

    public SuperfastTrain(String trainNumber, String trainName, TrainType trainType,
                          String sourceStationCode, String destinationStationCode,
                          String departureTime, String arrivalTime, String duration,
                          int distanceKm, String operatingDays) {
        super(trainNumber, trainName, trainType, sourceStationCode,
              destinationStationCode, departureTime, arrivalTime, duration, distanceKm, operatingDays);
    }

    @Override
    public double calculateFare(CoachClass coachClass, double distance) {
        double dist = distance > 0 ? distance : (distanceKm > 0 ? distanceKm : 600);
        double ratePerKm;
        double sfCharge;

        switch (coachClass) {
            case FIRST_AC -> {
                ratePerKm = 2.40;
                sfCharge = 75.0;
            }
            case SECOND_AC -> {
                ratePerKm = 1.50;
                sfCharge = 45.0;
            }
            case THIRD_AC -> {
                ratePerKm = 1.05;
                sfCharge = 45.0;
            }
            case EXECUTIVE_CHAIR -> {
                ratePerKm = 2.10;
                sfCharge = 45.0;
            }
            case CHAIR_CAR -> {
                ratePerKm = 0.90;
                sfCharge = 45.0;
            }
            case SECOND_SEATING -> {
                ratePerKm = 0.28;
                sfCharge = 15.0;
            }
            case SLEEPER -> {
                ratePerKm = 0.45;
                sfCharge = 30.0;
            }
            default -> {
                ratePerKm = 0.45;
                sfCharge = 30.0;
            }
        }
        return Math.round((ratePerKm * dist) + sfCharge);
    }

    @Override
    public String getCategoryName() {
        return "SUPERFAST";
    }
}
