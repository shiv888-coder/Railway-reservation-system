# Railway Reservation System — B.Tech CSE Mini Project Presentation

**Course:** Object-Oriented Programming (OOP) with Java Lab  
**Project Title:** Railway Reservation System  
**Student Name:** Shiv Shankar Mal  
**Roll Number:** 2760012408  
**Group Number:** 9  
**Degree:** Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)  
**Academic Year:** 2025–2026  
**Technology Stack:** Java 17 LTS, Spring Boot 3.2.4, Spring Data JPA, MySQL 8, React 18, TypeScript, Tailwind CSS  

---

## Presentation Structure Overview (15 Slides)

- **Slide 1:** Title Slide and Student Details
- **Slide 2:** What the Project Does
- **Slide 3:** Project Purpose
- **Slide 4:** Actual Project Objectives
- **Slide 5:** Technologies Used
- **Slide 6:** Actual System Architecture
- **Slide 7:** Existing Application Pages and Features
- **Slide 8:** Java OOP Concepts Implemented
- **Slide 9:** Actual Java Class Diagram
- **Slide 10:** Actual Database Design — Exactly 8 Tables
- **Slide 11:** Station Search and Train Search
- **Slide 12:** Train Information and Data Sources
- **Slide 13:** Ticket Booking and Cancellation Workflow
- **Slide 14:** Actual Screenshots and Testing Results
- **Slide 15:** Conclusion and Future Scope

---

<!-- SLIDE 1 -->
# Slide 1: Title Slide and Student Details

### **RAILWAY RESERVATION SYSTEM**
#### *A Full-Stack Java OOP & Spring Boot Enterprise Web Application*

- **Candidate Name:** Shiv Shankar Mal
- **Roll Number:** 2760012408
- **Group Number:** 9
- **Subject:** Object-Oriented Programming with Java Laboratory
- **Department:** Department of Computer Science & Engineering
- **Program:** Bachelor of Technology (B.Tech CSE)
- **Academic Session:** 2025 – 2026

> **Presenter Speaking Notes:**  
> "Good morning respected professors and evaluators. My name is Shiv Shankar Mal from Group 9, Roll Number 2760012408. Today, I am presenting my B.Tech Computer Science Java OOP Lab Mini Project titled 'Railway Reservation System'. This project demonstrates how core object-oriented principles—encapsulation, inheritance, polymorphism, abstraction, and dependency injection—are implemented in an enterprise-level full-stack web application using Java 17, Spring Boot, MySQL 8, and React with TypeScript."

---

<!-- SLIDE 2 -->
# Slide 2: What the Project Does

### **Core Capabilities of the Application**
- **Search Trains by Stations:** Search for available trains between any two stations by typing station names or 2–5 letter station codes (e.g. `NDLS`, `HWH`, `CNB`, `MAS`).
- **Intermediate Stop Routing:** Automatically checks train route halt sequences so passengers can board or deboard at intermediate stops along the corridor.
- **Seat Availability & Fare Calculation:** Inspects real-time coach availability (`1A`, `2A`, `3A`, `SL`, `CC`, `EC`) and dynamically calculates fares including base fare, reservation fees, superfast charges, catering, GST, and senior citizen discounts.
- **Academic Ticket Reservation:** Generates a unique 10-digit PNR ticket with coach and berth allocation (Lower, Middle, Upper, Side Lower, Window).
- **PNR Enquiry & Cancellation:** Instant ticket lookup by PNR and full cancellation workflow with transparent cancellation fee calculation and seat inventory restoration.
- **Live Status & Timetable Explorer:** Tracks train running conditions with explicit data source badges (`LIVE DATA`, `SCHEDULE DATA`, `DEMO DATA`).

> **Presenter Speaking Notes:**  
> "In simple terms, our project automates the primary workflows of a railway reservation portal. A user can search trains between any two cities, view intermediate stops, see seat availability across travel classes, book a simulated e-ticket with an instant 10-digit PNR, check their booking anytime, and cancel their ticket with automatic seat restoration."

---

<!-- SLIDE 3 -->
# Slide 3: Project Purpose

