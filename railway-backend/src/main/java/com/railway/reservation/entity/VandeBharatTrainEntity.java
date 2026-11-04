package com.railway.reservation.entity;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;

/**
 * Concrete Entity representing a Vande Bharat Express Train.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Inheritance:
 *    - Extends BaseTrainEntity to reuse core train domain model.
 *
 * 2. Polymorphism (Method Overriding):
 *    - Overrides calculateFare() with Vande Bharat specific semi-high-speed
 *      corridor surcharges, rotational executive chair accommodations, and
 *      onboard gourmet breakfast/snack pricing.
 */
@Entity
@DiscriminatorValue("VANDE_BHARAT")
public class VandeBharatTrainEntity extends BaseTrainEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Default No-Arg Constructor (Required by JPA)
     */
    public VandeBharatTrainEntity() {
        super();
        this.trainType = TrainType.VANDE_BHARAT;
    }

    /**
     * Parameterized Constructor (Invokes super constructor)
     */
    public VandeBharatTrainEntity(String trainNumber, String trainName,
                                  StationEntity sourceStation, StationEntity destinationStation,
                                  LocalTime departureTime, LocalTime arrivalTime,
                                  String durationHours, int distanceKm, String daysOfOperation) {
        super(trainNumber, trainName, TrainType.VANDE_BHARAT, sourceStation, destinationStation,
                departureTime, arrivalTime, durationHours, distanceKm, daysOfOperation);
    }

    /**
     * POLYMORPHIC IMPLEMENTATION:
     * Calculates fare for Vande Bharat services (Chair Car CC and Executive Chair EC).
     */
    @Override
    public BigDecimal calculateFare(CoachClass coachClass, int passengerCount, int seniorCount) {
        if (passengerCount <= 0) {
            return BigDecimal.ZERO;
        }

        // 1. Base Tariff (Defaults to CC ₹1,280 or EC ₹2,450)
        BigDecimal baseRatePerSeat = (coachClass == CoachClass.EXECUTIVE_CHAIR)
                ? BigDecimal.valueOf(2450.00)
                : BigDecimal.valueOf(1280.00);

        for (TrainSeatEntity seat : this.seats) {
            if (seat.getCoachClass() == coachClass) {
                baseRatePerSeat = seat.getBaseFare();
                break;
            }
        }
        BigDecimal totalBaseFare = baseRatePerSeat.multiply(BigDecimal.valueOf(passengerCount));

        // 2. Reservation Fee
        BigDecimal reservationFee = (coachClass == CoachClass.EXECUTIVE_CHAIR)
                ? BigDecimal.valueOf(60.00)
                : BigDecimal.valueOf(40.00);
        BigDecimal totalReservationFee = reservationFee.multiply(BigDecimal.valueOf(passengerCount));

        // 3. Semi-High-Speed 160 km/h Corridor Surcharge (₹65 per passenger)
        BigDecimal highSpeedSurcharge = BigDecimal.valueOf(65.00).multiply(BigDecimal.valueOf(passengerCount));

        // 4. Onboard Dining Service (Breakfast/High Tea included in tariff)
        BigDecimal mealFee = (coachClass == CoachClass.EXECUTIVE_CHAIR)
                ? BigDecimal.valueOf(320.00)
                : BigDecimal.valueOf(220.00);
        BigDecimal totalMealFee = mealFee.multiply(BigDecimal.valueOf(passengerCount));

        // 5. Senior Citizen Concession (20% off base fare)
        BigDecimal seniorDiscount = BigDecimal.ZERO;
        if (seniorCount > 0) {
            seniorDiscount = baseRatePerSeat.multiply(BigDecimal.valueOf(0.20))
                    .multiply(BigDecimal.valueOf(Math.min(passengerCount, seniorCount)));
        }

        // 6. Subtotal
        BigDecimal taxableSubtotal = totalBaseFare
                .add(totalReservationFee)
                .add(highSpeedSurcharge)
                .add(totalMealFee)
                .subtract(seniorDiscount);

        // 7. 5% GST
        BigDecimal gstAmount = taxableSubtotal.multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP);

        return taxableSubtotal.add(gstAmount).setScale(2, RoundingMode.HALF_UP);
    }
}
