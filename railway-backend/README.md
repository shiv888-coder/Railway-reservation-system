# Railway Reservation System — Java Spring Boot Backend

> **Academic Context:** Third-Year B.Tech CSE Java & Object-Oriented Programming (OOP) Lab Mini Project  
> **Student Name:** Shiv Shankar Mal  
> **Group Number:** 9  
> **Roll Number:** 2760012408  
> **Project Title:** Railway Reservation System  

---

## 1. Technology Stack

- **Language:** Java 17 (or Java 21 LTS)
- **Framework:** Spring Boot 3.2.4
- **Build Tool:** Apache Maven 3.8+
- **Database:** MySQL 8.0+
- **ORM / Persistence:** Spring Data JPA / Hibernate
- **Architecture:** Layered Architecture (Controller → Service → Repository → Database)

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
1. **Java Development Kit (JDK):** Version 17 or higher
   ```bash
   java -version
   javac -version
   ```
2. **Apache Maven:** Version 3.8+ (or use the Maven Wrapper)
   ```bash
   mvn -version
   ```
3. **MySQL Server:** Version 8.0+
   ```bash
   mysql --version
   ```

---

## 3. MySQL Database Setup

1. Log into your MySQL console or MySQL Workbench:
   ```bash
   mysql -u root -p
   ```

2. Create the project database:
   ```sql
   CREATE DATABASE IF NOT EXISTS railway_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   ```

3. (Optional) Create a dedicated project user:
   ```sql
   CREATE USER IF NOT EXISTS 'railway_user'@'localhost' IDENTIFIED BY 'Railway@2026';
   GRANT ALL PRIVILEGES ON railway_db.* TO 'railway_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## 4. Environment Variables Configuration

The application uses environment variables in `src/main/resources/application.properties` with sensible fallback defaults:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `SERVER_PORT` | HTTP port for the Spring Boot server | `8080` |
| `DB_URL` | JDBC connection URL for MySQL | `jdbc:mysql://localhost:3306/railway_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true` |
| `DB_USERNAME` | MySQL database username | `root` |
| `DB_PASSWORD` | MySQL database password | *(empty)* |
| `JPA_DDL_AUTO` | Hibernate schema management | `none` (use `update` during development) |
| `FRONTEND_URL` | Allowed CORS origins for the React app | `http://localhost:3000,http://localhost:5173` |

### Setting Environment Variables (Optional):

**Linux / macOS:**
```bash
export DB_URL="jdbc:mysql://localhost:3306/railway_db?useSSL=false&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="YourPasswordHere"
export JPA_DDL_AUTO="update"
```

**Windows (PowerShell):**
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/railway_db?useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YourPasswordHere"
$env:JPA_DDL_AUTO="update"
```

---

## 5. How to Build & Run the Backend

Navigate to the `railway-backend` directory:
```bash
cd railway-backend
```

### Option A: Run directly using Maven
```bash
mvn spring-boot:run
```

### Option B: Build and run packaged JAR
```bash
# 1. Clean and package the application into an executable JAR
mvn clean package -DskipTests

