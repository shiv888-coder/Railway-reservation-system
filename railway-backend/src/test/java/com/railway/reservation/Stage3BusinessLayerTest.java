package com.railway.reservation;

import com.railway.reservation.dao.*;
import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.dto.BookingRequest;
import com.railway.reservation.dto.BookingResult;
import com.railway.reservation.dto.CancellationResult;
import com.railway.reservation.dto.FareBreakdown;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.exception.*;
import com.railway.reservation.model.*;
import com.railway.reservation.service.*;
import com.railway.reservation.service.impl.*;
import org.junit.jupiter.api.*;

import java.io.File;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Stage 3 Automated Verification Test Suite.
 * Validates Java OOP concepts (Encapsulation, Abstraction, Inheritance, Polymorphism,
 * Overloading, Overriding, Interfaces, Composition, Association) and the complete Business Service Layer.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Stage3BusinessLayerTest {

    private static final String TEST_DB = "target/test-stage3-railway.db";
    private static DatabaseManager dbManager;

    private static StationService stationService;
    private static TrainSearchService trainSearchService;
    private static SeatAvailabilityService seatAvailabilityService;
    private static FareCalculationService fareCalculationService;
    private static PassengerService passengerService;
    private static BookingService bookingService;
    private static CancellationService cancellationService;
    private static ReservationService reservationService;

    private static SeatInventoryDAO inventoryDAO;
    private static ReservationDAO reservationDAO;

    @BeforeAll
    static void setUpAll() {
        File file = new File(TEST_DB);
        if (file.exists()) {
            file.delete();
        }
        dbManager = new DatabaseManager(TEST_DB);
        dbManager.initializeDatabase();

        StationDAO stationDAO = new StationDAO(dbManager);
        TrainDAO trainDAO = new TrainDAO(dbManager);
        RouteDAO routeDAO = new RouteDAO(dbManager);
        inventoryDAO = new SeatInventoryDAO(dbManager);
        PassengerDAO passengerDAO = new PassengerDAO(dbManager);
        reservationDAO = new ReservationDAO(dbManager, passengerDAO, inventoryDAO);
        CancellationDAO cancellationDAO = new CancellationDAO(dbManager, reservationDAO, inventoryDAO);

        stationService = new StationServiceImpl(stationDAO);
        trainSearchService = new TrainSearchServiceImpl(trainDAO, stationDAO, routeDAO, inventoryDAO);
        seatAvailabilityService = new SeatAvailabilityServiceImpl(inventoryDAO);
        fareCalculationService = new FareCalculationServiceImpl(dbManager, trainDAO);
        passengerService = new PassengerServiceImpl(passengerDAO);
        bookingService = new BookingServiceImpl(trainSearchService, seatAvailabilityService, fareCalculationService, passengerService, reservationDAO);
        cancellationService = new CancellationServiceImpl(cancellationDAO, reservationDAO);
        reservationService = new ReservationServiceImpl(reservationDAO);
    }

    // =========================================================================
    // SECTION 1: OOP PRINCIPLES & DESIGN PATTERNS
    // =========================================================================

    @Test
    @Order(1)
    @DisplayName("OOP Concept 1 & 2: Abstraction & Inheritance in Train Hierarchy")
    void testAbstractionAndInheritance() {
        // Abstraction: Train must be abstract
        assertTrue(Modifier.isAbstract(Train.class.getModifiers()), "Train class must be declared abstract");

        // Inheritance: Specialized trains must inherit from Train
        assertTrue(Train.class.isAssignableFrom(RajdhaniTrain.class), "RajdhaniTrain must inherit Train");
        assertTrue(Train.class.isAssignableFrom(VandeBharatTrain.class), "VandeBharatTrain must inherit Train");
        assertTrue(Train.class.isAssignableFrom(SuperfastTrain.class), "SuperfastTrain must inherit Train");
        assertTrue(Train.class.isAssignableFrom(MailExpressTrain.class), "MailExpressTrain must inherit Train");

        // Interface implementation
        assertTrue(FareCalculable.class.isAssignableFrom(Train.class), "Train must implement FareCalculable interface");
    }

    @Test
    @Order(2)
    @DisplayName("OOP Concept 3 & 4: Runtime Polymorphism & Dynamic Method Dispatch")
    void testRuntimePolymorphism() {
        Train rajdhani = new RajdhaniTrain();
        rajdhani.setDistanceKm(1000);

        Train vandeBharat = new VandeBharatTrain();
        vandeBharat.setDistanceKm(500);

        Train superfast = new SuperfastTrain();
        superfast.setDistanceKm(600);

        Train mailExpress = new MailExpressTrain();
        mailExpress.setDistanceKm(400);

        // Dynamic dispatch via abstract reference
        assertEquals("RAJDHANI", rajdhani.getCategoryName());
        assertEquals("VANDE_BHARAT", vandeBharat.getCategoryName());
        assertEquals("SUPERFAST", superfast.getCategoryName());
        assertEquals("MAIL_EXPRESS", mailExpress.getCategoryName());

        // Polymorphic fare calculation
        double rajdhani3AC = rajdhani.calculateFare(CoachClass.THIRD_AC, 1000);
        double superfast3AC = superfast.calculateFare(CoachClass.THIRD_AC, 1000);
        assertTrue(rajdhani3AC > superfast3AC, "Rajdhani includes premier catering so fare must exceed standard superfast");
    }

    @Test
    @Order(3)
    @DisplayName("OOP Concept 5: Compile-time Polymorphism (Method Overloading)")
    void testMethodOverloading() {
        // TrainSearchService Method Overloading: 3 overloaded signatures
        List<Train> baseSearch = trainSearchService.searchTrains("HWH", "NDLS");
        assertFalse(baseSearch.isEmpty(), "Basic 2-parameter search should find trains");

        List<Train> dateSearch = trainSearchService.searchTrains("HWH", "NDLS", "2026-11-20");
        assertFalse(dateSearch.isEmpty(), "3-parameter search with journey date should return scheduled trains");

        List<Train> classSearch = trainSearchService.searchTrains("HWH", "NDLS", "2026-11-20", CoachClass.THIRD_AC);
        assertFalse(classSearch.isEmpty(), "4-parameter search with class filter should return matching trains");

        // FareCalculationService Method Overloading: 2 overloaded signatures
        FareBreakdown fareByCount = fareCalculationService.calculateFare("12301", CoachClass.THIRD_AC, 2);
        assertNotNull(fareByCount);
        assertEquals(2, fareByCount.getPassengerCount());

        List<Passenger> paxList = List.of(
                new Passenger("Suresh Sen", 65, Gender.MALE),
                new Passenger("Anita Sen", 62, Gender.FEMALE)
        );
        FareBreakdown fareByPax = fareCalculationService.calculateFare("12301", CoachClass.THIRD_AC, "HWH", "NDLS", paxList);
        assertNotNull(fareByPax);
        assertEquals(2, fareByPax.getSeniorCitizenCount(), "Both passengers are senior citizens");
        assertTrue(fareByPax.getSeniorDiscount() > 0, "Senior citizen discount must be applied");
    }

    @Test
    @Order(4)
    @DisplayName("OOP Concept 6: Constructor Overloading")
    void testConstructorOverloading() {
        // Passenger constructor overloading: 4 distinct constructors
        Passenger p1 = new Passenger();
        assertNotNull(p1);

        Passenger p2 = new Passenger("Rahul Roy", 30, Gender.MALE);
        assertEquals("Rahul Roy", p2.getFullName());
        assertEquals(30, p2.getAge());

        Passenger p3 = new Passenger("Sneha Roy", 28, Gender.FEMALE, "9876543210", IdProofType.AADHAAR, "123412341234");
        assertEquals("9876543210", p3.getPhone());
        assertEquals(IdProofType.AADHAAR, p3.getIdProofType());

        Passenger p4 = new Passenger(101, "Amit Das", 40, Gender.MALE, "9876543212", "amit@test.com", IdProofType.PAN_CARD, "ABCDE1234F", "2026-11-10 10:00:00");
        assertEquals(101, p4.getPassengerId());
        assertEquals("amit@test.com", p4.getEmail());
    }

    @Test
    @Order(5)
    @DisplayName("OOP Concept 7: Encapsulation & Integrity Validation")
    void testEncapsulation() {
        Passenger p = new Passenger();
        p.setFullName("Shiv Shankar Mal");
        p.setAge(62);
        p.setGender(Gender.MALE);

        assertEquals("Shiv Shankar Mal", p.getFullName());
        assertEquals(62, p.getAge());
        assertTrue(p.isSeniorCitizen(), "Age 62 qualifies for senior citizen discount");

        p.setAge(25);
        assertFalse(p.isSeniorCitizen(), "Age 25 does not qualify for senior citizen discount");
    }

    @Test
    @Order(6)
    @DisplayName("OOP Concept 8: Composition & Association")
    void testCompositionAndAssociation() {
        Reservation res = new Reservation();
        res.setPnr("2948571029");

        Passenger p = new Passenger(1, "Vikram Malhotra", 35, Gender.MALE, "9876500000", "v@test.com", IdProofType.AADHAAR, "111122223333", null);

        // Association: ReservationPassenger references Passenger
        ReservationPassenger rp = new ReservationPassenger(1, res.getPnr(), p.getPassengerId(), "B1", 21, "Lower Berth (LB)", 2405.0);
        rp.setPassenger(p);
        assertSame(p, rp.getPassenger(), "ReservationPassenger has an association with Passenger");

        // Composition: Reservation owns the collection of ReservationPassengers
        res.getPassengers().add(rp);
        assertEquals(1, res.getPassengers().size(), "Reservation has a composition relationship with ReservationPassengers");
    }

    // =========================================================================
    // SECTION 2: BUSINESS SERVICES & DOMAIN LOGIC
    // =========================================================================

    @Test
    @Order(7)
    @DisplayName("Business Service 1: StationService Queries & Lookups")
    void testStationService() {
        assertEquals(367, stationService.getTotalStationsCount(), "Station count should be 367");

        Station hwh = stationService.getStationByCode("HWH");
        assertNotNull(hwh);
        assertEquals("Howrah Junction", hwh.getStationName());

        Station nh = stationService.getStationByCode("NH");
        assertNotNull(nh);
        assertEquals("Naihati Junction", nh.getStationName());

        Station rph = stationService.getStationByCode("RPH");
        assertNotNull(rph);
        assertEquals("Rampurhat Junction", rph.getStationName());

        List<Station> results = stationService.searchStations("Kolkata");
        assertFalse(results.isEmpty(), "Should find Kolkata stations");

        assertThrows(InvalidStationException.class, () -> {
            stationService.getStationByCode("NON_EXISTING_XYZ");
        }, "Should throw InvalidStationException for non-existent station code");
    }

    @Test
    @Order(8)
    @DisplayName("Business Service 2: TrainSearchService Corridors & Intermediate Halts")
    void testTrainSearchService() {
        // Howrah to New Delhi corridor
        List<Train> hwhNdls = trainSearchService.searchTrains("HWH", "NDLS");
        assertFalse(hwhNdls.isEmpty(), "Should return trains from HWH to NDLS");

        // Sealdah to Naihati corridor
        List<Train> sdahNh = trainSearchService.searchTrains("SDAH", "NH");
        assertFalse(sdahNh.isEmpty(), "Should return trains from SDAH to NH");

        // Validate intermediate route and schedule retrieval
        List<TrainRoute> routes = trainSearchService.getTrainRoute("12301");
        assertFalse(routes.isEmpty(), "Should return route halts for 12301");

        List<TrainSchedule> schedules = trainSearchService.getTrainSchedule("12301");
        assertFalse(schedules.isEmpty(), "Should return timetable stops for 12301");

        // Distance computation
        int dist = trainSearchService.calculateDistance("12301", "HWH", "NDLS");
        assertTrue(dist >= 1440 && dist <= 1460, "Distance should match verified intermediate route kilometers");

        // Exception on identical source and destination
        assertThrows(InvalidJourneyException.class, () -> {
            trainSearchService.searchTrains("HWH", "HWH");
        }, "Identical source and destination must throw InvalidJourneyException");
    }

    @Test
    @Order(9)
    @DisplayName("Business Service 3: SeatAvailabilityService & Matrix")
    void testSeatAvailabilityService() {
        int avail = seatAvailabilityService.getAvailableSeats("12301", CoachClass.THIRD_AC);
        assertTrue(avail > 0, "Train 12301 3A must have initial seats");

        assertTrue(seatAvailabilityService.hasAvailableSeats("12301", CoachClass.THIRD_AC, 1));
        assertFalse(seatAvailabilityService.hasAvailableSeats("12301", CoachClass.THIRD_AC, 999999));

        List<SeatInventory> matrix = seatAvailabilityService.getTrainSeatMatrix("12301");
        assertFalse(matrix.isEmpty(), "Should return seat matrix across classes for train 12301");
    }

    @Test
    @Order(10)
    @DisplayName("Business Service 4: FareCalculationService Breakdown & Senior Discount")
    void testFareCalculationService() {
        // Standard adult passenger
        Passenger adult = new Passenger("Debashis Roy", 35, Gender.MALE);
        FareBreakdown adultFare = fareCalculationService.calculateFare("12301", CoachClass.THIRD_AC, "HWH", "NDLS", List.of(adult));
        assertEquals(0.0, adultFare.getSeniorDiscount(), "No senior discount for adult");
        assertTrue(adultFare.getGstAmount() > 0, "5% GST applicable on AC travel");
        assertTrue(adultFare.getCateringCharge() > 0, "Rajdhani includes catering");

        // Senior citizen passenger (60+ qualifies for 40% base fare discount)
        Passenger senior = new Passenger("Kamala Roy", 66, Gender.FEMALE);
        FareBreakdown seniorFare = fareCalculationService.calculateFare("12301", CoachClass.THIRD_AC, "HWH", "NDLS", List.of(senior));
        assertTrue(seniorFare.getSeniorDiscount() > 0, "Senior discount must be calculated");
        assertTrue(seniorFare.getTotalFare() < adultFare.getTotalFare(), "Senior total fare must be lower than adult fare");
    }

    @Test
    @Order(11)
    @DisplayName("Business Service 5: PassengerService Validation Rules")
    void testPassengerServiceValidation() {
        // Null or empty passenger list
        assertThrows(InvalidPassengerException.class, () -> passengerService.validatePassengers(null));
        assertThrows(InvalidPassengerException.class, () -> passengerService.validatePassengers(List.of()));

        // More than 6 passengers (IRCTC max rule)
        List<Passenger> sevenPax = List.of(
                new Passenger("P1", 20, Gender.MALE),
                new Passenger("P2", 21, Gender.MALE),
                new Passenger("P3", 22, Gender.MALE),
                new Passenger("P4", 23, Gender.MALE),
                new Passenger("P5", 24, Gender.MALE),
                new Passenger("P6", 25, Gender.MALE),
                new Passenger("P7", 26, Gender.MALE)
        );
        assertThrows(InvalidPassengerException.class, () -> passengerService.validatePassengers(sevenPax));

        // Invalid age
        Passenger badAge = new Passenger("Bad Age", 0, Gender.MALE);
        assertThrows(InvalidPassengerException.class, () -> passengerService.validatePassenger(badAge));

        // Blank name
        Passenger blankName = new Passenger("   ", 25, Gender.MALE);
        assertThrows(InvalidPassengerException.class, () -> passengerService.validatePassenger(blankName));
    }

    @Test
    @Order(12)
    @DisplayName("Business Service 6: End-to-End BookingService Workflow")
    void testEndToEndBookingWorkflow() {
        String trainNum = "12301";
        CoachClass coachClass = CoachClass.THIRD_AC;
        int seatsBefore = seatAvailabilityService.getAvailableSeats(trainNum, coachClass);
        assertTrue(seatsBefore >= 2);

        BookingRequest request = new BookingRequest();
        request.setTrainNumber(trainNum);
        request.setSourceStationCode("HWH");
        request.setDestinationStationCode("NDLS");
        request.setJourneyDate("2026-11-28");
        request.setCoachClass(coachClass);
        request.setPassengers(List.of(
                new Passenger(0, "Shiv Shankar Mal", 62, Gender.MALE, "9876543210", "shiv@test.com", IdProofType.AADHAAR, "123456789012", null),
                new Passenger(0, "Aparna Mal", 58, Gender.FEMALE, "9876543211", "aparna@test.com", IdProofType.VOTER_ID, "WB12345678", null)
        ));

        BookingResult result = bookingService.bookTicket(request);

        assertTrue(result.isSuccess(), "Booking must succeed");
        assertNotNull(result.getPnr(), "Unique 10-digit PNR must be generated");
        assertEquals(10, result.getPnr().length(), "PNR must be 10 digits");
        assertEquals(BookingStatus.CONFIRMED, result.getReservation().getBookingStatus());

        // Verify seats decremented by 2
        int seatsAfter = seatAvailabilityService.getAvailableSeats(trainNum, coachClass);
        assertEquals(seatsBefore - 2, seatsAfter, "Available seats must decrement by 2");

        // Verify ReservationService retrieves the booking
        Optional<Reservation> fetched = reservationService.getReservationByPnr(result.getPnr());
        assertTrue(fetched.isPresent(), "Reservation must be retrievable via ReservationService");
        assertEquals(2, fetched.get().getPassengers().size(), "Must contain 2 passenger allocations");
        assertNotNull(fetched.get().getPassengers().get(0).getCoachNumber(), "Coach number must be assigned");
        assertNotNull(fetched.get().getPassengers().get(0).getBerthType(), "Berth type must be assigned");
    }

    @Test
    @Order(13)
    @DisplayName("Business Service 7: End-to-End CancellationService & Refund Processing")
    void testEndToEndCancellationWorkflow() {
        String trainNum = "12301";
        CoachClass coachClass = CoachClass.THIRD_AC;
        int seatsBefore = seatAvailabilityService.getAvailableSeats(trainNum, coachClass);

        BookingRequest request = new BookingRequest();
        request.setTrainNumber(trainNum);
        request.setSourceStationCode("HWH");
        request.setDestinationStationCode("NDLS");
        request.setJourneyDate("2026-11-29");
        request.setCoachClass(coachClass);
        request.setPassengers(List.of(
                new Passenger("Gaurav Bose", 31, Gender.MALE, "9830012345", IdProofType.AADHAAR, "555566667777")
        ));

        BookingResult booked = bookingService.bookTicket(request);
        String pnr = booked.getPnr();
        assertEquals(seatsBefore - 1, seatAvailabilityService.getAvailableSeats(trainNum, coachClass));

        // Perform cancellation
        CancellationResult cancelResult = cancellationService.cancelTicket(pnr, "Personal emergency");
        assertTrue(cancelResult.isSuccess(), "Cancellation must succeed");
        assertNotNull(cancelResult.getCancellationSlip());
        assertTrue(cancelResult.getCancellationSlip().getRefundAmount() > 0, "Refund must be calculated");
        assertTrue(cancelResult.getCancellationSlip().getCancellationFee() > 0, "15% IR cancellation fee must be deducted");
        assertTrue(cancelResult.getCancellationSlip().getRefundReferenceId().startsWith("REF-"));

        // Verify seats restored
        int seatsRestored = seatAvailabilityService.getAvailableSeats(trainNum, coachClass);
        assertEquals(seatsBefore, seatsRestored, "Seats must be restored to initial level upon cancellation");

        // Verify status updated to CANCELLED in ReservationService
        Reservation cancelledRes = reservationService.getReservationByPnr(pnr).orElseThrow();
        assertEquals(BookingStatus.CANCELLED, cancelledRes.getBookingStatus());

        // Re-cancellation must be rejected
        assertThrows(IllegalStateException.class, () -> {
            cancellationService.cancelTicket(pnr, "Attempting double cancellation");
        }, "Double cancellation of the same PNR must throw IllegalStateException");
    }

    @Test
    @Order(14)
    @DisplayName("Business Service 8: ReservationService Statistics & PNR Validation")
    void testReservationServiceAudit() {
        assertTrue(reservationService.isValidPnr("2847591029"));
        assertFalse(reservationService.isValidPnr("123"));
        assertFalse(reservationService.isValidPnr("284759102A"));
        assertFalse(reservationService.isValidPnr(null));

        int count = reservationService.getTotalReservationsCount();
        assertTrue(count >= 2, "At least 2 test reservations should have been recorded");

        double revenue = reservationService.getTotalRevenue();
        assertTrue(revenue > 0, "Total revenue for confirmed reservations should be positive");
    }
}
