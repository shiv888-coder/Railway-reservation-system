package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.exception.ResourceNotFoundException;
import com.railway.reservation.model.CancellationSlip;
import com.railway.reservation.model.Reservation;

import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for Ticket Cancellation and Refund lifecycle.
 * Enforces atomic state mutation: reservation cancellation, refund slip insertion, and seat restoration.
 */
public class CancellationDAO {

    private final DatabaseManager dbManager;
    private final ReservationDAO reservationDAO;
    private final SeatInventoryDAO seatInventoryDAO;
    private static final SecureRandom RANDOM = new SecureRandom();

    public CancellationDAO() {
        this(DatabaseManager.getInstance(), new ReservationDAO(), new SeatInventoryDAO());
    }

    public CancellationDAO(DatabaseManager dbManager, ReservationDAO reservationDAO, SeatInventoryDAO seatInventoryDAO) {
        this.dbManager = dbManager;
        this.reservationDAO = reservationDAO;
        this.seatInventoryDAO = seatInventoryDAO;
    }

    /**
     * Cancels an existing confirmed reservation within a single ACID transaction.
     * 1. Validates that the PNR exists and is not already cancelled.
     * 2. Updates reservation status to CANCELLED.
     * 3. Calculates dynamic cancellation charge and refund.
     * 4. Inserts an official cancellation slip record.
     * 5. Restores released seats to seat_inventory.
     * 6. Commits transaction.
     */
    public CancellationSlip cancelTicket(String pnr, String reason) {
        if (pnr == null || pnr.trim().isEmpty()) {
            throw new IllegalArgumentException("PNR cannot be null or empty.");
        }
        String cleanPnr = pnr.trim();

        try (Connection conn = dbManager.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Check reservation status
                Reservation res = reservationDAO.findByPnr(cleanPnr)
                        .orElseThrow(() -> new ResourceNotFoundException("Reservation not found for PNR: " + cleanPnr));

                if (res.getBookingStatus() == BookingStatus.CANCELLED) {
                    throw new IllegalStateException("Ticket with PNR " + cleanPnr + " has already been cancelled.");
                }

                int passengerCount = res.getPassengers().isEmpty() ? 1 : res.getPassengers().size();

                // 2. Cancellation fee calculation (IRCTC standard rules: 15% cancellation charge, 85% refund)
                double totalFare = res.getTotalFare();
                double cancellationFee = Math.round(totalFare * 0.15 * 100.0) / 100.0;
                double refundAmount = Math.round((totalFare - cancellationFee) * 100.0) / 100.0;
                String cancelledAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                String refundRef = "REF-" + (10000000 + RANDOM.nextInt(90000000));
                String cleanReason = (reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Passenger voluntary cancellation";

                // 3. Update reservation status
                String updateResSql = "UPDATE reservations SET booking_status = 'CANCELLED' WHERE pnr = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(updateResSql)) {
                    pstmt.setString(1, cleanPnr);
                    pstmt.executeUpdate();
                }

                // 4. Insert cancellation slip
                String insertSlipSql = "INSERT INTO cancellations (pnr, cancelled_at, cancellation_fee, refund_amount, cancellation_reason, refund_reference_id) " +
                                       "VALUES (?, ?, ?, ?, ?, ?)";
                int slipId = 0;
                try (PreparedStatement pstmt = conn.prepareStatement(insertSlipSql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
                    pstmt.setString(1, cleanPnr);
                    pstmt.setString(2, cancelledAt);
                    pstmt.setDouble(3, cancellationFee);
                    pstmt.setDouble(4, refundAmount);
                    pstmt.setString(5, cleanReason);
                    pstmt.setString(6, refundRef);
                    pstmt.executeUpdate();
                    try (ResultSet rs = pstmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            slipId = rs.getInt(1);
                        }
                    }
                }

                // 5. Restore seats in seat_inventory
                seatInventoryDAO.incrementSeats(conn, res.getTrainNumber(), res.getCoachClass(), passengerCount);

                conn.commit();
                return new CancellationSlip(slipId, cleanPnr, cancelledAt, cancellationFee, refundAmount, cleanReason, refundRef);
            } catch (IllegalStateException | ResourceNotFoundException ex) {
                conn.rollback();
                throw ex;
            } catch (Exception ex) {
                conn.rollback();
                throw new DatabaseException("Transaction failed while cancelling ticket: " + ex.getMessage(), ex);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Database error in cancelTicket: " + e.getMessage(), e);
        }
    }

    public Optional<CancellationSlip> findByPnr(String pnr) {
        if (pnr == null) return Optional.empty();
        String sql = "SELECT cancellation_id, pnr, cancelled_at, cancellation_fee, refund_amount, cancellation_reason, refund_reference_id " +
                     "FROM cancellations WHERE pnr = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, pnr.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSet(rs));
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find cancellation slip for PNR " + pnr + ": " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public List<CancellationSlip> findAll() {
        List<CancellationSlip> list = new ArrayList<>();
        String sql = "SELECT cancellation_id, pnr, cancelled_at, cancellation_fee, refund_amount, cancellation_reason, refund_reference_id " +
                     "FROM cancellations ORDER BY cancelled_at DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                list.add(mapResultSet(rs));
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch all cancellations: " + e.getMessage(), e);
        }
        return list;
    }

    private CancellationSlip mapResultSet(ResultSet rs) throws SQLException {
        return new CancellationSlip(
                rs.getInt("cancellation_id"),
                rs.getString("pnr"),
                rs.getString("cancelled_at"),
                rs.getDouble("cancellation_fee"),
                rs.getDouble("refund_amount"),
                rs.getString("cancellation_reason"),
                rs.getString("refund_reference_id")
        );
    }
}
