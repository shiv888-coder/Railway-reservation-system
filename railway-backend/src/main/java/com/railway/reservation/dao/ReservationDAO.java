package com.railway.reservation.dao;

import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.exception.DatabaseException;
import com.railway.reservation.exception.InvalidBookingException;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.model.ReservationPassenger;

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
 * Data Access Object for Reservations and PNR lifecycle management.
 * Enforces ACID transactions across reservation records, passenger profiles, and seat quotas.
 */
public class ReservationDAO {

    private final DatabaseManager dbManager;
    private final PassengerDAO passengerDAO;
    private final SeatInventoryDAO seatInventoryDAO;
    private static final SecureRandom RANDOM = new SecureRandom();

    public ReservationDAO() {
        this(DatabaseManager.getInstance(), new PassengerDAO(), new SeatInventoryDAO());
    }

    public ReservationDAO(DatabaseManager dbManager, PassengerDAO passengerDAO, SeatInventoryDAO seatInventoryDAO) {
        this.dbManager = dbManager;
        this.passengerDAO = passengerDAO;
        this.seatInventoryDAO = seatInventoryDAO;
    }

    /**
     * Executes a complete ticket booking within a single ACID transaction.
     * 1. Validates input passengers and train.
     * 2. Decrements available seats in seat_inventory.
     * 3. Inserts master reservation record with unique 10-digit PNR.
     * 4. Inserts passenger records.
     * 5. Inserts reservation_passengers berth allocation records.
     * 6. Commits transaction or rolls back on any error.
     */
    public Reservation createReservation(Reservation res, List<Passenger> passengers) {
        if (res == null || passengers == null || passengers.isEmpty()) {
            throw new InvalidBookingException("Booking payload must include a reservation and at least one passenger.");
        }

        try (Connection conn = dbManager.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Decrement Seats atomically
                seatInventoryDAO.decrementSeats(conn, res.getTrainNumber(), res.getCoachClass(), passengers.size());

                // 2. Generate and verify unique 10-digit PNR
                String pnr = generateUniquePnr(conn);
                res.setPnr(pnr);
                res.setBookingStatus(BookingStatus.CONFIRMED);
                if (res.getBookedAt() == null || res.getBookedAt().isEmpty()) {
                    res.setBookedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                }

                // 3. Insert Master Reservation
                String resSql = "INSERT INTO reservations (pnr, train_number, source_station_code, destination_station_code, " +
                                "journey_date, coach_class, booking_status, base_fare, reservation_charge, superfast_charge, " +
                                "catering_charge, gst_amount, senior_discount, total_fare, booked_at) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                try (PreparedStatement pstmt = conn.prepareStatement(resSql)) {
                    pstmt.setString(1, res.getPnr());
                    pstmt.setString(2, res.getTrainNumber());
                    pstmt.setString(3, res.getSourceStationCode());
                    pstmt.setString(4, res.getDestinationStationCode());
                    pstmt.setString(5, res.getJourneyDate());
                    pstmt.setString(6, res.getCoachClass().getCode());
                    pstmt.setString(7, res.getBookingStatus().name());
                    pstmt.setDouble(8, res.getBaseFare());
                    pstmt.setDouble(9, res.getReservationCharge());
                    pstmt.setDouble(10, res.getSuperfastCharge());
                    pstmt.setDouble(11, res.getCateringCharge());
                    pstmt.setDouble(12, res.getGstAmount());
                    pstmt.setDouble(13, res.getSeniorDiscount());
                    pstmt.setDouble(14, res.getTotalFare());
                    pstmt.setString(15, res.getBookedAt());
                    pstmt.executeUpdate();
                }

                // 4. Insert Passengers and Seat Allocations
                String allocSql = "INSERT INTO reservation_passengers (pnr, passenger_id, coach_number, berth_number, berth_type, fare_charged) " +
                                  "VALUES (?, ?, ?, ?, ?, ?)";
                List<ReservationPassenger> allocList = new ArrayList<>();
                int berthStart = (RANDOM.nextInt(60) + 1);

                for (int i = 0; i < passengers.size(); i++) {
                    Passenger p = passengers.get(i);
                    passengerDAO.insertPassenger(conn, p);

                    String coachNum = getCoachPrefix(res.getCoachClass()) + (RANDOM.nextInt(3) + 1);
                    int berthNum = ((berthStart + i) % 72) + 1;
                    String berthType = getBerthTypeByNumber(res.getCoachClass(), berthNum);
                    double indivFare = res.getTotalFare() / passengers.size();

                    ReservationPassenger rp = new ReservationPassenger(0, pnr, p.getPassengerId(), coachNum, berthNum, berthType, indivFare);
                    rp.setPassenger(p);

                    try (PreparedStatement pstmt = conn.prepareStatement(allocSql)) {
                        pstmt.setString(1, pnr);
                        pstmt.setInt(2, p.getPassengerId());
                        pstmt.setString(3, coachNum);
                        pstmt.setInt(4, berthNum);
                        pstmt.setString(5, berthType);
                        pstmt.setDouble(6, indivFare);
                        pstmt.executeUpdate();
                    }
                    allocList.add(rp);
                }

                res.setPassengers(allocList);
                conn.commit();
                return res;
            } catch (Exception ex) {
                conn.rollback();
                throw new DatabaseException("Transaction failed while creating reservation: " + ex.getMessage(), ex);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Database error in createReservation: " + e.getMessage(), e);
        }
    }

    public Optional<Reservation> findByPnr(String pnr) {
        if (pnr == null) return Optional.empty();
        String sql = "SELECT pnr, train_number, source_station_code, destination_station_code, journey_date, coach_class, " +
                     "booking_status, base_fare, reservation_charge, superfast_charge, catering_charge, gst_amount, " +
                     "senior_discount, total_fare, booked_at FROM reservations WHERE pnr = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, pnr.trim());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Reservation res = mapResultSet(rs);
                    res.setPassengers(findAllocationsForPnr(conn, res.getPnr()));
                    return Optional.of(res);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find reservation for PNR " + pnr + ": " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    public List<Reservation> findAll() {
        List<Reservation> list = new ArrayList<>();
        String sql = "SELECT pnr, train_number, source_station_code, destination_station_code, journey_date, coach_class, " +
                     "booking_status, base_fare, reservation_charge, superfast_charge, catering_charge, gst_amount, " +
                     "senior_discount, total_fare, booked_at FROM reservations ORDER BY booked_at DESC";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                Reservation res = mapResultSet(rs);
                res.setPassengers(findAllocationsForPnr(conn, res.getPnr()));
                list.add(res);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Failed to fetch all reservations: " + e.getMessage(), e);
        }
        return list;
    }

    public int countReservations() {
        String sql = "SELECT COUNT(*) FROM reservations";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count reservations: " + e.getMessage(), e);
        }
        return 0;
    }

    public double calculateTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(total_fare), 0) FROM reservations WHERE booking_status = 'CONFIRMED'";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) return rs.getDouble(1);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to calculate total revenue: " + e.getMessage(), e);
        }
        return 0.0;
    }

    private List<ReservationPassenger> findAllocationsForPnr(Connection conn, String pnr) throws SQLException {
        List<ReservationPassenger> list = new ArrayList<>();
        String sql = "SELECT rp.id, rp.pnr, rp.passenger_id, rp.coach_number, rp.berth_number, rp.berth_type, rp.fare_charged, " +
                     "p.full_name, p.age, p.gender, p.phone, p.email, p.id_proof_type, p.id_proof_number, p.created_at " +
                     "FROM reservation_passengers rp " +
                     "JOIN passengers p ON rp.passenger_id = p.passenger_id " +
                     "WHERE rp.pnr = ? ORDER BY rp.id ASC";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, pnr);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    ReservationPassenger rp = new ReservationPassenger(
                            rs.getInt("id"),
                            rs.getString("pnr"),
                            rs.getInt("passenger_id"),
                            rs.getString("coach_number"),
                            rs.getInt("berth_number"),
                            rs.getString("berth_type"),
                            rs.getDouble("fare_charged")
                    );
                    Passenger p = new Passenger(
                            rs.getInt("passenger_id"),
                            rs.getString("full_name"),
                            rs.getInt("age"),
                            com.railway.reservation.enums.Gender.valueOf(rs.getString("gender")),
                            rs.getString("phone"),
                            rs.getString("email"),
                            com.railway.reservation.enums.IdProofType.fromString(rs.getString("id_proof_type")),
                            rs.getString("id_proof_number"),
                            rs.getString("created_at")
                    );
                    rp.setPassenger(p);
                    list.add(rp);
                }
            }
        }
        return list;
    }

    private String generateUniquePnr(Connection conn) throws SQLException {
        String checkSql = "SELECT 1 FROM reservations WHERE pnr = ?";
        while (true) {
            // First digit 2-9, followed by 9 digits = 10-digit authentic IRCTC format
            long first = 2 + RANDOM.nextInt(8);
            long rest = (long) (RANDOM.nextDouble() * 1_000_000_000L);
            String candidate = String.format("%d%09d", first, rest);

            try (PreparedStatement pstmt = conn.prepareStatement(checkSql)) {
                pstmt.setString(1, candidate);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (!rs.next()) {
                        return candidate;
                    }
                }
            }
        }
    }

    private String getCoachPrefix(CoachClass c) {
        if (c == null) return "S";
        return switch (c) {
            case FIRST_AC -> "H";
            case SECOND_AC -> "A";
            case THIRD_AC -> "B";
            case CHAIR_CAR -> "C";
            case EXECUTIVE_CHAIR -> "E";
            case SECOND_SEATING -> "D";
            case SLEEPER -> "S";
        };
    }

    private String getBerthTypeByNumber(CoachClass c, int berthNum) {
        if (c == CoachClass.CHAIR_CAR || c == CoachClass.EXECUTIVE_CHAIR || c == CoachClass.SECOND_SEATING) {
            int mod = berthNum % 3;
            if (mod == 1) return "Window Seat (WS)";
            if (mod == 2) return "Middle Seat (M)";
            return "Aisle Seat (AS)";
        }
        int mod = berthNum % 8;
        return switch (mod) {
            case 1, 4 -> "Lower Berth (LB)";
            case 2, 5 -> "Middle Berth (MB)";
            case 3, 6 -> "Upper Berth (UB)";
            case 7 -> "Side Lower (SL)";
            case 0 -> "Side Upper (SU)";
            default -> "Lower Berth (LB)";
        };
    }

    private Reservation mapResultSet(ResultSet rs) throws SQLException {
        return new Reservation(
                rs.getString("pnr"),
                rs.getString("train_number"),
                rs.getString("source_station_code"),
                rs.getString("destination_station_code"),
                rs.getString("journey_date"),
                CoachClass.fromCode(rs.getString("coach_class")),
                BookingStatus.valueOf(rs.getString("booking_status")),
                rs.getDouble("base_fare"),
                rs.getDouble("reservation_charge"),
                rs.getDouble("superfast_charge"),
                rs.getDouble("catering_charge"),
                rs.getDouble("gst_amount"),
                rs.getDouble("senior_discount"),
                rs.getDouble("total_fare"),
                rs.getString("booked_at")
        );
    }
}
