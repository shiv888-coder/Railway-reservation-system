package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.TrainType;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.model.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Train master entities.
 * Implements polymorphic factory instantiation for concrete Train subclasses.
 */
public class TrainDAO {

    private final DatabaseManager dbManager;

    public TrainDAO() {
        this(DatabaseManager.getInstance());
    }

    public TrainDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public List<Train> findAll() {
        String sql = "SELECT train_number, train_name, train_type, source_station_code, destination_station_code, " +
                     "departure_time, arrival_time, duration, distance_km, operating_days FROM trains ORDER BY train_number ASC";
        List<Train> trains = new ArrayList<>();
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                trains.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch all trains: " + e.getMessage(), e);
        }
        return trains;
    }

    public Optional<Train> findByNumber(String trainNumber) {
        if (trainNumber == null) return Optional.empty();
        String sql = "SELECT train_number, train_name, train_type, source_station_code, destination_station_code, " +
                     "departure_time, arrival_time, duration, distance_km, operating_days FROM trains WHERE train_number = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find train " + trainNumber + ": " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    /**
     * Finds trains directly connecting source to destination, or having source and destination
     * as intermediate stops in the correct sequence.
     */
    public List<Train> searchTrainsBetweenStations(String sourceCode, String destCode) {
        List<Train> trains = new ArrayList<>();
        if (sourceCode == null || destCode == null) return trains;
        String src = sourceCode.trim().toUpperCase();
        String dst = destCode.trim().toUpperCase();

        // Check both direct source-destination pairs and intermediate route halts where stopSeq(src) < stopSeq(dst)
        String sql = "SELECT DISTINCT t.train_number, t.train_name, t.train_type, t.source_station_code, " +
                     "t.destination_station_code, t.departure_time, t.arrival_time, t.duration, t.distance_km, t.operating_days " +
                     "FROM trains t " +
                     "JOIN train_routes r1 ON t.train_number = r1.train_number AND r1.station_code = ? " +
                     "JOIN train_routes r2 ON t.train_number = r2.train_number AND r2.station_code = ? " +
                     "WHERE r1.stop_sequence < r2.stop_sequence " +
                     "ORDER BY t.departure_time ASC";

        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, src);
            pstmt.setString(2, dst);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    trains.add(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error searching trains between " + src + " and " + dst + ": " + e.getMessage(), e);
        }
        return trains;
    }

    public List<Train> findByType(TrainType type) {
        List<Train> trains = new ArrayList<>();
        if (type == null) return trains;
        String sql = "SELECT train_number, train_name, train_type, source_station_code, destination_station_code, " +
                     "departure_time, arrival_time, duration, distance_km, operating_days FROM trains WHERE train_type LIKE ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, "%" + type.name() + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    trains.add(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find trains by type " + type + ": " + e.getMessage(), e);
        }
        return trains;
    }

    public int countTrains() {
        String sql = "SELECT COUNT(*) FROM trains";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count trains: " + e.getMessage(), e);
        }
        return 0;
    }

    /**
     * Polymorphic Factory Method: Instantiates specialized train subclass based on train category.
     */
    public static Train createTrainInstance(String trainNumber, String trainName, TrainType trainType,
                                            String sourceCode, String destCode, String depTime,
                                            String arrTime, String duration, int distKm, String days) {
        if (trainType == TrainType.RAJDHANI) {
            return new RajdhaniTrain(trainNumber, trainName, sourceCode, destCode, depTime, arrTime, duration, distKm, days);
        } else if (trainType == TrainType.VANDE_BHARAT) {
            return new VandeBharatTrain(trainNumber, trainName, sourceCode, destCode, depTime, arrTime, duration, distKm, days);
        } else if (trainType == TrainType.SUPERFAST || trainType == TrainType.SHATABDI ||
                   trainType == TrainType.DURONTO || trainType == TrainType.GARIB_RATH ||
                   trainType == TrainType.HUMSAFAR) {
            return new SuperfastTrain(trainNumber, trainName, trainType, sourceCode, destCode, depTime, arrTime, duration, distKm, days);
        } else {
            return new MailExpressTrain(trainNumber, trainName, trainType, sourceCode, destCode, depTime, arrTime, duration, distKm, days);
        }
    }

    private Train mapResultSet(ResultSet rs) throws SQLException {
        String trainNumber = rs.getString("train_number");
        String trainName = rs.getString("train_name");
        TrainType type = TrainType.fromString(rs.getString("train_type"));
        String src = rs.getString("source_station_code");
        String dst = rs.getString("destination_station_code");
        String dep = rs.getString("departure_time");
        String arr = rs.getString("arrival_time");
        String dur = rs.getString("duration");
        int dist = rs.getInt("distance_km");
        String days = rs.getString("operating_days");

        return createTrainInstance(trainNumber, trainName, type, src, dst, dep, arr, dur, dist, days);
    }
}