### **Why This Project Was Developed**
- **Bridge Theory and Industry Practice:** Take textbook OOP concepts from the classroom and apply them directly to solve a real-world software engineering problem.
- **Eliminate Procedural Code Smells:** Replace traditional large switch statements and repetitive procedural code with clean polymorphic inheritance hierarchies.
- **Multi-Class Train Diversity:** Accurately model diverse train categories (Rajdhani with complimentary catering, Vande Bharat with executive chair cars, Superfast with speed surcharges) using object-oriented subclassing.
- **Relational Data Integrity:** Enforce foreign key constraints, unique PNR numbers, and prevent duplicate seat allocations in a normalized relational database.
- **Safe Academic Demonstration:** Provide an authentic user experience using genuine Indian Railways published timetables while clearly demarking booking and payment features as safe academic simulations.

> **Presenter Speaking Notes:**  
> "The purpose of this project was to bridge academic Java theory with enterprise software design. Instead of building a toy command-line calculator, we modeled the complex domain of railway booking. This allowed us to understand how polymorphic method dispatch, database normalization, and REST microservices interact in a production-style architecture."

---

<!-- SLIDE 4 -->
# Slide 4: Actual Project Objectives

### **Specific Technical and Functional Objectives**
1. **Domain Modeling with Pure Java OOP:**
   - Implement an abstract `BaseTrainEntity` with specialized derived classes (`RajdhaniTrainEntity`, `VandeBharatTrainEntity`, `SuperfastTrainEntity`, `MailExpressTrainEntity`).
   - Use polymorphic method overriding for train-specific fare and meal calculations.
2. **Design an 8-Table Normalized MySQL Database:**
   - Create 8 distinct relational tables with primary keys, foreign keys, and indexes.
   - Implement idempotent database seeding via Spring Boot `CommandLineRunner`.
3. **Build RESTful Spring Boot Web Services:**
   - Expose clean REST endpoints under `/api/stations`, `/api/trains`, `/api/passengers`, and `/api/reservations`.
   - Maintain route compatibility for both `/api/reservations/{pnr}` and `/api/booking/{pnr}`.
4. **Develop a Modern TypeScript React Frontend:**
   - Build searchable station autocompletes, live schedule viewers, and reservation slips.
   - Enforce WCAG accessible styling with zero broken links or dead clicks.

> **Presenter Speaking Notes:**  
> "We established four measurable objectives: first, model diverse trains using Java inheritance and polymorphism; second, design a normalized 8-table relational schema in MySQL 8; third, implement clean RESTful APIs using Spring Boot 3.2.4; and fourth, build an intuitive, type-safe React frontend with robust validation."

---

<!-- SLIDE 5 -->
# Slide 5: Technologies Used

### **Full-Stack Technology Breakdown**

```
+-----------------------------------------------------------------------------------------+
|                                    TECHNOLOGY STACK                                     |
+----------------------+------------------------------------------------------------------+
| Backend Language     | Java 17 LTS (Modern Java with Records, Enums, Clean OOP)        |
| Backend Framework    | Spring Boot 3.2.4 (Dependency Injection, REST Controllers)       |
| Persistence & ORM    | Spring Data JPA / Hibernate 6.4 (Object-Relational Mapping)      |
| Database             | MySQL 8.0 (Relational Database with Foreign Key Constraints)     |
| Build Tool           | Apache Maven 3.9+                                                |
| Frontend Framework   | React 18 / 19 SPA (Single Page Application)                      |
| Frontend Language    | TypeScript 5.7+ (Strict Compile-Time Type Safety)                |
| Styling Framework    | Tailwind CSS (Utility-First Responsive Design)                   |
| Iconography          | Lucide React (Clean, Accessible SVG Icons)                       |
| Development Server   | Vite 8.3 (High-Speed Local Module Bundler, Port 3000)            |
+----------------------+------------------------------------------------------------------+
```

> **Presenter Speaking Notes:**  
> "Our technology stack combines enterprise Java on the backend with modern TypeScript on the frontend. We chose Java 17 LTS and Spring Boot 3.2.4 for robust service architecture and transaction handling, MySQL 8 for relational data persistence, and React 18 with TypeScript for compile-time safety on the user interface."

---

<!-- SLIDE 6 -->
# Slide 6: Actual System Architecture

