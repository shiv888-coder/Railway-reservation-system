package com.railway.reservation.entity;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;

/**
 * Concrete Entity representing a Superfast Express Train.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Inheritance:
 *    - Extends BaseTrainEntity to model long-distance fast corridor trains.
 *
 * 2. Polymorphism (Method Overriding):
 *    - Overrides calculateFare() with standard Indian Railways distance-based
 *      rates, standard Superfast supplement (₹45), optional pantry catering (₹0 included),
 *      and senior citizen 40% concessions.
 */
@Entity
@DiscriminatorValue("SUPERFAST")
public class SuperfastTrainEntity extends BaseTrainEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Default No-Arg Constructor (Required by JPA)
     */
    public SuperfastTrainEntity() {
        super();
        this.trainType = TrainType.SUPERFAST;
    }

    /**
     * Parameterized Constructor (Invokes super constructor)
     */
    public SuperfastTrainEntity(String trainNumber, String trainName,
                                StationEntity sourceStation, StationEntity destinationStation,
                                LocalTime departureTime, LocalTime arrivalTime,
                                String durationHours, int distanceKm, String daysOfOperation) {
        super(trainNumber, trainName, TrainType.SUPERFAST, sourceStation, destinationStation,
                departureTime, arrivalTime, durationHours, distanceKm, daysOfOperation);
    }

    /**
     * POLYMORPHIC IMPLEMENTATION:
     * Computes tariff for standard Superfast services across Sleeper and AC classes.
     */
    @Override
    public BigDecimal calculateFare(CoachClass coachClass, int passengerCount, int seniorCount) {
        if (passengerCount <= 0) {
            return BigDecimal.ZERO;
        }

        // 1. Base Tariff determination
        BigDecimal baseRatePerSeat = switch (coachClass) {
            case FIRST_AC -> BigDecimal.valueOf(3240.00);
            case SECOND_AC -> BigDecimal.valueOf(2140.00);
            case THIRD_AC -> BigDecimal.valueOf(1480.00);
            case CHAIR_CAR -> BigDecimal.valueOf(920.00);
            case SLEEPER -> BigDecimal.valueOf(520.00);
            default -> BigDecimal.valueOf(500.00);
        };

        for (TrainSeatEntity seat : this.seats) {
            if (seat.getCoachClass() == coachClass) {
                baseRatePerSeat = seat.getBaseFare();
                break;
            }
        }
        BigDecimal totalBaseFare = baseRatePerSeat.multiply(BigDecimal.valueOf(passengerCount));

        // 2. Reservation Fee
        BigDecimal reservationFee = switch (coachClass) {
            case FIRST_AC -> BigDecimal.valueOf(60.00);
            case SECOND_AC -> BigDecimal.valueOf(50.00);
            case THIRD_AC -> BigDecimal.valueOf(40.00);
            case SLEEPER -> BigDecimal.valueOf(20.00);
            default -> BigDecimal.valueOf(40.00);
        };
        BigDecimal totalReservationFee = reservationFee.multiply(BigDecimal.valueOf(passengerCount));

        // 3. Superfast Surcharge (Flat ₹45 per passenger)
        BigDecimal superfastSurcharge = BigDecimal.valueOf(45.00).multiply(BigDecimal.valueOf(passengerCount));

        // 4. Senior Citizen Concession (40% discount on base fare for qualifying seniors)
        BigDecimal seniorDiscount = BigDecimal.ZERO;
        if (seniorCount > 0) {
            seniorDiscount = baseRatePerSeat.multiply(BigDecimal.valueOf(0.40))
                    .multiply(BigDecimal.valueOf(Math.min(passengerCount, seniorCount)));
        }

        // 5. Subtotal
        BigDecimal subtotal = totalBaseFare
                .add(totalReservationFee)
                .add(superfastSurcharge)
                .subtract(seniorDiscount);

        // 6. 5% GST on AC classes only (Sleeper class is GST-exempt)
        BigDecimal gstAmount = BigDecimal.ZERO;
        if (coachClass != CoachClass.SLEEPER) {
            gstAmount = subtotal.multiply(BigDecimal.valueOf(0.05))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return subtotal.add(gstAmount).setScale(2, RoundingMode.HALF_UP);
    }
}
