package com.railway.reservation.repository;

import com.railway.reservation.entity.*;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository Integration Test Suite
 *
 * NOTE FOR LAB VIVA:
 * These tests demonstrate Spring Boot Data JPA integration testing with JUnit 5.
 * In a real environment, integration tests connect to a live MySQL database
 * (or an in-memory test database like H2) to execute actual SQL transactions.
 */
@SpringBootTest
public class RepositoryIntegrationTest {

    @Autowired(required = false)
    private TrainRepository trainRepository;

    @Autowired(required = false)
    private StationRepository stationRepository;

    @Autowired(required = false)
    private PassengerRepository passengerRepository;

    @Autowired(required = false)
    private ReservationRepository reservationRepository;

    @Test
    @DisplayName("Verify Repository Dependency Injection in Spring Context")
    void contextLoads() {
        // Confirms that the Spring ApplicationContext wires the repositories
        assertNotNull(trainRepository, "TrainRepository bean should be registered in context");
        assertNotNull(stationRepository, "StationRepository bean should be registered in context");
        assertNotNull(passengerRepository, "PassengerRepository bean should be registered in context");
        assertNotNull(reservationRepository, "ReservationRepository bean should be registered in context");
    }

    @Test
    @DisplayName("Test Station & Train Entity Persistence and Retrieval")
    void testSaveAndFindTrain() {
        if (stationRepository == null || trainRepository == null) return;

        // 1. Setup Station Entities
        StationEntity origin = new StationEntity("TEST_NDLS", "Test New Delhi", "Delhi", "Delhi", "Northern");
        StationEntity destination = new StationEntity("TEST_HWH", "Test Howrah", "Kolkata", "West Bengal", "Eastern");
        stationRepository.save(origin);
        stationRepository.save(destination);

        // 2. Persist Polymorphic Train Entity (RajdhaniTrainEntity)
        RajdhaniTrainEntity rajdhani = new RajdhaniTrainEntity(
                "99901",
                "Test Rajdhani Express",
                origin,
                destination,
                LocalTime.of(16, 50),
                LocalTime.of(10, 5),
                "17h 15m",
                1450,
                "Daily"
        );
        trainRepository.save(rajdhani);

        // 3. Verify Retrieval
        Optional<BaseTrainEntity> retrieved = trainRepository.findByTrainNumber("99901");
        assertTrue(retrieved.isPresent(), "Train should be found by train number");
        assertEquals("Test Rajdhani Express", retrieved.get().getTrainName());
        assertTrue(retrieved.get() instanceof RajdhaniTrainEntity, "Should retain polymorphic subclass type");
    }

    @Test
    @DisplayName("Test Passenger Profile Persistence and Validation")
    void testSaveAndFindPassenger() {
        if (passengerRepository == null) return;

        // 1. Create Passenger
        PassengerEntity passenger = new PassengerEntity(
                "Shiv Shankar Mal",
                21,
                Gender.MALE,
                "+91 98765 43210",
                "malshiv888@test.com",
                IdProofType.AADHAAR_CARD,
                "7829-4412-9081"
        );
        passengerRepository.save(passenger);

        // 2. Verify Query by Phone & Senior Citizen Check
        Optional<PassengerEntity> retrieved = passengerRepository.findByPhone("+91 98765 43210");
        assertTrue(retrieved.isPresent(), "Passenger should be retrievable by phone number");
        assertEquals("Shiv Shankar Mal", retrieved.get().getFullName());
        assertFalse(retrieved.get().isSeniorCitizen(), "21-year old should not qualify as senior citizen");
    }

    @Test
    @DisplayName("Test Reservation Master Record Persistence by 10-Digit PNR")
    void testSaveAndFindReservationByPnr() {
        if (reservationRepository == null || trainRepository == null || stationRepository == null) return;

        StationEntity origin = stationRepository.findById("TEST_NDLS").orElseGet(() ->
                stationRepository.save(new StationEntity("TEST_NDLS", "Test New Delhi", "Delhi", "Delhi", "Northern")));
        StationEntity destination = stationRepository.findById("TEST_HWH").orElseGet(() ->
                stationRepository.save(new StationEntity("TEST_HWH", "Test Howrah", "Kolkata", "West Bengal", "Eastern")));

        BaseTrainEntity train = trainRepository.findById("99901").orElseGet(() ->
                trainRepository.save(new RajdhaniTrainEntity("99901", "Test Rajdhani", origin, destination,
                        LocalTime.of(16, 50), LocalTime.of(10, 5), "17h", 1450, "Daily")));

        String testPnr = "9998887776";
        ReservationEntity reservation = new ReservationEntity(
                testPnr,
                train,
                origin,
                destination,
                LocalDate.now().plusDays(10),
                CoachClass.THIRD_AC,
                BigDecimal.valueOf(1950.00),
                BigDecimal.valueOf(40.00),
                BigDecimal.valueOf(75.00),
                BigDecimal.valueOf(340.00),
                BigDecimal.valueOf(120.25),
                BigDecimal.ZERO,
                BigDecimal.valueOf(2525.25)
        );
        reservationRepository.save(reservation);

        Optional<ReservationEntity> retrieved = reservationRepository.findByPnr(testPnr);
        assertTrue(retrieved.isPresent(), "Reservation must be retrievable by 10-digit PNR");
        assertEquals(BookingStatus.CONFIRMED, retrieved.get().getBookingStatus());
        assertEquals("999-8887776", retrieved.get().getFormattedPnr());
    }
}
