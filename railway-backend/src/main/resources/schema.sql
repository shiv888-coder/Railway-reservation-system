-- =============================================================================
-- Railway Reservation System - Database Schema (MySQL 8)
-- B.Tech CSE Java OOP Lab Mini Project
-- Student: Shiv Shankar Mal | Group: 9 | Roll: 2760012408
-- =============================================================================

CREATE DATABASE IF NOT EXISTS railway_db;
USE railway_db;

-- 1. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    station_code VARCHAR(10) NOT NULL PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    zone VARCHAR(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Trains Master Table (JPA SINGLE_TABLE Inheritance)
-- Subclasses: RAJDHANI, VANDE_BHARAT, SUPERFAST
CREATE TABLE IF NOT EXISTS trains (
    train_number VARCHAR(10) NOT NULL PRIMARY KEY,
    train_category VARCHAR(30) NOT NULL,
    train_name VARCHAR(120) NOT NULL,
    train_type VARCHAR(30) NOT NULL,
    source_station_code VARCHAR(10) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_hours VARCHAR(20) NOT NULL,
    distance_km INT NOT NULL,
    days_of_operation VARCHAR(120) NOT NULL,
    CONSTRAINT fk_train_source FOREIGN KEY (source_station_code) REFERENCES stations(station_code),
    CONSTRAINT fk_train_dest FOREIGN KEY (destination_station_code) REFERENCES stations(station_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Route Halts Table (Intermediate Timetables)
CREATE TABLE IF NOT EXISTS route_halts (
    halt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL,
    station_code VARCHAR(10) NOT NULL,
    arrival_time VARCHAR(15) NOT NULL,
    departure_time VARCHAR(15) NOT NULL,
    halt_minutes INT NOT NULL,
    distance_km INT NOT NULL,
    day_number INT NOT NULL,
    stop_sequence INT NOT NULL,
    CONSTRAINT fk_halt_train FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE,
    CONSTRAINT fk_halt_station FOREIGN KEY (station_code) REFERENCES stations(station_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Train Seats Table (Class-wise Inventory & Base Tariffs)
CREATE TABLE IF NOT EXISTS train_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL,
    coach_class VARCHAR(20) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    version INT DEFAULT 0,
    CONSTRAINT uk_train_class UNIQUE (train_number, coach_class),
    CONSTRAINT fk_seat_train FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Passengers Directory Table
CREATE TABLE IF NOT EXISTS passengers (
    passenger_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(120) NOT NULL,
    id_proof_type VARCHAR(30) NOT NULL,
    id_proof_number VARCHAR(60) NOT NULL,
    created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Reservations (PNR Booking Records)
CREATE TABLE IF NOT EXISTS reservations (
    pnr VARCHAR(10) NOT NULL PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL,
    source_station_code VARCHAR(10) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    journey_date DATE NOT NULL,
    travel_class VARCHAR(20) NOT NULL,
    booking_status VARCHAR(20) NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    reservation_charge DECIMAL(10,2) NOT NULL,
    superfast_charge DECIMAL(10,2) NOT NULL,
    catering_charge DECIMAL(10,2) NOT NULL,
    gst_amount DECIMAL(10,2) NOT NULL,
    senior_discount DECIMAL(10,2) NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booked_at DATETIME NOT NULL,
    CONSTRAINT fk_res_train FOREIGN KEY (train_number) REFERENCES trains(train_number),
    CONSTRAINT fk_res_source FOREIGN KEY (source_station_code) REFERENCES stations(station_code),
    CONSTRAINT fk_res_dest FOREIGN KEY (destination_station_code) REFERENCES stations(station_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Seat Allocations (Coach and Berth Assignments)
CREATE TABLE IF NOT EXISTS seat_allocations (
    allocation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) NOT NULL,
    passenger_id BIGINT NOT NULL,
    coach_number VARCHAR(15) NOT NULL,
    berth_number INT NOT NULL,
    berth_type VARCHAR(40) NOT NULL,
    CONSTRAINT fk_alloc_res FOREIGN KEY (pnr) REFERENCES reservations(pnr) ON DELETE CASCADE,
    CONSTRAINT fk_alloc_passenger FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Cancellation Slips (Audit Voucher & Refund Record)
CREATE TABLE IF NOT EXISTS cancellation_slips (
    slip_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) NOT NULL UNIQUE,
    cancelled_at DATETIME NOT NULL,
    cancellation_fee DECIMAL(10,2) NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    cancellation_reason VARCHAR(255) NOT NULL,
    refund_reference_id VARCHAR(40) NOT NULL UNIQUE,
    CONSTRAINT fk_cancel_res FOREIGN KEY (pnr) REFERENCES reservations(pnr) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
