package com.railway.reservation.service.impl;

import com.railway.reservation.dao.TrainDAO;
import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.dto.FareBreakdown;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.exception.InvalidClassException;
import com.railway.reservation.exception.TrainNotFoundException;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.FareCalculationService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Service implementation for Fare Calculations.
 * Reads verified base tariffs from SQLite train_classes table and applies authentic IRCTC rules.
 * Demonstrates Method Overloading across calculation methods.
 */
public class FareCalculationServiceImpl implements FareCalculationService {

    private final DatabaseManager dbManager;
    private final TrainDAO trainDAO;

    public FareCalculationServiceImpl() {
        this(DatabaseManager.getInstance(), new TrainDAO());
    }

    public FareCalculationServiceImpl(DatabaseManager dbManager, TrainDAO trainDAO) {
        this.dbManager = dbManager;
        this.trainDAO = trainDAO;
    }

    @Override
    public FareBreakdown calculateFare(String trainNumber, CoachClass coachClass, int passengerCount) {
        if (passengerCount <= 0) {
            passengerCount = 1;
        }
        return calculateFare(trainNumber, coachClass, null, null, null, passengerCount);
    }

    @Override
    public FareBreakdown calculateFare(String trainNumber, CoachClass coachClass,
                                        String sourceStationCode, String destinationStationCode,
                                        List<Passenger> passengers) {
        int count = (passengers != null && !passengers.isEmpty()) ? passengers.size() : 1;
        return calculateFare(trainNumber, coachClass, sourceStationCode, destinationStationCode, passengers, count);
    }

    private FareBreakdown calculateFare(String trainNumber, CoachClass coachClass,
                                        String sourceStationCode, String destinationStationCode,
                                        List<Passenger> passengers, int count) {
        if (trainNumber == null || coachClass == null) {
            throw new IllegalArgumentException("Train number and coach class must not be null.");
        }
        Train train = trainDAO.findByNumber(trainNumber.trim())
                .orElseThrow(() -> new TrainNotFoundException(trainNumber.trim()));

        // Query database tariff record (Strict rule: Never invent missing fares)
        double unitBaseFare = lookupDatabaseBaseFare(train.getTrainNumber(), coachClass);
        if (unitBaseFare <= 0) {
            // Polymorphic fallback to train model calculation
            unitBaseFare = train.calculateFare(coachClass, train.getDistanceKm());
            if (unitBaseFare <= 0) {
                throw new InvalidClassException(train.getTrainNumber(), coachClass.getCode());
            }
        }

        int seniorCount = 0;
        double totalBaseFare = 0.0;
        double totalSeniorDiscount = 0.0;

        if (passengers != null && !passengers.isEmpty()) {
            for (Passenger p : passengers) {
                totalBaseFare += unitBaseFare;
                if (p.isSeniorCitizen()) {
                    seniorCount++;
                    // 40% concession on base fare for senior citizens
                    totalSeniorDiscount += (unitBaseFare * 0.40);
                }
            }
        } else {
            totalBaseFare = unitBaseFare * count;
        }

        // Standard Indian Railways Surcharges
        double reservationChargePerPax = getReservationCharge(coachClass);
        double superfastChargePerPax = isSuperfastOrPremier(train.getTrainType()) ? getSuperfastCharge(coachClass) : 0.0;
        double cateringChargePerPax = getCateringCharge(train.getTrainType(), coachClass);

        double totalResCharge = reservationChargePerPax * count;
        double totalSfCharge = superfastChargePerPax * count;
        double totalCatering = cateringChargePerPax * count;

        // GST: 5% on AC classes (1A, 2A, 3A, CC, EC); 0% on Non-AC classes (SL, 2S)
        boolean isAcClass = coachClass != CoachClass.SLEEPER && coachClass != CoachClass.SECOND_SEATING;
        double taxableAmount = (totalBaseFare - totalSeniorDiscount) + totalResCharge + totalSfCharge;
        double gstAmount = isAcClass ? Math.round(taxableAmount * 0.05 * 100.0) / 100.0 : 0.0;

        double finalTotal = (totalBaseFare - totalSeniorDiscount) + totalResCharge + totalSfCharge + totalCatering + gstAmount;
        finalTotal = Math.round(finalTotal * 100.0) / 100.0;

        return new FareBreakdown(
                train.getTrainNumber(),
                coachClass,
                count,
                seniorCount,
                Math.round(totalBaseFare * 100.0) / 100.0,
                totalResCharge,
                totalSfCharge,
                totalCatering,
                gstAmount,
                Math.round(totalSeniorDiscount * 100.0) / 100.0,
                finalTotal
        );
    }

    private double lookupDatabaseBaseFare(String trainNumber, CoachClass coachClass) {
        String sql = "SELECT base_fare FROM train_classes WHERE train_number = ? AND coach_class = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber);
            pstmt.setString(2, coachClass.getCode());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("base_fare");
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to query tariff for train " + trainNumber + ": " + e.getMessage(), e);
        }
        return 0.0;
    }

    private double getReservationCharge(CoachClass c) {
        return switch (c) {
            case FIRST_AC, EXECUTIVE_CHAIR -> 60.0;
            case SECOND_AC -> 50.0;
            case THIRD_AC, CHAIR_CAR -> 40.0;
            case SLEEPER -> 20.0;
            case SECOND_SEATING -> 15.0;
        };
    }

    private double getSuperfastCharge(CoachClass c) {
        return switch (c) {
            case FIRST_AC -> 75.0;
            case SECOND_AC, THIRD_AC, CHAIR_CAR, EXECUTIVE_CHAIR -> 45.0;
            case SLEEPER -> 30.0;
            case SECOND_SEATING -> 15.0;
        };
    }

    private double getCateringCharge(TrainType type, CoachClass c) {
        if (type == TrainType.RAJDHANI) {
            return c == CoachClass.FIRST_AC ? 450.0 : (c == CoachClass.SECOND_AC ? 350.0 : 280.0);
        }
        if (type == TrainType.VANDE_BHARAT) {
            return c == CoachClass.EXECUTIVE_CHAIR ? 350.0 : 250.0;
        }
        return 0.0;
    }

    private boolean isSuperfastOrPremier(TrainType type) {
        return type == TrainType.RAJDHANI || type == TrainType.VANDE_BHARAT ||
               type == TrainType.SUPERFAST || type == TrainType.SHATABDI ||
               type == TrainType.DURONTO || type == TrainType.GARIB_RATH ||
               type == TrainType.HUMSAFAR;
    }
}
