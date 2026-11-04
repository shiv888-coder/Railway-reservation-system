-- =============================================================================
-- Railway Reservation System - Sample Data (MySQL 8)
-- B.Tech CSE Java OOP Lab Mini Project
-- Student: Shiv Shankar Mal | Group: 9 | Roll: 2760012408
-- =============================================================================

USE railway_db;

-- 1. Insert Stations (At least 8 stations)
INSERT IGNORE INTO stations (station_code, station_name, city, state, zone) VALUES
('NDLS', 'New Delhi Railway Station', 'New Delhi', 'Delhi', 'Northern Railway (NR)'),
('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'Eastern Railway (ER)'),
('CSMT', 'Chhatrapati Shivaji Maharaj Terminus', 'Mumbai', 'Maharashtra', 'Central Railway (CR)'),
('MAS', 'Puratchi Thalaivar Dr. M.G.R. Chennai Central', 'Chennai', 'Tamil Nadu', 'Southern Railway (SR)'),
('SBC', 'KSR Bengaluru City Junction', 'Bengaluru', 'Karnataka', 'South Western Railway (SWR)'),
('ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat', 'Western Railway (WR)'),
('BSB', 'Varanasi Junction', 'Varanasi', 'Uttar Pradesh', 'Northern Railway (NR)'),
('PNBE', 'Patna Junction', 'Patna', 'Bihar', 'East Central Railway (ECR)'),
('CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'North Central Railway (NCR)'),
('PUNE', 'Pune Junction', 'Pune', 'Maharashtra', 'Central Railway (CR)'),
('NH', 'Naihati Junction', 'Naihati', 'West Bengal', 'Eastern Railway (ER)'),
('RPH', 'Rampurhat Junction', 'Rampurhat', 'West Bengal', 'Eastern Railway (ER)'),
('SDAH', 'Sealdah', 'Kolkata', 'West Bengal', 'Eastern Railway (ER)'),
('BHP', 'Bolpur Shantiniketan', 'Bolpur', 'West Bengal', 'Eastern Railway (ER)'),
('MLDT', 'Malda Town', 'Malda', 'West Bengal', 'Eastern Railway (ER)'),
('NJP', 'New Jalpaiguri Junction', 'Siliguri', 'West Bengal', 'Northeast Frontier Railway (NFR)'),
('BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh', 'West Central Railway (WCR)'),
('BKN', 'Bikaner Junction', 'Bikaner', 'Rajasthan', 'North Western Railway (NWR)'),
('BDTS', 'Bandra Terminus', 'Mumbai', 'Maharashtra', 'Western Railway (WR)'),
('NZM', 'Hazrat Nizamuddin', 'New Delhi', 'Delhi', 'Northern Railway (NR)'),
('BWN', 'Barddhaman Junction', 'Bardhaman', 'West Bengal', 'Eastern Railway (ER)'),
('BOE', 'Barsoi Junction', 'Barsoi', 'Bihar', 'Northeast Frontier Railway (NFR)');

-- 2. Insert Trains (OOP Inheritance Hierarchy)
INSERT IGNORE INTO trains (train_number, train_category, train_name, train_type, source_station_code, destination_station_code, departure_time, arrival_time, duration_hours, distance_km, days_of_operation) VALUES
('12301', 'RAJDHANI', 'Howrah Rajdhani Express', 'RAJDHANI', 'HWH', 'NDLS', '16:50:00', '10:05:00', '17h 15m', 1451, 'Daily'),
('22436', 'VANDE_BHARAT', 'Vande Bharat Express', 'VANDE_BHARAT', 'BSB', 'NDLS', '15:00:00', '23:00:00', '8h 00m', 759, 'Tue, Wed, Fri, Sat, Sun'),
('12952', 'RAJDHANI', 'Mumbai Rajdhani Express', 'RAJDHANI', 'NDLS', 'CSMT', '16:55:00', '08:35:00', '15h 40m', 1386, 'Daily'),
('12810', 'SUPERFAST', 'Howrah Mumbai Superfast Mail', 'SUPERFAST', 'HWH', 'CSMT', '19:40:00', '04:25:00', '32h 45m', 1968, 'Daily'),
('20608', 'VANDE_BHARAT', 'Vande Bharat Express (SBC - MAS)', 'VANDE_BHARAT', 'SBC', 'MAS', '05:45:00', '10:15:00', '4h 30m', 359, 'Mon, Tue, Thu, Fri, Sat, Sun'),
('12622', 'SUPERFAST', 'Tamil Nadu Superfast Express', 'SUPERFAST', 'NDLS', 'MAS', '21:05:00', '06:35:00', '33h 30m', 2184, 'Daily'),
('12002', 'SUPERFAST', 'Bhopal Shatabdi Express', 'SHATABDI', 'NDLS', 'BPL', '06:00:00', '14:40:00', '8h 40m', 707, 'Daily'),
('12260', 'SUPERFAST', 'Sealdah Bikaner Duronto Express', 'DURONTO', 'SDAH', 'BKN', '17:00:00', '19:15:00', '26h 15m', 1916, 'Mon, Wed, Thu, Sun'),
('12909', 'SUPERFAST', 'Bandra Terminus Garib Rath Express', 'GARIB_RATH', 'BDTS', 'NZM', '17:30:00', '09:40:00', '16h 10m', 1367, 'Tue, Thu, Sat'),
('12377', 'SUPERFAST', 'Padatik Superfast Express', 'SUPERFAST', 'SDAH', 'NJP', '23:20:00', '09:15:00', '9h 55m', 567, 'Daily');

-- 3. Insert Scheduled Route Halts
INSERT IGNORE INTO route_halts (halt_id, train_number, station_code, arrival_time, departure_time, halt_minutes, distance_km, day_number, stop_sequence) VALUES
-- Train 12301
(1, '12301', 'HWH', '16:50', '16:50', 0, 0, 1, 1),
(2, '12301', 'PNBE', '22:10', '22:20', 10, 532, 1, 2),
(3, '12301', 'CNB', '04:50', '04:55', 5, 1012, 2, 3),
(4, '12301', 'NDLS', '10:05', '10:05', 0, 1451, 2, 4),
-- Train 22436
(5, '22436', 'BSB', '15:00', '15:00', 0, 0, 1, 1),
(6, '22436', 'CNB', '18:30', '18:35', 5, 319, 1, 2),
(7, '22436', 'NDLS', '23:00', '23:00', 0, 759, 1, 3),
-- Train 12952
(8, '12952', 'NDLS', '16:55', '16:55', 0, 0, 1, 1),
(9, '12952', 'ADI', '03:15', '03:25', 10, 934, 2, 2),
(10, '12952', 'CSMT', '08:35', '08:35', 0, 1386, 2, 3),
-- Train 12810
(11, '12810', 'HWH', '19:40', '19:40', 0, 0, 1, 1),
(12, '12810', 'BSB', '08:15', '08:25', 10, 678, 2, 2),
(13, '12810', 'PUNE', '23:10', '23:20', 10, 1776, 2, 3),
(14, '12810', 'CSMT', '04:25', '04:25', 0, 1968, 3, 4),
-- Train 20608
(15, '20608', 'SBC', '05:45', '05:45', 0, 0, 1, 1),
(16, '20608', 'MAS', '10:15', '10:15', 0, 359, 1, 2),
-- Train 12622
(17, '12622', 'NDLS', '21:05', '21:05', 0, 0, 1, 1),
(18, '12622', 'CNB', '02:40', '02:45', 5, 440, 2, 2),
(19, '12622', 'MAS', '06:35', '06:35', 0, 2184, 3, 3),
-- Train 12377 (Padatik Express serving Naihati and Rampurhat)
(20, '12377', 'SDAH', '23:20', '23:20', 0, 0, 1, 1),
(21, '12377', 'NH', '00:03', '00:05', 2, 38, 2, 2),
(22, '12377', 'BWN', '01:05', '01:07', 2, 102, 2, 3),
(23, '12377', 'BHP', '01:52', '01:54', 2, 154, 2, 4),
(24, '12377', 'RPH', '02:45', '02:47', 2, 214, 2, 5),
(25, '12377', 'MLDT', '05:25', '05:35', 10, 338, 2, 6),
(26, '12377', 'BOE', '07:05', '07:07', 2, 428, 2, 7),
(27, '12377', 'NJP', '09:15', '09:15', 0, 567, 2, 8);

-- 4. Insert Train Seat Configurations
INSERT IGNORE INTO train_seats (id, train_number, coach_class, total_seats, available_seats, base_fare, version) VALUES
-- Train 12301
(1, '12301', 'FIRST_AC', 36, 28, 4850.00, 0),
(2, '12301', 'SECOND_AC', 112, 86, 2950.00, 0),
(3, '12301', 'THIRD_AC', 240, 185, 1950.00, 0),
-- Train 22436
(4, '22436', 'CHAIR_CAR', 300, 210, 1450.00, 0),
(5, '22436', 'EXECUTIVE_CHAIR', 52, 38, 2680.00, 0),
-- Train 12952
(6, '12952', 'FIRST_AC', 32, 24, 4650.00, 0),
(7, '12952', 'SECOND_AC', 120, 94, 2820.00, 0),
(8, '12952', 'THIRD_AC', 220, 172, 1890.00, 0),
-- Train 12810
(9, '12810', 'FIRST_AC', 24, 18, 3840.00, 0),
(10, '12810', 'SECOND_AC', 80, 62, 2310.00, 0),
(11, '12810', 'THIRD_AC', 180, 135, 1580.00, 0),
(12, '12810', 'SLEEPER', 400, 310, 640.00, 0),
-- Train 20608
(13, '20608', 'CHAIR_CAR', 320, 265, 995.00, 0),
(14, '20608', 'EXECUTIVE_CHAIR', 52, 44, 1885.00, 0),
-- Train 12622
(15, '12622', 'SECOND_AC', 72, 54, 2650.00, 0),
(16, '12622', 'THIRD_AC', 210, 168, 1720.00, 0),
(17, '12622', 'SLEEPER', 480, 390, 710.00, 0),
-- Train 12377
(18, '12377', 'FIRST_AC', 18, 14, 2480.00, 0),
(19, '12377', 'SECOND_AC', 64, 48, 1480.00, 0),
(20, '12377', 'THIRD_AC', 216, 172, 1050.00, 0),
(21, '12377', 'SLEEPER', 340, 260, 375.00, 0);

-- 5. Insert Sample Passengers
INSERT IGNORE INTO passengers (passenger_id, full_name, age, gender, phone, email, id_proof_type, id_proof_number, created_at) VALUES
(1, 'Shiv Shankar Mal', 22, 'MALE', '+91 98765 43210', 'shiv.cse@lab.edu', 'AADHAAR_CARD', '9876-5432-1098', NOW()),
(2, 'Prof. Rajesh Sharma', 62, 'MALE', '+91 91234 56780', 'rajesh.prof@university.ac.in', 'PAN_CARD', 'ABCPS1234F', NOW()),
(3, 'Dr. Ananya Sen', 34, 'FEMALE', '+91 98301 23456', 'ananya.sen@medresearch.org', 'PASSPORT', 'Z9876543', NOW());

-- 6. Insert Verified Initial Reservation (PNR: 2849182374)
INSERT IGNORE INTO reservations (pnr, train_number, source_station_code, destination_station_code, journey_date, travel_class, booking_status, base_fare, reservation_charge, superfast_charge, catering_charge, gst_amount, senior_discount, total_fare, booked_at) VALUES
('2849182374', '12301', 'HWH', 'NDLS', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 'THIRD_AC', 'CONFIRMED', 3900.00, 80.00, 150.00, 680.00, 216.13, 487.50, 4538.63, NOW());

-- 7. Insert Seat Allocations for PNR 2849182374
INSERT IGNORE INTO seat_allocations (allocation_id, pnr, passenger_id, coach_number, berth_number, berth_type) VALUES
(1, '2849182374', 1, 'B2', 21, 'Lower Berth'),
(2, '2849182374', 2, 'B2', 22, 'Middle Berth');
