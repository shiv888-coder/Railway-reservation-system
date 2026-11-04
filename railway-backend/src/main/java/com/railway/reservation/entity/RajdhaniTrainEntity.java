package com.railway.reservation.entity;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;

/**
 * Concrete Entity representing a Rajdhani Express Train.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Inheritance:
 *    - Extends BaseTrainEntity, inheriting all routing, timetable, and station mapping properties.
 *
 * 2. Polymorphism (Method Overriding):
 *    - Overrides calculateFare() with the specialized Rajdhani tariff structure:
 *      a) Mandatory inclusive gourmet dining and catering charges.
 *      b) Premier high-speed corridor surcharge.
 *      c) Senior citizen concession.
 *      d) 5% GST on fully air-conditioned transit.
 */
@Entity
@DiscriminatorValue("RAJDHANI")
public class RajdhaniTrainEntity extends BaseTrainEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Default No-Arg Constructor (Required by JPA)
     */
    public RajdhaniTrainEntity() {
        super();
        this.trainType = TrainType.RAJDHANI;
    }

    /**
     * Parameterized Constructor (Invokes super constructor)
     */
    public RajdhaniTrainEntity(String trainNumber, String trainName,
                               StationEntity sourceStation, StationEntity destinationStation,
                               LocalTime departureTime, LocalTime arrivalTime,
                               String durationHours, int distanceKm, String daysOfOperation) {
        super(trainNumber, trainName, TrainType.RAJDHANI, sourceStation, destinationStation,
                departureTime, arrivalTime, durationHours, distanceKm, daysOfOperation);
    }

    /**
     * POLYMORPHIC IMPLEMENTATION:
     * Dynamic calculation of Rajdhani Express fares using BigDecimal for financial precision.
     */
    @Override
    public BigDecimal calculateFare(CoachClass coachClass, int passengerCount, int seniorCount) {
        if (passengerCount <= 0) {
            return BigDecimal.ZERO;
        }

        // 1. Determine Base Fare from configured seats or standard Rajdhani baseline
        BigDecimal baseRatePerSeat = BigDecimal.valueOf(1950.00); // Default 3A baseline
        for (TrainSeatEntity seat : this.seats) {
            if (seat.getCoachClass() == coachClass) {
                baseRatePerSeat = seat.getBaseFare();
                break;
            }
        }
        BigDecimal totalBaseFare = baseRatePerSeat.multiply(BigDecimal.valueOf(passengerCount));

        // 2. Class Reservation Fee
        BigDecimal reservationFeePerPerson = switch (coachClass) {
            case FIRST_AC -> BigDecimal.valueOf(60.00);
            case SECOND_AC -> BigDecimal.valueOf(50.00);
            case THIRD_AC -> BigDecimal.valueOf(40.00);
            default -> BigDecimal.valueOf(40.00);
        };
        BigDecimal totalReservationFee = reservationFeePerPerson.multiply(BigDecimal.valueOf(passengerCount));

        // 3. Premier Superfast Surcharge (₹75 per passenger)
        BigDecimal superfastSurcharge = BigDecimal.valueOf(75.00).multiply(BigDecimal.valueOf(passengerCount));

        // 4. Mandatory Premier Onboard Catering Fee
        BigDecimal cateringPerPerson = (coachClass == CoachClass.FIRST_AC)
                ? BigDecimal.valueOf(420.00)
                : BigDecimal.valueOf(340.00);
        BigDecimal totalCatering = cateringPerPerson.multiply(BigDecimal.valueOf(passengerCount));

        // 5. Senior Citizen Concession (25% off base fare for qualifying seniors)
        BigDecimal seniorDiscount = BigDecimal.ZERO;
        if (seniorCount > 0) {
            seniorDiscount = baseRatePerSeat.multiply(BigDecimal.valueOf(0.25))
                    .multiply(BigDecimal.valueOf(Math.min(passengerCount, seniorCount)));
        }

        // 6. Subtotal before taxes
        BigDecimal taxableSubtotal = totalBaseFare
                .add(totalReservationFee)
                .add(superfastSurcharge)
                .add(totalCatering)
                .subtract(seniorDiscount);

        // 7. 5% GST on Premier Air-Conditioned Services
        BigDecimal gstAmount = taxableSubtotal.multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP);

        return taxableSubtotal.add(gstAmount).setScale(2, RoundingMode.HALF_UP);
    }
}
