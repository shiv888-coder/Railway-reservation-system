# Indian Railway Reservation System (IRRS)
### Production-Ready Full-Stack Web Application & B.Tech CSE Java OOP Mini Project

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-green.svg)](https://spring.io/projects/spring-boot)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38bdf8.svg)](https://tailwindcss.com)

**Student Name:** Shiv Shankar Mal  
**Roll Number:** 27600124048  
**Project Group:** Group 9  
**Academic Program:** B.Tech Computer Science & Engineering (Semester IV)  
**Course:** Object-Oriented Programming Lab (Java)  

---

## 🚆 System Highlights & Offline Desktop Architecture

1. **100% Offline Standalone Architecture:**
   - **Java 21 LTS** as the core programming language.
   - **Java Swing** with FlatLaf modern desktop UI.
   - **Embedded SQLite Database (`railway.db`)** via JDBC.
   - **Zero external APIs, zero internet dependencies, and zero database server installation required.**

2. **Normalized SQLite Database Schema (11 Relational Tables):**
   - `stations`: 367 authentic Indian Railway stations across all 18 zones with codes, names, cities, states, and railway zones.
   - `trains`: 38 verified passenger trains with categories, source/destination, operating days, and distances.
   - `train_routes`: Sequence-ordered intermediate station halts and cumulative distances.
   - `train_schedules`: Timetable arrival, departure, halt durations, and day numbers.
   - `train_classes`: Class availability and base fare tariffs for 1A, 2A, 3A, SL, CC, EC, and 2S.
   - `seat_inventory`: Quota allocation and real-time available seat inventory with `CHECK (available_seats >= 0)`.
   - `passengers`: Traveler profiles with identity proofs, age, and senior citizen validation.
   - `reservations`: Master booking ledger with authentic 10-digit unique PNRs, booking status, and itemized tariffs.
   - `reservation_passengers`: Multiple passenger seat/berth and coach allocations linked by PNR.
   - `cancellations`: Cancellation audit slips with cancellation fee deduction, refund calculation, and refund reference IDs.
   - `admin_users`: Local administrative accounts with SHA-256 hashed credentials.
   - `dataset_metadata`: Migration and version tracking (`v2.0.0`) to prevent duplicate imports on restarts.

3. **Bundled Authentic Indian Railways Datasets (CSV):**
   - Stored locally in `src/main/resources/data/`:
     - `stations.csv`: 367 verified stations.
     - `trains.csv`: 38 verified authentic trains (Rajdhani, Vande Bharat, Shatabdi, Duronto, Garib Rath, Superfast, Mail/Express).
     - `train_routes.csv`: 254 route halts and cumulative kilometer markers.
     - `train_schedules.csv`: 254 halt timings.
     - `train_classes.csv`: 234 class tariffs.
     - `seat_inventory.csv`: 234 initial class seat quotas.
     - `admin_users.csv`: Initial administrator credentials.
   - **Source Attribution:** National Train Enquiry System (NTES) & Open Government Data (OGD) Platform India under Government Open Data License (GODL) / NDSAP. Update Date: November 2026.

4. **Data Integrity & Transactional Safeguards:**
   - **Prepared Statements** used across all JDBC queries to prevent SQL injection.
   - **ACID Transactions** (`conn.setAutoCommit(false)`, `commit()`, `rollback()`) for multi-passenger bookings and ticket cancellations.
   - **Atomic Seat Management:** Atomic decrement prevents negative seat availability; automatic seat restoration on cancellation.
   - **Data Persistence:** SQLite file preserves all bookings and cancellations across application restarts.

5. **Java OOP Architectural Principles Demonstrated:**
   - **Abstraction:** `abstract class Train` with abstract `calculateFare(CoachClass, double distance)`.
   - **Inheritance:** Concrete subclasses `RajdhaniTrain`, `VandeBharatTrain`, `SuperfastTrain`, `MailExpressTrain`.
   - **Polymorphism:** Subclass-specific dynamic fare calculation algorithms.
   - **Encapsulation:** Strongly typed domain models with validated state transitions and getters/setters.
   - **Exception Handling:** Domain-specific exceptions (`DatabaseException`, `InsufficientSeatsException`, `ResourceNotFoundException`).

---

## 🚀 Quick Start (Development & Production)

### 1. Run with Node.js / Express (Integrated Production Server)
```bash
# Install dependencies
npm install

# Start development / production server (serves both React SPA and /api/* on port 3000)
npm start
```
Visit `http://localhost:3000` in your browser.

### 2. Optional: Run Java Spring Boot Backend
```bash
cd railway-backend
mvn clean spring-boot:run
```
Spring Boot REST API will be available at `http://localhost:8080/api`.

---

## 🌐 Online Deployment

For deploying online to Render, Railway, Fly.io, or Google Cloud Run, see the complete guide in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

> **Note on GitHub Pages:** GitHub Pages is a static file host and cannot execute Node.js or Spring Boot backends. Use Render, Railway, or Fly.io for online deployment.

---

## 🔒 Security & API Configuration

To configure live running status tracking, supply the following server-side environment variables (via AI Studio Settings → Secrets or your cloud dashboard):

- `RAILWAY_API_KEY`: Private RapidAPI key.
- `RAILWAY_API_HOST`: Provider host header.
- `RAILWAY_API_URL`: Target live status endpoint.

*Never paste API keys in chat or commit `.env` files.*