### **Three-Tier Layered Architecture**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (React SPA)                   │
│   Dashboard  ·  Search Trains  ·  Timetable  ·  Booking  ·  PNR Status │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (REST API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER (Spring Boot 3.2)                │
│                                                                        │
│  [REST Controllers]  → TrainController, ReservationController, etc.    │
│  [Service Layer]     → TrainService, BookingService, FareService       │
│  [OOP Domain Models] → BaseTrainEntity (Rajdhani, Vande Bharat, etc.)  │
│  [Repositories]      → Spring Data JPA Interfaces                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC / Hibernate SQL
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATA TIER (MySQL 8 Database)                   │
│   stations · trains · route_halts · train_seats · passengers           │
│   reservations · seat_allocations · cancellation_slips                │
└────────────────────────────────────────────────────────────────────────┘
```

> **Presenter Speaking Notes:**  
> "The system adheres strictly to the classic Three-Tier Enterprise Architecture. The Presentation Tier is a React Single Page Application running in the browser. The Application Tier runs Spring Boot on port 8080, handling business logic, polymorphism, and security validation. The Data Tier is MySQL 8, storing all entities in normalized relational tables."

---

<!-- SLIDE 7 -->
# Slide 7: Existing Application Pages and Features

### **Complete Application Module Breakdown**
1. **Operational Dashboard (`DashboardPage.tsx`):**
   - Live system statistics: total trains, active bookings, seat inventory, and revenue.
   - Quick search corridor shortcuts, recent bookings table, and backend connection probe.
2. **Train Search & Intermediate Halts (`SearchTrainsPage.tsx`):**
   - Searchable autocomplete input for origin and destination stations.
   - Sequence-ordered route filtering, same-station error validation, and live status enquiry.
3. **Train Details & Timetable (`TrainDetailsPage.tsx`):**
   - Complete chronological route halts list with arrival times, departure times, and distances.
4. **Passenger Directory (`PassengerInfoPage.tsx`):**
   - Passenger profiles with government ID proof validation and one-click booking prefill.
5. **Ticket Booking (`TicketBookingPage.tsx`):**
   - Multi-passenger reservation (up to 6 passengers), berth preference, and live fare summary.
6. **Reservation Details (`ReservationDetailsPage.tsx`):**
   - 10-digit PNR lookup, printable e-ticket slip, and seat allocation display.
7. **Ticket Cancellation (`CancelReservationPage.tsx`):**
   - Reason capture, cancellation fee audit (80% refund policy), and seat release.
8. **OOP Architecture Explorer (`OOPArchitecturePage.tsx`):**
   - Interactive viva demonstration portal showing live OOP design patterns and code snippets.

> **Presenter Speaking Notes:**  
> "Our application contains 8 fully working views. Passengers can search trains, view complete route halts, manage their passenger profiles, book tickets, check their PNR status, and cancel bookings. We also built a dedicated OOP Architecture Explorer tab specifically for laboratory viva examinations."

---

<!-- SLIDE 8 -->
# Slide 8: Java OOP Concepts Implemented

### **Core Object-Oriented Principles in Source Code**

- **1. Abstraction:**
  - Interfaces `TrainService`, `BookingService`, and `FareService` separate functional contracts from implementation details.
  - Abstract base class `BaseTrainEntity` defines common train properties and abstract `calculateFare()`.
- **2. Inheritance:**
  - `RajdhaniTrainEntity`, `VandeBharatTrainEntity`, and `SuperfastTrainEntity` extend `BaseTrainEntity`.
  - Reuses code for station stops, schedule times, and train numbers while allowing specialized behavior.
- **3. Polymorphism (Dynamic Method Dispatch):**
  - Overridden `calculateFare(CoachClass, int, int)` method executes specific tariff rules at runtime:
    - *Rajdhani:* Adds premier inclusive catering fee (₹340–₹420) and high-speed surcharge.
    - *Vande Bharat:* Applies executive car premium and gourmet catering fee (₹260–₹380).
    - *Superfast:* Applies standard superfast surcharge and distance tariff.
- **4. Encapsulation:**
  - Entity fields are marked `protected` or `private` and accessed only via validated getters and setters.
  - Seat booking methods prevent negative inventory and ensure thread-safe updates.
- **5. Dependency Injection:**
  - Pure constructor injection across all Spring services ensures immutability and loose coupling.

> **Presenter Speaking Notes:**  
> "This slide illustrates how our code implements textbook OOP. Abstraction is achieved through service interfaces. Inheritance allows specialized train entities to reuse base attributes. Polymorphism ensures that calling calculateFare() on a BaseTrain reference automatically invokes the correct subclass logic. Encapsulation protects private inventory data, and constructor injection eliminates tight coupling."

---

<!-- SLIDE 9 -->
# Slide 9: Actual Java Class Diagram

### **UML Class Hierarchy for Train Entities**

```
                     ┌───────────────────────────────────┐
                     │       «abstract entity»           │
                     │        BaseTrainEntity            │
                     ├───────────────────────────────────┤
                     │ - trainNumber: String (PK)        │
                     │ - trainName: String               │
                     │ - trainType: TrainType            │
                     │ - sourceStation: StationEntity    │
                     │ - destinationStation: StationEnt. │
                     │ - departureTime: LocalTime        │
                     │ - arrivalTime: LocalTime          │
                     │ - distanceKm: int                 │
                     ├───────────────────────────────────┤
                     │ + getAvailableSeats(cls): int     │
                     │ + bookSeats(cls, count): boolean  │
                     │ + cancelSeats(cls, count): void   │
                     │ + calculateFare(cls, cnt): Fare*  │
                     └─────────────────┬─────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  RajdhaniTrain   │         │ VandeBharatTrain │         │  SuperfastTrain  │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ + calculateFare()│         │ + calculateFare()│         │ + calculateFare()│
│   [Catering Inc.]│         │   [Executive CC] │         │   [Speed Surch.] │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

> **Presenter Speaking Notes:**  
> "Here is our UML Class Diagram. BaseTrainEntity serves as the root class containing train attributes and seat inventory methods. RajdhaniTrain, VandeBharatTrain, and SuperfastTrain inherit from it. When a booking request arrives, Spring executes calculateFare() polymorphically based on the actual runtime object."

---

<!-- SLIDE 10 -->
# Slide 10: Actual Database Design — Exactly 8 Tables

### **Normalized MySQL 8 Relational Schema**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    stations     │       │     trains      │       │   route_halts   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK station_code │◄──┐   │ PK train_number │◄──┐   │ PK halt_id      │
│    station_name │   ├───│ FK source_stn   │   ├───│ FK train_number │
│    city, state  │   └───│ FK dest_stn     │   └───│ FK station_code │
│    zone         │       │    train_type   │       │    stop_sequence│
└─────────────────┘       │    train_categ.*│       └─────────────────┘
                          └────────┬────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   train_seats   │       │   passengers    │       │  reservations   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK passenger_id │◄──┐   │ PK pnr          │
│ FK train_number │       │    full_name    │   │   │ FK train_number │
│    coach_class  │       │    age, gender  │   │   │ FK source_stn   │
│    total_seats  │       │    phone, email │   │   │ FK dest_stn     │
│    avail_seats  │       │    id_proof     │   │   │    total_fare   │
└─────────────────┘       └─────────────────┘   │   │    status       │
                                                │   └────────┬────────┘
                                                │            │
                                                ▼            ▼
                                    ┌────────────────────────┐
                                    │    seat_allocations    │
                                    ├────────────────────────┤
                                    │ PK allocation_id       │
                                    │ FK pnr                 │
                                    │ FK passenger_id        │
                                    │    coach_number, berth │
                                    └────────────────────────┘
```
*(Plus Table 8: `cancellation_slips` linked 1-to-1 with `reservations` by `pnr`)*

> **Presenter Speaking Notes:**  
> "Our database schema consists of exactly 8 normalized tables in MySQL. The trains table uses JPA Single-Table Inheritance with a train_category discriminator column. The route_halts table stores intermediate stops with stop_sequence numbers. Reservations are identified by a unique 10-digit PNR string. When a reservation is cancelled, records in cancellation_slips log the refund reference and fee."

---

<!-- SLIDE 11 -->
# Slide 11: Station Search and Train Search

### **Intelligent Autocomplete & Sequence Route Algorithm**
- **Searchable Autocomplete Input:**
  - Users can type either station codes (e.g., `CNB`, `NDLS`, `HWH`) or city/station names (e.g., `Kanpur`, `Delhi`, `Kolkata`).
  - Dropdown displays station code badge, full name, city, state, and railway zone.
  - Supports keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) and a quick clear button (`X`).
- **Same-Station Validation:**
  - Validates that origin station $\ne$ destination station.
  - Displays an immediate inline warning and disables search if identical stations are selected.
- **Route Halt Sequence Matching Algorithm:**
  - Traditional search engines only match origin to destination terminus.
  - Our algorithm checks whether a train visits the source station at sequence $S_1$ and destination at $S_2$, ensuring $S_1 < S_2$.
  - Displays dynamic departure times at the boarding halt and arrival times at the deboarding halt.

> **Presenter Speaking Notes:**  
> "A major upgrade in our search module is intermediate stop routing. In real life, passengers board trains at intermediate junctions, not just starting terminals. Our search algorithm checks the stop sequence order. For example, if a passenger searches from Kanpur to New Delhi, our Howrah Rajdhani and Sampoorna Kranti Express appear because they stop at Kanpur before reaching Delhi."

---

<!-- SLIDE 12 -->
# Slide 12: Train Information and Data Sources

### **Strict Data Provenance Demarcation**

```
+------------------+-----------------------+-------------------------------------------------------+
| BADGE / LABEL    | DATA CATEGORY         | REAL-WORLD SOURCE & VERIFICATION                      |
+------------------+-----------------------+-------------------------------------------------------+
| SCHEDULE DATA    | Timetables & Halts    | Authentic Indian Railways Published Schedules (100%)  |
| SCHEDULE DATA    | Station Directory     | Authentic Indian Railways / CRIS Station Codes (42+)  |
| LIVE DATA        | Live Running Status   | Real-time GPS gateway (when RAILWAY_API_KEY is active)|
| DEMO DATA        | Seat Availability     | Simulated inventory stored in local MySQL / storage   |
| DEMO DATA        | Fare Estimation       | Calculated dynamically via Java OOP tariff formulas   |
| DEMO DATA        | Ticket Reservations   | Academic lab simulation; not an official IRCTC ticket |
| UNAVAILABLE      | Live Enquiry Offline  | Displayed transparently when external API key absent  |
+------------------+-----------------------+-------------------------------------------------------+
```

### **Security & Safety Rules**
- API keys are managed exclusively through backend environment variables (`RAILWAY_API_KEY`) and never leaked to client bundles.
- Transparent badges ensure evaluators and passengers always know whether data is an authentic schedule or an academic simulation.

> **Presenter Speaking Notes:**  
> "Academic honesty is critical. We never claim mock data is live data. Our application uses clear visual tags: SCHEDULE DATA indicates authentic Indian Railways timetables; LIVE DATA indicates real-time GPS feeds when an API key is connected; and DEMO DATA clearly indicates that seat allocations and ticket reservations are academic simulations for laboratory evaluation."

---

<!-- SLIDE 13 -->
# Slide 13: Ticket Booking and Cancellation Workflow

### **Step-by-Step Transaction Workflow**

```
[1. Search Route] ──► [2. Select Coach Class] ──► [3. Enter Passenger Details]
                             (1A, 2A, 3A, SL)            (Name, Age, ID Proof, Berth)
                                                                │
                                                                ▼
[6. E-Ticket Generated] ◄── [5. Seat Allocation] ◄── [4. Validate & Calculate Fare]
  (10-Digit PNR Slip)        (Coach & Berth Number)       (Base + Surcharge + GST)
          │
          ▼
   [Cancellation?] ──► [Calculate Cancellation Fee] ──► [Restore Seat Inventory]
                                (20% Fee / 80% Refund)         (Available Seats + Count)
```

- **PNR Generation:** Algorithmic 10-digit unique numeric identifier.
- **Seat Allocation Logic:** Assigns realistic coach labels (e.g. `B2-21`) and berth types (`Lower`, `Middle`, `Upper`, `Side Lower`).
- **Cancellation Policy:** Applies an authentic cancellation penalty and immediately restores seats back to the train's inventory.

> **Presenter Speaking Notes:**  
> "The booking workflow is seamless: the user selects a coach class, inputs up to 6 passenger profiles with verified ID proof, and submits the form. The system allocates coach berths, calculates taxes, and generates a 10-digit PNR. If a user cancels, our service applies an authentic cancellation fee and restores the seats back to available inventory."

---

<!-- SLIDE 14 -->
# Slide 14: Actual Screenshots and Testing Results

### **Application UI Layouts (Verified in Preview)**
- **Dashboard:** Operational metrics bar, search launcher, recent reservations list.
- **Train Search View:** Two autocomplete inputs, swap button, class filter badges, route cards.
- **Timetable Modal:** Chronological table displaying all intermediate halts and halt durations.
- **E-Ticket Slip:** Formal reservation slip with passenger manifest, fare breakdown, and PNR barcode.

### **Summary of Automated & Functional Test Results**
- **Test 1 (Station Search):** Typing `"Kanpur"` or `"CNB"` successfully suggests Kanpur Central.
- **Test 2 (Same-Station Validation):** Selecting `NDLS` for both From and To displays immediate error banner.
- **Test 3 (Intermediate Halts):** Searching `CNB → NDLS` correctly identifies trains `12301`, `12393`, and `22435`.
- **Test 4 (Polymorphic Fare):** Rajdhani ticket includes ₹340 catering charge; Superfast includes ₹45 surcharge.
- **Test 5 (Cancellation & Seat Restoration):** Cancelling a ticket immediately returns allocated seats to inventory.
- **Build Verification:** `tsc --noEmit` passed with 0 errors; `vite build` completed in 1.05s.

> **Presenter Speaking Notes:**  
> "We conducted rigorous functional testing across the entire system. Station autocompletion, route filtering, polymorphic fare calculation, and seat restoration upon cancellation were all thoroughly tested and verified. Our TypeScript compiler reports zero errors, and the production build completes in just over one second."

---

<!-- SLIDE 15 -->
# Slide 15: Conclusion and Future Scope

### **Project Achievements**
- Successfully demonstrated core Java OOP principles (Abstraction, Encapsulation, Inheritance, Polymorphism) in an enterprise web application.
- Implemented a normalized 8-table relational database in MySQL 8.
- Delivered an accessible, responsive React SPA with searchable autocomplete and transparent data badging.

### **Future Scope & Enhancements**
1. **CRIS / IRCTC Official API Integration:** Obtain commercial gateway accreditation to link live commercial ticketing when transitioning beyond academic scope.
2. **Payment Gateway Integration:** Connect a simulated Razorpay or UPI webhook for payment settlements.
3. **Automated Waitlist Charting:** Implement dynamic RAC (Reservation Against Cancellation) and automatic waitlist confirmation upon cancellations.
4. **Mobile Native Application:** Build an Android / iOS client using Kotlin and Jetpack Compose consuming the existing Spring Boot REST endpoints.

> **Presenter Speaking Notes:**  
> "In conclusion, this mini-project successfully demonstrates how Object-Oriented Programming and modern web engineering come together to solve enterprise problems. In the future, this system could be extended with live commercial CRIS gateway licensing, automated waitlist charting, and mobile applications. Thank you, professors. I am now ready for your questions."

---

## Evaluation & Viva Preparation Checklist for Group 9

1. **Student:** Shiv Shankar Mal (Group 9, Roll No: 2760012408)
2. **Inheritance Strategy:** `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` with `train_category` discriminator column in `trains` table.
3. **Database Tables:** Exactly 8 tables (`stations`, `trains`, `route_halts`, `train_seats`, `passengers`, `reservations`, `seat_allocations`, `cancellation_slips`).
4. **Polymorphic Method:** `calculateFare(CoachClass, int, int)` in `BaseTrainEntity`, overridden by `RajdhaniTrainEntity`, `VandeBharatTrainEntity`, and `SuperfastTrainEntity`.
5. **Data Provenance:** Authentic published timetables (`SCHEDULE DATA`), simulated booking/fares (`DEMO DATA`), and real-time running status when API key is provided (`LIVE DATA`).
