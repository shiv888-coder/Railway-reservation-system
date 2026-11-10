package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.model.Station;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Station entity operations.
 */
public class StationDAO {

    private final DatabaseManager dbManager;

    public StationDAO() {
        this(DatabaseManager.getInstance());
    }

    public StationDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public List<Station> findAll() {
        String sql = "SELECT station_code, station_name, city, state, zone, category FROM stations ORDER BY station_name ASC";
        List<Station> stations = new ArrayList<>();
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                stations.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch all stations: " + e.getMessage(), e);
        }
        return stations;
    }

    public Optional<Station> findByCode(String stationCode) {
        if (stationCode == null) return Optional.empty();
        String sql = "SELECT station_code, station_name, city, state, zone, category FROM stations WHERE station_code = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, stationCode.trim().toUpperCase());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch station by code " + stationCode + ": " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public List<Station> searchStations(String query) {
        List<Station> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return findAll();
        }
        String sql = "SELECT station_code, station_name, city, state, zone, category FROM stations " +
                     "WHERE station_code LIKE ? OR station_name LIKE ? OR city LIKE ? OR state LIKE ? " +
                     "ORDER BY CASE WHEN station_code = ? THEN 1 WHEN station_name LIKE ? THEN 2 ELSE 3 END, station_name ASC";
        String wildcard = "%" + query.trim() + "%";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, wildcard);
            pstmt.setString(2, wildcard);
            pstmt.setString(3, wildcard);
            pstmt.setString(4, wildcard);
            pstmt.setString(5, query.trim().toUpperCase());
            pstmt.setString(6, query.trim() + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    results.add(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Error searching stations with query '" + query + "': " + e.getMessage(), e);
        }
        return results;
    }

    public boolean insertStation(Station station) {
        String sql = "INSERT OR IGNORE INTO stations (station_code, station_name, city, state, zone, category) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, station.getStationCode().toUpperCase());
            pstmt.setString(2, station.getStationName());
            pstmt.setString(3, station.getCity());
            pstmt.setString(4, station.getState());
            pstmt.setString(5, station.getZone());
            pstmt.setString(6, station.getCategory());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to insert station: " + e.getMessage(), e);
        }
    }

    public int countStations() {
        String sql = "SELECT COUNT(*) FROM stations";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count stations: " + e.getMessage(), e);
        }
        return 0;
    }

    private Station mapResultSet(ResultSet rs) throws SQLException {
        return new Station(
                rs.getString("station_code"),
                rs.getString("station_name"),
                rs.getString("city"),
                rs.getString("state"),
                rs.getString("zone"),
                rs.getString("category")
        );
    }
}
