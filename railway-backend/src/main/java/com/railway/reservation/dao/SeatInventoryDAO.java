package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.exception.InsufficientSeatsException;
import com.railway.reservation.model.SeatInventory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Seat Inventory and Quota management.
 * Enforces atomic seat reservations and restorations to prevent overselling.
 */
public class SeatInventoryDAO {

    private final DatabaseManager dbManager;

    public SeatInventoryDAO() {
        this(DatabaseManager.getInstance());
    }

    public SeatInventoryDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public List<SeatInventory> getInventoryForTrain(String trainNumber) {
        List<SeatInventory> list = new ArrayList<>();
        if (trainNumber == null) return list;
        String sql = "SELECT inventory_id, train_number, coach_class, total_seats, available_seats " +
                     "FROM seat_inventory WHERE train_number = ? ORDER BY inventory_id ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get seat inventory for train " + trainNumber + ": " + e.getMessage(), e);
        }
        return list;
    }

    public Optional<SeatInventory> getInventory(String trainNumber, CoachClass coachClass) {
        if (trainNumber == null || coachClass == null) return Optional.empty();
        String sql = "SELECT inventory_id, train_number, coach_class, total_seats, available_seats " +
                     "FROM seat_inventory WHERE train_number = ? AND coach_class = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, trainNumber.trim());
            pstmt.setString(2, coachClass.getCode());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error checking seat inventory: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public int getAvailableSeats(String trainNumber, CoachClass coachClass) {
        return getInventory(trainNumber, coachClass)
                .map(SeatInventory::getAvailableSeats)
                .orElse(0);
    }

    /**
     * Atomically decrements seats within a caller's active JDBC transaction.
     * Throws InsufficientSeatsException if not enough seats are available.
     */
    public boolean decrementSeats(Connection conn, String trainNumber, CoachClass coachClass, int count) throws SQLException {
        if (count <= 0) return true;
        String updateSql = "UPDATE seat_inventory SET available_seats = available_seats - ? " +
                           "WHERE train_number = ? AND coach_class = ? AND available_seats >= ?";
        try (PreparedStatement pstmt = conn.prepareStatement(updateSql)) {
            pstmt.setInt(1, count);
            pstmt.setString(2, trainNumber.trim());
            pstmt.setString(3, coachClass.getCode());
            pstmt.setInt(4, count);
            int rows = pstmt.executeUpdate();
            if (rows == 0) {
                int currentAvailable = getAvailableSeats(trainNumber, coachClass);
                throw new InsufficientSeatsException(trainNumber, coachClass.getCode(), count, currentAvailable);
            }
            return true;
        }
    }

    /**
     * Atomically increments/restores seats upon cancellation within an active JDBC transaction.
     */
    public boolean incrementSeats(Connection conn, String trainNumber, CoachClass coachClass, int count) throws SQLException {
        if (count <= 0) return true;
        String updateSql = "UPDATE seat_inventory SET available_seats = MIN(total_seats, available_seats + ?) " +
                           "WHERE train_number = ? AND coach_class = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(updateSql)) {
            pstmt.setInt(1, count);
            pstmt.setString(2, trainNumber.trim());
            pstmt.setString(3, coachClass.getCode());
            return pstmt.executeUpdate() > 0;
        }
    }

    private SeatInventory mapResultSet(ResultSet rs) throws SQLException {
        return new SeatInventory(
                rs.getInt("inventory_id"),
                rs.getString("train_number"),
                CoachClass.fromCode(rs.getString("coach_class")),
                rs.getInt("total_seats"),
                rs.getInt("available_seats")
        );
    }
}
