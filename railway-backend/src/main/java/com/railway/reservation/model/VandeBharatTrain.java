package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;

/**
 * Concrete Subclass: Vande Bharat Semi-High-Speed Express.
 * Demonstrates Inheritance and Chair Car/Executive pricing.
 */
public class VandeBharatTrain extends Train {

    private static final long serialVersionUID = 1L;

    public VandeBharatTrain() {
        super();
        this.trainType = TrainType.VANDE_BHARAT;
    }

    public VandeBharatTrain(String trainNumber, String trainName,
                            String sourceStationCode, String destinationStationCode,
                            String departureTime, String arrivalTime, String duration,
                            int distanceKm, String operatingDays) {
        super(trainNumber, trainName, TrainType.VANDE_BHARAT, sourceStationCode,
              destinationStationCode, departureTime, arrivalTime, duration, distanceKm, operatingDays);
    }

    @Override
    public double calculateFare(CoachClass coachClass, double distance) {
        double dist = distance > 0 ? distance : (distanceKm > 0 ? distanceKm : 500);
        double ratePerKm;
        double catering = 250.0;

        if (coachClass == CoachClass.EXECUTIVE_CHAIR) {
            ratePerKm = 3.20;
            catering = 350.0;
        } else {
            ratePerKm = 1.70; // Standard Chair Car (CC)
        }
        return Math.round((ratePerKm * dist) + catering);
    }

    @Override
    public String getCategoryName() {
        return "VANDE_BHARAT";
    }
}
