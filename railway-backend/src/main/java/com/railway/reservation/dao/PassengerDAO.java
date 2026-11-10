package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.model.Passenger;

import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Passenger records.
 */
public class PassengerDAO {

    private final DatabaseManager dbManager;

    public PassengerDAO() {
        this(DatabaseManager.getInstance());
    }

    public PassengerDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    /**
     * Inserts a passenger within an active transaction and populates the auto-generated ID.
     */
    public Passenger insertPassenger(Connection conn, Passenger p) throws SQLException {
        String sql = "INSERT INTO passengers (full_name, age, gender, phone, email, id_proof_type, id_proof_number, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, p.getFullName());
            pstmt.setInt(2, p.getAge());
            pstmt.setString(3, p.getGender().name());
            pstmt.setString(4, p.getPhone());
            pstmt.setString(5, p.getEmail());
            pstmt.setString(6, p.getIdProofType().name());
            pstmt.setString(7, p.getIdProofNumber());
            String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            pstmt.setString(8, p.getCreatedAt() != null ? p.getCreatedAt() : now);

            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    p.setPassengerId(rs.getInt(1));
                }
            }
        }
        return p;
    }

    public Optional<Passenger> findById(int passengerId) {
        String sql = "SELECT passenger_id, full_name, age, gender, phone, email, id_proof_type, id_proof_number, created_at " +
                     "FROM passengers WHERE passenger_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, passengerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find passenger by ID " + passengerId + ": " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public List<Passenger> findByPnr(String pnr) {
        List<Passenger> list = new ArrayList<>();
        if (pnr == null) return list;
        String sql = "SELECT p.passenger_id, p.full_name, p.age, p.gender, p.phone, p.email, p.id_proof_type, p.id_proof_number, p.created_at " +
                     "FROM passengers p " +
                     "JOIN reservation_passengers rp ON p.passenger_id = rp.passenger_id " +
                     "WHERE rp.pnr = ? ORDER BY rp.id ASC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, pnr.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find passengers for PNR " + pnr + ": " + e.getMessage(), e);
        }
        return list;
    }

    public List<Passenger> findAll() {
        List<Passenger> list = new ArrayList<>();
        String sql = "SELECT passenger_id, full_name, age, gender, phone, email, id_proof_type, id_proof_number, created_at " +
                     "FROM passengers ORDER BY passenger_id DESC LIMIT 100";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch all passengers: " + e.getMessage(), e);
        }
        return list;
    }

    private Passenger mapResultSet(ResultSet rs) throws SQLException {
        return new Passenger(
                rs.getInt("passenger_id"),
                rs.getString("full_name"),
                rs.getInt("age"),
                Gender.valueOf(rs.getString("gender")),
                rs.getString("phone"),
                rs.getString("email"),
                IdProofType.fromString(rs.getString("id_proof_type")),
                rs.getString("id_proof_number"),
                rs.getString("created_at")
        );
    }
}
