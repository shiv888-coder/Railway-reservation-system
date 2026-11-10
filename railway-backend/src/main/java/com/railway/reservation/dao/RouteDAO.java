package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.model.TrainRoute;
import com.railway.reservation.model.TrainSchedule;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Train Routes and Timetable Schedules.
 */
public class RouteDAO {

    private final DatabaseManager dbManager;

    public RouteDAO() {
        this(DatabaseManager.getInstance());
    }

    public RouteDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public List<TrainRoute> getRoutesForTrain(String trainNumber) {
        List<TrainRoute> routes = new ArrayList<>();
        if (trainNumber == null) return routes;
        String sql = "SELECT route_id, train_number, station_code, stop_sequence, distance_km " +
                     "FROM train_routes WHERE train_number = ? ORDER BY stop_sequence ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    routes.add(new TrainRoute(
                            rs.getInt("route_id"),
                            rs.getString("train_number"),
                            rs.getString("station_code"),
                            rs.getInt("stop_sequence"),
                            rs.getInt("distance_km")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get routes for train " + trainNumber + ": " + e.getMessage(), e);
        }
        return routes;
    }

    public List<TrainSchedule> getSchedulesForTrain(String trainNumber) {
        List<TrainSchedule> schedules = new ArrayList<>();
        if (trainNumber == null) return schedules;
        String sql = "SELECT schedule_id, train_number, station_code, arrival_time, departure_time, halt_minutes, day_number, stop_sequence " +
                     "FROM train_schedules WHERE train_number = ? ORDER BY stop_sequence ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    schedules.add(new TrainSchedule(
                            rs.getInt("schedule_id"),
                            rs.getString("train_number"),
                            rs.getString("station_code"),
                            rs.getString("arrival_time"),
                            rs.getString("departure_time"),
                            rs.getInt("halt_minutes"),
                            rs.getInt("day_number"),
                            rs.getInt("stop_sequence")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get schedules for train " + trainNumber + ": " + e.getMessage(), e);
        }
        return schedules;
    }

    public int calculateDistanceBetweenStations(String trainNumber, String sourceCode, String destCode) {
        if (trainNumber == null || sourceCode == null || destCode == null) return 0;
        String sql = "SELECT r1.distance_km AS src_dist, r2.distance_km AS dst_dist " +
                     "FROM train_routes r1 " +
                     "JOIN train_routes r2 ON r1.train_number = r2.train_number " +
                     "WHERE r1.train_number = ? AND r1.station_code = ? AND r2.station_code = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            pstmt.setString(2, sourceCode.trim().toUpperCase());
            pstmt.setString(3, destCode.trim().toUpperCase());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    int srcDist = rs.getInt("src_dist");
                    int dstDist = rs.getInt("dst_dist");
                    return Math.abs(dstDist - srcDist);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error calculating distance: " + e.getMessage(), e);
        }
        return 0;
    }
}