# 2. Run the generated JAR file
java -jar target/railway-reservation-backend-1.0.0.jar
```

---

## 6. Testing the Health Check API

Once the Spring Boot server starts up on port `8080`, verify the health endpoint:

### Using cURL:
```bash
curl -i http://localhost:8080/api/health
```

### Using a Web Browser:
Open your browser and navigate to:
```
http://localhost:8080/api/health
```

### Expected JSON Response:
```json
{
  "status": "UP",
  "message": "Railway Reservation System Spring Boot Backend is operational.",
  "timestamp": "2026-11-02T10:35:00.000Z",
  "project": {
    "title": "Railway Reservation System",
    "version": "1.0.0",
    "student": "Shiv Shankar Mal",
    "group": "9",
    "rollNumber": "2760012408",
    "course": "B.Tech CSE - Java & OOP Lab Mini Project"
  },
  "runtime": {
    "javaVersion": "17.0.x",
    "javaVendor": "Oracle Corporation",
    "springBootVersion": "3.2.4",
    "os": "Linux"
  }
}
```

---

## 7. Database Initialization & Sample Data (Step 8 Completed)

The backend features an automated, idempotent database seeder (`DataInitializer.java` implementing Spring Boot `CommandLineRunner`):
- **Automatic Execution:** Executes upon Spring Boot boot when connected to MySQL.
- **Idempotency Guard:** Checks entity existence via repositories prior to persistence, preventing duplicate records across application restarts.
- **Sample Stations:** 10 major junction stations (NDLS, HWH, CSMT, MAS, SBC, ADI, BSB, PNBE, CNB, PUNE).
- **Sample Trains (OOP Subclasses):**
  - `RajdhaniTrainEntity`: 12301 (Howrah Rajdhani), 12952 (Mumbai Rajdhani)
  - `VandeBharatTrainEntity`: 22436 (Vande Bharat Varanasi-Delhi), 20608 (Vande Bharat Bengaluru-Chennai)
  - `SuperfastTrainEntity`: 12810 (Howrah Mumbai Mail), 12622 (Tamil Nadu Superfast)
- **Intermediate Route Halts:** Scheduled stop sequences, arrival/departure times, distance km, and halt durations.
- **Seat Inventories & Tariffs:** Class-wise seats (1A, 2A, 3A, SL, CC, EC) with base fares and dynamic availability.
- **Sample Passenger & Verified Booking:** Seeded PNR `2849182374` with coach berth allocations for instant KPI metrics and PNR status testing.

### Manual SQL Scripts (Optional):
For direct MySQL Workbench or CLI import:
- Schema DDL: `src/main/resources/schema.sql`
- Sample Data DML: `src/main/resources/data.sql`
```bash
mysql -u root -p railway_db < src/main/resources/schema.sql
mysql -u root -p railway_db < src/main/resources/data.sql
```

---

## 8. REST API Endpoints Overview (Fully Unified & Harmonized)

All endpoints support both standard RESTful paths and alternative convenience routes for seamless frontend integration:

| Method | Canonical Endpoint | Supported Alias | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | — | Backend health, uptime & student project metadata |
| `GET` | `/api/stations` | — | All registered railway stations in network |
| `GET` | `/api/stations/{code}` | — | Station details by uppercase code (e.g. `NDLS`, `HWH`) |
| `GET` | `/api/trains` | — | List all registered trains |
| `GET` | `/api/trains/{trainNumber}` | — | Complete train details, halts & timetable |
| `GET` | `/api/trains/search` | — | Search trains by origin (`?source=NDLS&destination=HWH`) |
| `GET` | `/api/trains/{trainNumber}/seats` | `/api/trains/{trainNumber}/availability` | Class-wise seat capacities, availability & base tariffs |
| `POST` | `/api/booking/calculate-fare` | `/api/fare/calculate` | Polymorphic dynamic fare calculation breakdown |
| `POST` | `/api/reservations/book` | `/api/booking/reserve` | Transactional ticket booking (issues 10-digit PNR) |
| `GET` | `/api/reservations/{pnr}` | `/api/booking/{pnr}` | PNR status, passenger manifest & E-ticket lookup |
| `GET` | `/api/reservations` | — | List all reservations (filter with `?status=CONFIRMED`) |
| `POST` | `/api/reservations/{pnr}/cancel` | `/api/booking/{pnr}/cancel` | Cancel reservation by path variable with optional reason |
| `POST` | `/api/cancellation/cancel` | — | Alternate body-based cancellation `{ "pnr": "...", "reason": "..." }` |
| `GET` | `/api/passengers` | — | List passenger profiles directory |
| `POST` | `/api/passengers` | — | Save new passenger profile |
| `PUT` | `/api/passengers/{id}` | — | Update existing passenger profile |
| `DELETE` | `/api/passengers/{id}` | — | Remove passenger profile |
| `GET` | `/api/dashboard/stats` | — | Operational KPI metrics (trains, bookings, revenue) |

