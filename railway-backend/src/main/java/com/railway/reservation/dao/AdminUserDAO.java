package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.model.AdminUser;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/**
 * Data Access Object for local Administrator / Operator accounts.
 */
public class AdminUserDAO {

    private final DatabaseManager dbManager;

    public AdminUserDAO() {
        this(DatabaseManager.getInstance());
    }

    public AdminUserDAO(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public Optional<AdminUser> authenticate(String username, String plainPassword) {
        if (username == null || plainPassword == null) return Optional.empty();
        String hash = hashPassword(plainPassword);
        String sql = "SELECT user_id, username, password_hash, full_name, role, is_active, created_at " +
                     "FROM admin_users WHERE username = ? AND password_hash = ? AND is_active = 1";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username.trim());
            pstmt.setString(2, hash);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new AdminUser(
                            rs.getInt("user_id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getString("full_name"),
                            rs.getString("role"),
                            rs.getInt("is_active") == 1,
                            rs.getString("created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Authentication query failed: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm missing", e);
        }
    }
}
