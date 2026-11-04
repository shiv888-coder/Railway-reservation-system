# Local Setup & Testing Guide (Windows 10 / 11)
## Railway Reservation System

**Project Title:** Railway Reservation System  
**Student Name:** Shiv Shankar Mal  
**Roll Number:** 2760012408  
**Group Number:** 9  
**Academic Year:** 2025–2026  
**Technologies:** Java 17, Spring Boot 3.2.4, MySQL 8, React 18, TypeScript, Vite, Tailwind CSS  

---

## Overview

This guide provides step-by-step instructions for installing prerequisites, configuring MySQL 8, running the Spring Boot backend, starting the React frontend, and executing end-to-end testing on a **Windows 10 or Windows 11 PC** using **Windows PowerShell**.

> **Important Testing Disclosure:**  
> In the cloud container environment, live execution of Java, Maven, and MySQL server was not performed because these tools are not pre-installed in the container. Therefore, all MySQL and backend tests in this guide are marked **[Pending Manual Local Execution]** and must be performed on your local Windows PC following the steps below.

---

## 1. Required Software Installation

Before running the application, download and install the following software packages on Windows.

### 1.1 Java Development Kit (JDK 17 LTS)
- **Download:** [Eclipse Temurin OpenJDK 17](https://adoptium.net/temurin/releases/?version=17) or [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/#java17).
- **Installer Type:** Windows `.msi` or `.exe` x64 Installer.
- **Installation Options:** During setup, enable the checkbox **"Set JAVA_HOME variable"** and **"Add to PATH"**.
- **Verify in Windows PowerShell:**
  ```powershell
  java -version
  javac -version
  ```
  *Expected Output:* `openjdk version "17.0.x"` or `java version "17.0.x"`.

### 1.2 Apache Maven (Version 3.8 or Higher)
- **Download:** [Apache Maven Binary Zip](https://maven.apache.org/download.cgi) (e.g., `apache-maven-3.9.6-bin.zip`).
- **Setup:**
  1. Extract the `.zip` archive to `C:\Program Files\Maven` (or `C:\tools\apache-maven-3.9.x`).
  2. In Windows Search, type **"Edit the system environment variables"** and press Enter.
  3. Click **"Environment Variables..."**.
  4. Under **System Variables**, click **New**:
     - Variable Name: `MAVEN_HOME`
     - Variable Value: `C:\Program Files\Maven\apache-maven-3.9.6`
  5. Select the **Path** variable under System Variables, click **Edit**, click **New**, and add:
     `%MAVEN_HOME%\bin`
  6. Click **OK** on all dialogs.
- **Verify in Windows PowerShell (open a new PowerShell window):**
  ```powershell
  mvn -version
  ```
  *Expected Output:* `Apache Maven 3.9.x (...) Maven home: C:\Program Files\Maven\...`

### 1.3 Node.js & npm (LTS 18 or 20)
- **Download:** [Node.js Official Website (LTS)](https://nodejs.org/en/download).
- **Installer Type:** Windows `.msi` x64 Installer.
- **Installation Options:** Keep default options (automatically adds `node` and `npm` to PATH).
- **Verify in Windows PowerShell:**
  ```powershell
  node -v
  npm -v
  ```
  *Expected Output:* `v18.x.x` or `v20.x.x` for Node, and `9.x.x` or `10.x.x` for npm.

### 1.4 MySQL 8.0 Community Server
- **Download:** [MySQL Community Server 8.0 Installer for Windows](https://dev.mysql.com/downloads/installer/).
- **Installer Type:** `mysql-installer-community-8.0.x.msi`.
- **Setup Instructions:**
  1. Choose **Server only** or **Developer Default**.
  2. Authentication Method: Select **"Use Strong Password Encryption (RECOMMENDED)"** or Legacy if preferred.
  3. Set a root password (e.g., `root` or `Railway@2026`). Remember this password.
  4. Ensure MySQL starts as a Windows Service (`MySQL80`) on default port `3306`.
- **Add MySQL to System PATH (Optional for CLI access):**
  - Add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to your System `Path` variable.
- **Verify in Windows PowerShell:**
  ```powershell
  mysql --version
  ```
  *Expected Output:* `mysql  Ver 8.0.x for Win64 on x86_64`

### 1.5 Code Editor (Recommended: Visual Studio Code)
- **Download:** [Visual Studio Code](https://code.visualstudio.com/).
- **Recommended Extensions:**
  - *Extension Pack for Java* (Microsoft)
  - *Spring Boot Extension Pack* (VMware)
  - *Tailwind CSS IntelliSense*
  - *Prettier - Code formatter*

---

## 2. Backend Setup & Configuration

The backend is located in the `railway-backend` directory and runs on **Spring Boot 3.2.4** at port **8080**.

### 2.1 Create the MySQL Database
Open **Windows PowerShell** and connect to your MySQL server:

```powershell
mysql -u root -p
```
Enter your MySQL root password when prompted. Then run the following SQL commands:

```sql
-- Create the project database
CREATE DATABASE IF NOT EXISTS railway_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Confirm database creation
SHOW DATABASES;

-- Exit MySQL console
EXIT;
```

*(Note: The database tables and sample records are automatically created and seeded on application startup by the backend's JPA auto-update and `DataInitializer.java` CommandLineRunner. Alternatively, you can manually run `railway-backend/src/main/resources/schema.sql` and `data.sql`).*

### 2.2 Configure Database Credentials
The application reads configuration from `railway-backend/src/main/resources/application.properties`. You can supply your credentials using either of the following two methods:

#### Method A: Setting Environment Variables in PowerShell (Recommended)
Before running the backend, set your MySQL credentials in your current PowerShell terminal:

```powershell
# Set database connection parameters
$env:DB_URL="jdbc:mysql://localhost:3306/railway_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YourPasswordHere"   # Replace with your actual MySQL root password
$env:JPA_DDL_AUTO="update"
```

#### Method B: Modifying `application.properties` directly
Alternatively, open `railway-backend/src/main/resources/application.properties` in VS Code or Notepad and set:
```properties
spring.datasource.username=root
spring.datasource.password=YourActualPassword
```

### 2.3 Run the Spring Boot Backend (PowerShell Commands)
Open a new Windows PowerShell terminal in your project root directory:

```powershell
# Navigate into the backend directory
cd railway-backend

# Clean compile the application
mvn clean compile

# Run the Spring Boot backend
mvn spring-boot:run
```

#### Alternative: Build and Run as a Standalone Executable JAR
```powershell
# Package the application into an executable JAR
mvn clean package -DskipTests

# Run the compiled JAR
java -jar target/railway-reservation-backend-1.0.0.jar
```

*Expected Terminal Log:*
```
...
2026-11-03 ... [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2026-11-03 ... [main] c.r.r.RailwayReservationApplication     : Started RailwayReservationApplication in 3.421 seconds
2026-11-03 ... [main] c.r.r.config.DataInitializer             : [DataInitializer] Sample data initialization completed successfully.
```

### 2.4 Verify the Backend Health Endpoint
Open a separate PowerShell window or your web browser and test the health endpoint:

```powershell
# Using PowerShell Invoke-RestMethod
Invoke-RestMethod -Uri "http://localhost:8080/api/health" | Format-List
```
*Or using `curl.exe`:*
```powershell
curl.exe -i http://localhost:8080/api/health
```

*Expected JSON Response:*
```json
{
  "status": "UP",
  "message": "Railway Reservation System Spring Boot Backend is operational.",
  "project": {
    "title": "Railway Reservation System",
    "version": "1.0.0",
    "student": "Shiv Shankar Mal",
    "group": "9",
    "rollNumber": "2760012408"
  }
}
```

---

## 3. Frontend Setup & Startup

The frontend is a **React 18 + TypeScript** application powered by **Vite** and **Tailwind CSS**.

### 3.1 Verify Environment Configuration
In the project root, ensure a `.env` file exists with the backend API URL. If not, copy `.env.example`:

```powershell
# In project root directory
Copy-Item .env.example .env
```
Ensure `.env` contains:
```env
VITE_API_BASE_URL="http://localhost:8080/api"
```

### 3.2 Install Frontend Dependencies
In the root directory (not inside `railway-backend`), install node modules:

```powershell
npm install
```

### 3.3 Start the Frontend Development Server
Start the Vite development server:

```powershell
npm run dev
```

### 3.4 Identify the Correct Frontend URL
Look at the output displayed in your PowerShell terminal:

```
  VITE v8.3.x  ready in 450 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.x:3000/
  ➜  press h + enter to show help
```

- **Primary URL:** Open your browser (Google Chrome, Microsoft Edge, or Firefox) and navigate to:  
  **`http://localhost:3000`**
- *(Note: If port 3000 is occupied by another application, Vite will automatically select `http://localhost:3001` or another port. Always check the terminal output for the exact active URL).*

---

## 4. Complete Testing Checklist (Step-by-Step)

Follow this structured workflow to test all application capabilities:

### Test 1: Operational Dashboard
1. Open `http://localhost:3000/`.
2. Verify the top banner displays: **Student: Shiv Shankar Mal | Group: 9 | Roll: 2760012408**.
3. Verify the KPI cards load:
   - **Active Trains:** 6
   - **Total Bookings / Revenue:** Shows initialized values.
   - **Station Network:** 10 stations.

### Test 2: Search Trains
1. Click **Search Trains** in the sidebar.
2. Select Source Station: `New Delhi (NDLS)`.
3. Select Destination Station: `Howrah Junction (HWH)`.
4. Click **Search Trains**.
5. Verify that train **12301 (Howrah Rajdhani Express)** is displayed with departure time, arrival time, and class badges.

### Test 3: Train Details & Halt Sequence
1. Click on **View Details / Halts** for train `12301`.
2. Verify intermediate stops are shown in chronological sequence:
   - Stop 1: `NDLS` (Departure: 16:50)
   - Stop 2: `CNB` (Kanpur Central)
   - Stop 3: `PRYJ` (Prayagraj Junction)
   - Stop 4: `DDU` (Pt. Deen Dayal Upadhyaya)
   - Stop 5: `HWH` (Howrah Junction, Arrival: 09:55)

### Test 4: Seat Availability Check
1. On the Train Details or Booking screen, view the seat inventory for coach classes:
   - `1A` (First AC)
   - `2A` (Second AC)
   - `3A` (Third AC)
2. Verify available seats count and base tariff are clearly displayed.

### Test 5: Dynamic Fare Calculation
1. In the booking drawer or booking page, select coach class `3A`.
2. Notice the fare breakdown:
   - Base fare
   - Dynamic pricing multiplier (for Rajdhani/Vande Bharat)
   - Catering charges / Speed surcharge
   - Total fare calculated dynamically
3. Add a passenger with age `65` (Senior Citizen) and verify that senior citizen concession is applied to the net tariff.

### Test 6: Passenger Information Form
1. Fill in passenger details:
   - Name: `Amit Kumar`
   - Age: `32`
   - Gender: `Male`
   - Berth Preference: `Lower`
   - ID Card Type: `Aadhaar`
   - ID Number: `XXXX-XXXX-1234`
2. Verify that client-side form validation prevents blank names or negative ages.

### Test 7: Ticket Booking & PNR Generation
1. Click **Confirm & Book Ticket**.
2. Verify that a confirmed **Digital E-Ticket** is generated.
3. Record the generated **10-Digit PNR** (e.g., `2849182374` or newly generated 10-digit number).
4. Verify the allocated coach (e.g., `B1`) and berth number (e.g., `14 Lower`).

### Test 8: PNR Status Search
1. Click **PNR Status / Reservations** in the sidebar.
2. Enter the 10-digit PNR in the lookup field and click **Search**.
3. Verify that the reservation details, passenger manifest, journey stations, and status **`CONFIRMED`** are displayed.

### Test 9: Ticket Cancellation
1. In the PNR screen or **Cancel Ticket** page, enter the 10-digit PNR.
2. Enter a reason (e.g., *"Change of travel plans"*).
3. Click **Proceed with Cancellation**.
4. Verify the cancellation slip is generated:
   - Ticket status updates to **`CANCELLED`**.
   - Cancellation charge and net refund amount are displayed.

### Test 10: Seat Restoration Verification
1. Return to the train's seat availability page (`/api/trains/12301/seats` or UI).
2. Verify that the available seats counter for the cancelled class has **increased by the number of cancelled passengers**, proving that cancelled seats are immediately restored to the booking pool.

---

## 5. Common Errors and Solutions

### 5.1 MySQL Connection Error
**Symptoms:** `java.sql.SQLNonTransientConnectionException: Could not create connection to database server` or `Access denied for user 'root'@'localhost'`.  
**Solutions:**
1. Check if the MySQL service is running in PowerShell:
   ```powershell
   Get-Service -Name "MySQL*"
   ```
   If status is `Stopped`, start it:
   ```powershell
   Start-Service -Name "MySQL80"
   ```
2. Verify your password by logging into MySQL CLI:
   ```powershell
   mysql -u root -p
   ```
3. Set the correct `$env:DB_PASSWORD` in your PowerShell session before running Maven.

### 5.2 Port Already in Use (Port 8080 or Port 3000)
**Symptoms:** `Web server failed to start. Port 8080 was already in use.` or `Port 3000 is in use, trying another one...`  
**Solutions:**
1. Find the Process ID (PID) holding port 8080 in PowerShell:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object OwningProcess -Unique
   ```
2. Stop the process using its PID (replace `1234` with the actual PID):
   ```powershell
   Stop-Process -Id 1234 -Force
   ```
3. For the frontend, Vite automatically detects port conflicts and prompts to use port `3001`.

### 5.3 Maven Command Not Recognized
**Symptoms:** `mvn : The term 'mvn' is not recognized as the name of a cmdlet...`  
**Solutions:**
1. Verify that `MAVEN_HOME\bin` is added to your System `Path`.
2. Close and reopen your Windows PowerShell window so it detects the updated environment variables.
3. Check the path using:
   ```powershell
   $env:PATH -split ';' | Select-String "maven"
   ```

### 5.4 Java Version Mismatch
**Symptoms:** `class file has wrong version 61.0, should be 55.0` or `UnsupportedClassVersionError: ... compiled by a more recent version of the Java Runtime (class file version 61.0)`.  
**Solutions:**
1. Class version `61.0` requires **Java 17**. If your system defaults to Java 8 (version 52) or Java 11 (version 55), the backend will not run.
2. In PowerShell, check which Java version is active:
   ```powershell
   java -version
   ```
3. Ensure `JAVA_HOME` points to your JDK 17 installation path:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot"
   $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
   ```

### 5.5 Frontend API Connection Error
**Symptoms:** Red warning badge *"Backend Offline / Using Local Storage"* or browser console `net::ERR_CONNECTION_REFUSED`.  
**Solutions:**
1. Ensure the Spring Boot backend is actively running on `http://localhost:8080`.
2. Test `http://localhost:8080/api/health` in your browser.
3. Verify that `VITE_API_BASE_URL` in `.env` is set to `http://localhost:8080/api`.
4. Note that if the backend is offline, the React application automatically activates its **built-in in-memory fallback engine**, allowing you to demonstrate the entire UI without crashing.

---

## 6. Final Verification Table (Manual Testing Log)

Use this table during your local evaluation to document test outcomes:

| Test ID | Test Name | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :---: | :---: |
| **TC-01** | **Backend Health Check** | `GET /api/health` returns HTTP 200 with JSON status `"UP"` and student metadata. | *(Test Locally)* | Pending |
| **TC-02** | **Station Directory** | `GET /api/stations` returns 10 major stations (NDLS, HWH, CSMT, MAS, etc.). | *(Test Locally)* | Pending |
| **TC-03** | **Train Search Query** | `GET /api/trains/search?source=NDLS&destination=HWH` returns Rajdhani Express 12301. | *(Test Locally)* | Pending |
| **TC-04** | **Route Halts Sequence** | `GET /api/trains/12301` returns halts ordered by `stopSequence ASC`. | *(Test Locally)* | Pending |
| **TC-05** | **Seat Availability** | `GET /api/trains/12301/seats` returns class-wise available seats and tariffs. | *(Test Locally)* | Pending |
| **TC-06** | **Fare Calculation** | `POST /api/booking/calculate-fare` returns base fare, surcharge, and concession breakdown. | *(Test Locally)* | Pending |
| **TC-07** | **Ticket Reservation** | `POST /api/reservations/book` creates reservation, returns 10-digit PNR and berth allocations. | *(Test Locally)* | Pending |
| **TC-08** | **PNR Lookup** | `GET /api/reservations/{pnr}` returns verified reservation and passenger list. | *(Test Locally)* | Pending |
| **TC-09** | **Ticket Cancellation** | `POST /api/reservations/{pnr}/cancel` sets status to CANCELLED and returns refund slip. | *(Test Locally)* | Pending |
| **TC-10** | **Inventory Restoration** | Seat count for the cancelled class increments by the number of cancelled seats. | *(Test Locally)* | Pending |
| **TC-11** | **Frontend Typecheck** | `npx tsc --noEmit` runs with 0 compilation errors. | Passed (0 errors) | **PASSED** |
| **TC-12** | **Frontend Production Build** | `npm run build` compiles Vite bundle without syntax or import errors. | Passed (1,678 modules) | **PASSED** |

---

*Local Setup & Testing Guide — B.Tech CSE Java OOP Lab Mini Project*  
*Student: Shiv Shankar Mal | Roll: 2760012408 | Group: 9*
