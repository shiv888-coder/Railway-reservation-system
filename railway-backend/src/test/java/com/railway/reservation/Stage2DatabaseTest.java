package com.railway.reservation;

import com.railway.reservation.dao.*;
import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.exception.InsufficientSeatsException;
import com.railway.reservation.model.*;
import org.junit.jupiter.api.*;

import java.io.File;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Stage 2 Automated Verification Test Suite.
 * Validates SQLite Schema, Bundled Dataset Ingestion, JDBC DAOs, and ACID Transactions.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Stage2DatabaseTest {

    private static final String TEST_DB = "target/test-railway.db";
    private static DatabaseManager dbManager;
    private static StationDAO stationDAO;
    private static TrainDAO trainDAO;
    private static RouteDAO routeDAO;
    private static SeatInventoryDAO inventoryDAO;
    private static PassengerDAO passengerDAO;
    private static ReservationDAO reservationDAO;
    private static CancellationDAO cancellationDAO;
    private static AdminUserDAO adminUserDAO;

    @BeforeAll
    static void setUpAll() {
        File file = new File(TEST_DB);
        if (file.exists()) {
            file.delete();
        }
        dbManager = new DatabaseManager(TEST_DB);
        dbManager.initializeDatabase();

        stationDAO = new StationDAO(dbManager);
        trainDAO = new TrainDAO(dbManager);
        routeDAO = new RouteDAO(dbManager);
        inventoryDAO = new SeatInventoryDAO(dbManager);
        passengerDAO = new PassengerDAO(dbManager);
        reservationDAO = new ReservationDAO(dbManager, passengerDAO, inventoryDAO);
        cancellationDAO = new CancellationDAO(dbManager, reservationDAO, inventoryDAO);
        adminUserDAO = new AdminUserDAO(dbManager);
    }

    @Test
    @Order(1)
    @DisplayName("Verify Database File Creation & Table Schema")
    void testDatabaseCreation() {
        File dbFile = new File(TEST_DB);
        assertTrue(dbFile.exists(), "SQLite database file should exist");
        assertTrue(dbFile.length() > 0, "Database file should be populated");
    }

    @Test
    @Order(2)
    @DisplayName("Verify Station Dataset Ingestion (367 Authentic Stations)")
    void testStationDataset() {
        int count = stationDAO.countStations();
        assertEquals(367, count, "Should have exactly 367 authentic stations");

        Optional<Station> hwh = stationDAO.findByCode("HWH");
        assertTrue(hwh.isPresent(), "Howrah Junction should exist");
        assertEquals("Howrah Junction", hwh.get().getStationName());
        assertEquals("Eastern Railway (ER)", hwh.get().getZone());

        Optional<Station> nh = stationDAO.findByCode("NH");
        assertTrue(nh.isPresent(), "Naihati Junction should exist");

        Optional<Station> rph = stationDAO.findByCode("RPH");
        assertTrue(rph.isPresent(), "Rampurhat Junction should exist");

        List<Station> kolkataStations = stationDAO.searchStations("Kolkata");
        assertFalse(kolkataStations.isEmpty(), "Should find stations in Kolkata city");
    }

    @Test
    @Order(3)
    @DisplayName("Verify Train Dataset Ingestion (38 Verified Authentic Trains)")
    void testTrainDataset() {
        int count = trainDAO.countTrains();
        assertEquals(38, count, "Should have 38 verified trains");

        Optional<Train> t12301 = trainDAO.findByNumber("12301");
        assertTrue(t12301.isPresent(), "Howrah Rajdhani 12301 should exist");
        assertInstanceOf(RajdhaniTrain.class, t12301.get(), "Train 12301 should be a RajdhaniTrain instance");
        assertEquals("HWH", t12301.get().getSourceStationCode());
        assertEquals("NDLS", t12301.get().getDestinationStationCode());

        Optional<Train> t12348 = trainDAO.findByNumber("12348");
        assertTrue(t12348.isPresent(), "Train 12348 (Sahid Express Return) should exist");
    }

    @Test
    @Order(4)
    @DisplayName("Verify Intermediate Route Search & Halts")
    void testRouteSearch() {
        // Howrah (HWH) to New Delhi (NDLS)
        List<Train> hwhToNdls = trainDAO.searchTrainsBetweenStations("HWH", "NDLS");
        assertFalse(hwhToNdls.isEmpty(), "Should find trains from HWH to NDLS");

        // Sealdah (SDAH) to Naihati (NH)
        List<Train> sdahToNh = trainDAO.searchTrainsBetweenStations("SDAH", "NH");
        assertFalse(sdahToNh.isEmpty(), "Should find trains serving SDAH to NH corridor");

        // Intermediate distance calculation
        int dist = routeDAO.calculateDistanceBetweenStations("12301", "HWH", "NDLS");
        assertTrue(dist >= 1440 && dist <= 1460, "Distance HWH to NDLS should be approx 1450 km (was " + dist + ")");
    }

    @Test
    @Order(5)
    @DisplayName("Verify Duplicate Prevention on Re-Initialization")
    void testDuplicateImportPrevention() {
        int initialStations = stationDAO.countStations();
        int initialTrains = trainDAO.countTrains();

        // Run initializeDatabase again
        dbManager.initializeDatabase();

        assertEquals(initialStations, stationDAO.countStations(), "Station count should remain identical");
        assertEquals(initialTrains, trainDAO.countTrains(), "Train count should remain identical");
    }

    @Test
    @Order(6)
    @DisplayName("Verify Multi-Passenger Booking, Unique PNR & Atomic Seat Decrement")
    void testMultiPassengerBooking() {
        String trainNum = "12301";
        CoachClass coachClass = CoachClass.THIRD_AC;
        int seatsBefore = inventoryDAO.getAvailableSeats(trainNum, coachClass);
        assertTrue(seatsBefore >= 2, "Need at least 2 seats for test");

        Reservation res = new Reservation();
        res.setTrainNumber(trainNum);
        res.setSourceStationCode("HWH");
        res.setDestinationStationCode("NDLS");
        res.setJourneyDate("2026-11-20");
        res.setCoachClass(coachClass);
        res.setBaseFare(1980.0 * 2);
        res.setReservationCharge(40.0 * 2);
        res.setSuperfastCharge(45.0 * 2);
        res.setCateringCharge(280.0 * 2);
        res.setGstAmount(120.0);
        res.setSeniorDiscount(0.0);
        res.setTotalFare(4770.0);

        List<Passenger> passengers = List.of(
                new Passenger(0, "Aarav Sharma", 32, Gender.MALE, "9876543210", "aarav@example.com", IdProofType.AADHAAR, "123456789012", null),
                new Passenger(0, "Priya Sharma", 29, Gender.FEMALE, "9876543211", "priya@example.com", IdProofType.PAN_CARD, "ABCDE1234F", null)
        );

        Reservation booked = reservationDAO.createReservation(res, passengers);

        assertNotNull(booked.getPnr(), "PNR must be generated");
        assertEquals(10, booked.getPnr().length(), "PNR must be exactly 10 digits");
        assertEquals(BookingStatus.CONFIRMED, booked.getBookingStatus());
        assertEquals(2, booked.getPassengers().size(), "Should have 2 passengers assigned");

        // Verify seats decremented
        int seatsAfter = inventoryDAO.getAvailableSeats(trainNum, coachClass);
        assertEquals(seatsBefore - 2, seatsAfter, "Available seats should have decremented by 2");

        // Lookup by PNR
        Optional<Reservation> retrieved = reservationDAO.findByPnr(booked.getPnr());
        assertTrue(retrieved.isPresent(), "Should retrieve reservation by PNR");
        assertEquals(2, retrieved.get().getPassengers().size());
    }

    @Test
    @Order(7)
    @DisplayName("Verify Seat Quota Exhaustion / Negative Seat Prevention")
    void testSeatExhaustionProtection() {
        assertThrows(InsufficientSeatsException.class, () -> {
            inventoryDAO.decrementSeats(dbManager.getConnection(), "12301", CoachClass.FIRST_AC, 99999);
        }, "Should throw InsufficientSeatsException when requesting more seats than available");
    }

    @Test
    @Order(8)
    @DisplayName("Verify Cancellation, Refund Calculation & Seat Restoration")
    void testCancellationAndSeatRestoration() {
        // Book 1 ticket
        String trainNum = "12301";
        CoachClass coachClass = CoachClass.THIRD_AC;
        int seatsBefore = inventoryDAO.getAvailableSeats(trainNum, coachClass);

        Reservation res = new Reservation();
        res.setTrainNumber(trainNum);
        res.setSourceStationCode("HWH");
        res.setDestinationStationCode("NDLS");
        res.setJourneyDate("2026-11-25");
        res.setCoachClass(coachClass);
        res.setBaseFare(1980.0);
        res.setReservationCharge(40.0);
        res.setSuperfastCharge(45.0);
        res.setCateringCharge(280.0);
        res.setGstAmount(60.0);
        res.setSeniorDiscount(0.0);
        res.setTotalFare(2405.0);

        List<Passenger> passengers = List.of(
                new Passenger(0, "Rohan Sen", 45, Gender.MALE, "9123456780", "rohan@example.com", IdProofType.AADHAAR, "998877665544", null)
        );

        Reservation booked = reservationDAO.createReservation(res, passengers);
        assertEquals(seatsBefore - 1, inventoryDAO.getAvailableSeats(trainNum, coachClass));

        // Cancel the ticket
        CancellationSlip slip = cancellationDAO.cancelTicket(booked.getPnr(), "Trip rescheduled");
        assertNotNull(slip, "Cancellation slip should be generated");
        assertTrue(slip.getRefundAmount() > 0, "Refund amount should be positive");
        assertTrue(slip.getCancellationFee() > 0, "Cancellation fee should be deducted");
        assertTrue(slip.getRefundReferenceId().startsWith("REF-"), "Refund reference format check");

        // Verify reservation status changed to CANCELLED
        Optional<Reservation> cancelledRes = reservationDAO.findByPnr(booked.getPnr());
        assertTrue(cancelledRes.isPresent());
        assertEquals(BookingStatus.CANCELLED, cancelledRes.get().getBookingStatus());

        // Verify seat was restored
        assertEquals(seatsBefore, inventoryDAO.getAvailableSeats(trainNum, coachClass), "Seats should be restored to initial level");

        // Verify double cancellation is rejected
        assertThrows(IllegalStateException.class, () -> {
            cancellationDAO.cancelTicket(booked.getPnr(), "Second try");
        }, "Re-cancellation should be rejected");
    }

    @Test
    @Order(9)
    @DisplayName("Verify Admin Local Authentication")
    void testAdminAuthentication() {
        Optional<AdminUser> admin = adminUserDAO.authenticate("admin", "admin123");
        assertTrue(admin.isPresent(), "Admin credentials should authenticate successfully");
        assertEquals("ADMIN", admin.get().getRole());

        Optional<AdminUser> badPass = adminUserDAO.authenticate("admin", "wrongpass");
        assertFalse(badPass.isPresent(), "Bad password should fail authentication");
    }
}
