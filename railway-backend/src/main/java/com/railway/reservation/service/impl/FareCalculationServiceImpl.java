package com.railway.reservation.service.impl;

import com.railway.reservation.dto.FareBreakdownDto;
import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.TrainSeatEntity;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import com.railway.reservation.service.FareCalculationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Concrete implementation of FareCalculationService.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Polymorphism (Dynamic Method Dispatch):
 *    - Delegates calculateTotalFare directly to the polymorphic train instance:
 *      train.calculateFare(coachClass, passengerCount, seniorCount);
 *    - At runtime, Java automatically invokes RajdhaniTrainEntity, VandeBharatTrainEntity,
 *      or SuperfastTrainEntity calculateFare() method based on the actual object in memory!
 *
 * 2. Encapsulation:
 *    - Tariff logic and fee structures remain encapsulated inside the domain models.
 */
@Service
public class FareCalculationServiceImpl implements FareCalculationService {

    @Override
    public BigDecimal calculateTotalFare(BaseTrainEntity train, CoachClass coachClass, int passengerCount, int seniorCount) {
        if (train == null) {
            throw new IllegalArgumentException("Train instance cannot be null.");
        }
        if (passengerCount <= 0) {
            return BigDecimal.ZERO;
        }

        // POLYMORPHIC CALL: Dynamic method dispatch executes subclass implementation
        return train.calculateFare(coachClass, passengerCount, Math.max(0, seniorCount));
    }

    @Override
    public FareBreakdownDto calculateFareBreakdown(BaseTrainEntity train, CoachClass coachClass, int passengerCount, int seniorCount) {
        if (train == null) {
            throw new IllegalArgumentException("Train instance cannot be null.");
        }
        if (passengerCount <= 0) {
            return new FareBreakdownDto();
        }

        // 1. Determine base rate per seat from train's seat configuration
        BigDecimal perSeatBase = BigDecimal.valueOf(1500.00);
        for (TrainSeatEntity seat : train.getSeats()) {
            if (seat.getCoachClass() == coachClass) {
                perSeatBase = seat.getBaseFare();
                break;
            }
        }
        BigDecimal baseTotal = perSeatBase.multiply(BigDecimal.valueOf(passengerCount));

        // 2. Class reservation charge
        BigDecimal resFeePerSeat = switch (coachClass) {
            case FIRST_AC, EXECUTIVE_CHAIR -> BigDecimal.valueOf(60.00);
            case SECOND_AC -> BigDecimal.valueOf(50.00);
            case THIRD_AC, CHAIR_CAR -> BigDecimal.valueOf(40.00);
            case SLEEPER -> BigDecimal.valueOf(20.00);
        };
        BigDecimal totalReservationFee = resFeePerSeat.multiply(BigDecimal.valueOf(passengerCount));

        // 3. Superfast / High-Speed Surcharges by train type
        BigDecimal superfastSurcharge = BigDecimal.ZERO;
        if (train.getTrainType() == TrainType.RAJDHANI) {
            superfastSurcharge = BigDecimal.valueOf(75.00).multiply(BigDecimal.valueOf(passengerCount));
        } else if (train.getTrainType() == TrainType.VANDE_BHARAT) {
            superfastSurcharge = BigDecimal.valueOf(65.00).multiply(BigDecimal.valueOf(passengerCount));
        } else if (train.getTrainType() == TrainType.SUPERFAST) {
            superfastSurcharge = BigDecimal.valueOf(45.00).multiply(BigDecimal.valueOf(passengerCount));
        }

        // 4. Inclusive Premier Catering by train type
        BigDecimal cateringCharge = BigDecimal.ZERO;
        if (train.getTrainType() == TrainType.RAJDHANI) {
            BigDecimal perPersonMeal = (coachClass == CoachClass.FIRST_AC) ? BigDecimal.valueOf(420.00) : BigDecimal.valueOf(340.00);
            cateringCharge = perPersonMeal.multiply(BigDecimal.valueOf(passengerCount));
        } else if (train.getTrainType() == TrainType.VANDE_BHARAT) {
            BigDecimal perPersonMeal = (coachClass == CoachClass.EXECUTIVE_CHAIR) ? BigDecimal.valueOf(320.00) : BigDecimal.valueOf(220.00);
            cateringCharge = perPersonMeal.multiply(BigDecimal.valueOf(passengerCount));
        }

        // 5. Senior Citizen Concession
        BigDecimal seniorDiscount = BigDecimal.ZERO;
        if (seniorCount > 0) {
            double discountPct = (train.getTrainType() == TrainType.SUPERFAST) ? 0.40 :
                    (train.getTrainType() == TrainType.RAJDHANI) ? 0.25 : 0.20;
            seniorDiscount = perSeatBase.multiply(BigDecimal.valueOf(discountPct))
                    .multiply(BigDecimal.valueOf(Math.min(passengerCount, seniorCount)));
        }

        // 6. Subtotal before taxes
        BigDecimal taxableSubtotal = baseTotal
                .add(totalReservationFee)
                .add(superfastSurcharge)
                .add(cateringCharge)
                .subtract(seniorDiscount);

        // 7. 5% GST (Sleeper class is GST-exempt)
        BigDecimal gstAmount = BigDecimal.ZERO;
        if (coachClass != CoachClass.SLEEPER) {
            gstAmount = taxableSubtotal.multiply(BigDecimal.valueOf(0.05))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalFare = taxableSubtotal.add(gstAmount).setScale(2, RoundingMode.HALF_UP);

        return new FareBreakdownDto(
                baseTotal,
                totalReservationFee,
                superfastSurcharge,
                cateringCharge,
                seniorDiscount,
                gstAmount,
                totalFare
        );
    }
}
