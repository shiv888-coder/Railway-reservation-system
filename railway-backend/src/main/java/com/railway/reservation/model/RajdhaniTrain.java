package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;

/**
 * Concrete Subclass: Premier Rajdhani Express.
 * Demonstrates Inheritance and Polymorphic Pricing with included premier catering.
 */
public class RajdhaniTrain extends Train {

    private static final long serialVersionUID = 1L;

    public RajdhaniTrain() {
        super();
        this.trainType = TrainType.RAJDHANI;
    }

    public RajdhaniTrain(String trainNumber, String trainName,
                         String sourceStationCode, String destinationStationCode,
                         String departureTime, String arrivalTime, String duration,
                         int distanceKm, String operatingDays) {
        super(trainNumber, trainName, TrainType.RAJDHANI, sourceStationCode,
              destinationStationCode, departureTime, arrivalTime, duration, distanceKm, operatingDays);
    }

    @Override
    public double calculateFare(CoachClass coachClass, double distance) {
        double dist = distance > 0 ? distance : (distanceKm > 0 ? distanceKm : 1000);
        double ratePerKm;
        double catering;

        switch (coachClass) {
            case FIRST_AC -> {
                ratePerKm = 2.90;
                catering = 450.0;
            }
            case SECOND_AC -> {
                ratePerKm = 1.90;
                catering = 350.0;
            }
            case THIRD_AC -> {
                ratePerKm = 1.35;
                catering = 280.0;
            }
            default -> {
                ratePerKm = 1.35;
                catering = 280.0;
            }
        }
        return Math.round((ratePerKm * dist) + catering);
    }

    @Override
    public String getCategoryName() {
        return "RAJDHANI";
    }
}
