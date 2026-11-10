package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;

/**
 * Concrete Subclass: Standard Mail / Express / Passenger / MEMU trains.
 */
public class MailExpressTrain extends Train {

    private static final long serialVersionUID = 1L;

    public MailExpressTrain() {
        super();
        this.trainType = TrainType.MAIL_EXPRESS;
    }

    public MailExpressTrain(String trainNumber, String trainName, TrainType trainType,
                            String sourceStationCode, String destinationStationCode,
                            String departureTime, String arrivalTime, String duration,
                            int distanceKm, String operatingDays) {
        super(trainNumber, trainName, trainType, sourceStationCode,
              destinationStationCode, departureTime, arrivalTime, duration, distanceKm, operatingDays);
    }

    @Override
    public double calculateFare(CoachClass coachClass, double distance) {
        double dist = distance > 0 ? distance : (distanceKm > 0 ? distanceKm : 400);
        double ratePerKm;

        switch (coachClass) {
            case FIRST_AC -> ratePerKm = 2.10;
            case SECOND_AC -> ratePerKm = 1.35;
            case THIRD_AC -> ratePerKm = 0.95;
            case CHAIR_CAR -> ratePerKm = 0.80;
            case SECOND_SEATING -> ratePerKm = 0.22;
            case SLEEPER -> ratePerKm = 0.38;
            default -> ratePerKm = 0.38;
        }
        return Math.round(ratePerKm * dist);
    }

    @Override
    public String getCategoryName() {
        return "MAIL_EXPRESS";
    }
}
