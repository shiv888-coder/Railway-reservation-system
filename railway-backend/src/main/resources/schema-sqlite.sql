-- =============================================================================
-- Group 9 Railway Reservation System - SQLite Database Schema
-- Student: Shiv Shankar Mal | Roll: 27600124048 | Group: 9
-- Course: Object-Oriented Programming (Java) Lab
-- Completely Offline Embedded SQLite Database
-- =============================================================================

PRAGMA foreign_keys = ON;

-- 1. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    station_code TEXT NOT NULL PRIMARY KEY,
    station_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zone TEXT NOT NULL,
    category TEXT DEFAULT 'NSG-4'
);

-- 2. Trains Master Table
CREATE TABLE IF NOT EXISTS trains (
    train_number TEXT NOT NULL PRIMARY KEY,
    train_name TEXT NOT NULL,
    train_type TEXT NOT NULL,
    source_station_code TEXT NOT NULL,
    destination_station_code TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration TEXT NOT NULL,
    distance_km INTEGER NOT NULL,
    operating_days TEXT NOT NULL,
    FOREIGN KEY (source_station_code) REFERENCES stations(station_code),
    FOREIGN KEY (destination_station_code) REFERENCES stations(station_code)
);

-- 3. Train Routes Table (Sequential Halts & Distances)
CREATE TABLE IF NOT EXISTS train_routes (
    route_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    station_code TEXT NOT NULL,
    stop_sequence INTEGER NOT NULL,
    distance_km INTEGER NOT NULL,
    UNIQUE(train_number, stop_sequence),
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE,
    FOREIGN KEY (station_code) REFERENCES stations(station_code)
);

-- 4. Train Schedules Table (Arrival, Departure, Halts & Operating Days)
CREATE TABLE IF NOT EXISTS train_schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    station_code TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    halt_minutes INTEGER NOT NULL DEFAULT 2,
    day_number INTEGER NOT NULL DEFAULT 1,
    stop_sequence INTEGER NOT NULL,
    UNIQUE(train_number, stop_sequence),
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE,
    FOREIGN KEY (station_code) REFERENCES stations(station_code)
);

-- 5. Train Classes Table (Class Availability & Base Tariffs)
CREATE TABLE IF NOT EXISTS train_classes (
    class_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    coach_class TEXT NOT NULL,
    base_fare REAL NOT NULL,
    UNIQUE(train_number, coach_class),
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE
);

-- 6. Seat Inventory Table (Quota & Real-Time Availability)
CREATE TABLE IF NOT EXISTS seat_inventory (
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL,
    coach_class TEXT NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    UNIQUE(train_number, coach_class),
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE
);

-- 7. Passengers Directory Table
CREATE TABLE IF NOT EXISTS passengers (
    passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0),
    gender TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    id_proof_type TEXT,
    id_proof_number TEXT,
    created_at TEXT NOT NULL
);

-- 8. Reservations Master Table (10-Digit Unique PNR Records)
CREATE TABLE IF NOT EXISTS reservations (
    pnr TEXT NOT NULL PRIMARY KEY,
    train_number TEXT NOT NULL,
    source_station_code TEXT NOT NULL,
    destination_station_code TEXT NOT NULL,
    journey_date TEXT NOT NULL,
    coach_class TEXT NOT NULL,
    booking_status TEXT NOT NULL,
    base_fare REAL NOT NULL,
    reservation_charge REAL NOT NULL,
    superfast_charge REAL NOT NULL,
    catering_charge REAL NOT NULL,
    gst_amount REAL NOT NULL,
    senior_discount REAL NOT NULL,
    total_fare REAL NOT NULL,
    booked_at TEXT NOT NULL,
    FOREIGN KEY (train_number) REFERENCES trains(train_number),
    FOREIGN KEY (source_station_code) REFERENCES stations(station_code),
    FOREIGN KEY (destination_station_code) REFERENCES stations(station_code)
);

-- 9. Reservation Passengers (Berth & Coach Allocations for Multiple Passengers)
CREATE TABLE IF NOT EXISTS reservation_passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr TEXT NOT NULL,
    passenger_id INTEGER NOT NULL,
    coach_number TEXT NOT NULL,
    berth_number INTEGER NOT NULL,
    berth_type TEXT NOT NULL,
    fare_charged REAL NOT NULL,
    FOREIGN KEY (pnr) REFERENCES reservations(pnr) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id)
);

-- 10. Cancellations Table (Refund & Audit Slips)
CREATE TABLE IF NOT EXISTS cancellations (
    cancellation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr TEXT NOT NULL UNIQUE,
    cancelled_at TEXT NOT NULL,
    cancellation_fee REAL NOT NULL,
    refund_amount REAL NOT NULL,
    cancellation_reason TEXT NOT NULL,
    refund_reference_id TEXT NOT NULL UNIQUE,
    FOREIGN KEY (pnr) REFERENCES reservations(pnr) ON DELETE CASCADE
);

-- 11. Admin Users Table (Local Authentication for Station/Inventory Management)
CREATE TABLE IF NOT EXISTS admin_users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'OPERATOR',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

-- 12. Dataset Metadata & Migration Tracking (Prevents duplicate imports)
CREATE TABLE IF NOT EXISTS dataset_metadata (
    meta_key TEXT NOT NULL PRIMARY KEY,
    meta_value TEXT NOT NULL,
    imported_at TEXT NOT NULL
);

-- Indices for Fast Search & Timetable Lookups
CREATE INDEX IF NOT EXISTS idx_trains_src_dst ON trains(source_station_code, destination_station_code);
CREATE INDEX IF NOT EXISTS idx_train_routes_station ON train_routes(station_code);
CREATE INDEX IF NOT EXISTS idx_train_schedules_train ON train_schedules(train_number);
CREATE INDEX IF NOT EXISTS idx_reservations_train ON reservations(train_number);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(journey_date);
CREATE INDEX IF NOT EXISTS idx_res_passengers_pnr ON reservation_passengers(pnr);
