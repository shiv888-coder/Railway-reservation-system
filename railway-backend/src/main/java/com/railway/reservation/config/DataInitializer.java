package com.railway.reservation.config;

import com.railway.reservation.entity.*;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Database Seeder and Sample Data Initializer for Railway Reservation System.
 *
 * Implements Spring Boot CommandLineRunner to populate baseline railway entities upon startup.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Polymorphic Instantiation:
 *    - Instantiates concrete subclasses (RajdhaniTrainEntity, VandeBharatTrainEntity, SuperfastTrainEntity)
 *      through their common BaseTrainEntity reference.
 * 2. Encapsulation:
 *    - Uses bidirectional helper methods (train.addHalt(), train.addSeat(), reservation.addSeatAllocation()).
 * 3. Idempotent Data Management:
 *    - Performs existence checks before inserting to prevent duplicate records on server reboots.
 */
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final PassengerRepository passengerRepository;
    private final ReservationRepository reservationRepository;
    private final TrainSeatRepository trainSeatRepository;

    public DataInitializer(StationRepository stationRepository,
                           TrainRepository trainRepository,
                           PassengerRepository passengerRepository,
                           ReservationRepository reservationRepository,
                           TrainSeatRepository trainSeatRepository) {
        this.stationRepository = stationRepository;
        this.trainRepository = trainRepository;
        this.passengerRepository = passengerRepository;
        this.reservationRepository = reservationRepository;
        this.trainSeatRepository = trainSeatRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("================================================================================");
        log.info(" Railway Reservation System - Initializing Database & Seeding Sample Data");
        log.info(" B.Tech CSE Java OOP Lab Mini Project | Shiv Shankar Mal (Roll: 2760012408)");
        log.info("================================================================================");

        try {
            Map<String, StationEntity> stationMap = seedStations();
            seedTrains(stationMap);
            seedSampleReservations(stationMap);

            log.info(" Database seeding completed successfully.");
            log.info(" Stations in DB:     {}", stationRepository.count());
            log.info(" Trains in DB:       {}", trainRepository.count());
            log.info(" Seat Classes in DB: {}", trainSeatRepository.count());
            log.info(" Passengers in DB:   {}", passengerRepository.count());
            log.info(" Bookings in DB:     {}", reservationRepository.count());
            log.info("================================================================================");
        } catch (Exception e) {
            log.error(" Database initialization encountered an error: {}", e.getMessage(), e);
        }
    }

    /**
     * Seeds at least 10 major railway stations across India.
     * Idempotent: checks existsByStationCode before saving.
     */
    private Map<String, StationEntity> seedStations() {
        log.info("Checking and seeding railway stations...");

        StationEntity[] initialStations = new StationEntity[]{
                new StationEntity("NDLS", "New Delhi Railway Station", "New Delhi", "Delhi", "Northern Railway (NR)"),
                new StationEntity("HWH", "Howrah Junction", "Kolkata", "West Bengal", "Eastern Railway (ER)"),
                new StationEntity("CSMT", "Chhatrapati Shivaji Maharaj Terminus", "Mumbai", "Maharashtra", "Central Railway (CR)"),
                new StationEntity("MAS", "Puratchi Thalaivar Dr. M.G.R. Chennai Central", "Chennai", "Tamil Nadu", "Southern Railway (SR)"),
                new StationEntity("SBC", "KSR Bengaluru City Junction", "Bengaluru", "Karnataka", "South Western Railway (SWR)"),
                new StationEntity("ADI", "Ahmedabad Junction", "Ahmedabad", "Gujarat", "Western Railway (WR)"),
                new StationEntity("BSB", "Varanasi Junction", "Varanasi", "Uttar Pradesh", "Northern Railway (NR)"),
                new StationEntity("PNBE", "Patna Junction", "Patna", "Bihar", "East Central Railway (ECR)"),
                new StationEntity("CNB", "Kanpur Central", "Kanpur", "Uttar Pradesh", "North Central Railway (NCR)"),
                new StationEntity("PUNE", "Pune Junction", "Pune", "Maharashtra", "Central Railway (CR)")
        };

        Map<String, StationEntity> stationMap = new HashMap<>();

        for (StationEntity station : initialStations) {
            if (!stationRepository.existsByStationCode(station.getStationCode())) {
                StationEntity saved = stationRepository.save(station);
                stationMap.put(saved.getStationCode(), saved);
                log.info("  + Inserted Station: {} ({})", saved.getStationName(), saved.getStationCode());
            } else {
                stationRepository.findByStationCode(station.getStationCode())
                        .ifPresent(existing -> stationMap.put(existing.getStationCode(), existing));
            }
        }

        return stationMap;
    }

    /**
     * Seeds 6 premier trains demonstrating polymorphic inheritance:
     * - RajdhaniTrainEntity (Howrah Rajdhani, Mumbai Rajdhani)
     * - VandeBharatTrainEntity (Varanasi Vande Bharat, Mysuru Vande Bharat)
     * - SuperfastTrainEntity (Howrah Mumbai Mail, Tamil Nadu Superfast)
     */
    private void seedTrains(Map<String, StationEntity> stations) {
        log.info("Checking and seeding trains, routes, and seat inventories...");

        StationEntity ndls = stations.get("NDLS");
        StationEntity hwh = stations.get("HWH");
        StationEntity csmt = stations.get("CSMT");
        StationEntity mas = stations.get("MAS");
        StationEntity sbc = stations.get("SBC");
        StationEntity bsb = stations.get("BSB");
        StationEntity pnbe = stations.get("PNBE");
        StationEntity cnb = stations.get("CNB");
        StationEntity adi = stations.get("ADI");
        StationEntity pune = stations.get("PUNE");

        // ---------------------------------------------------------------------
        // 1. Train 12301: Howrah Rajdhani Express (RajdhaniTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("12301")) {
            BaseTrainEntity rajdhani = new RajdhaniTrainEntity(
                    "12301",
                    "Howrah Rajdhani Express",
                    hwh,
                    ndls,
                    LocalTime.of(16, 50),
                    LocalTime.of(10, 5),
                    "17h 15m",
                    1451,
                    "Daily"
            );

            // Scheduled Halts
            rajdhani.addHalt(new RouteHaltEntity(rajdhani, hwh, "16:50", "16:50", 0, 0, 1, 1));
            rajdhani.addHalt(new RouteHaltEntity(rajdhani, pnbe, "22:10", "22:20", 10, 532, 1, 2));
            rajdhani.addHalt(new RouteHaltEntity(rajdhani, cnb, "04:50", "04:55", 5, 1012, 2, 3));
            rajdhani.addHalt(new RouteHaltEntity(rajdhani, ndls, "10:05", "10:05", 0, 1451, 2, 4));

            // Seat Configurations
            rajdhani.addSeat(new TrainSeatEntity(rajdhani, CoachClass.FIRST_AC, 36, 28, BigDecimal.valueOf(4850.00)));
            rajdhani.addSeat(new TrainSeatEntity(rajdhani, CoachClass.SECOND_AC, 112, 86, BigDecimal.valueOf(2950.00)));
            rajdhani.addSeat(new TrainSeatEntity(rajdhani, CoachClass.THIRD_AC, 240, 185, BigDecimal.valueOf(1950.00)));

            trainRepository.save(rajdhani);
            log.info("  + Inserted [Rajdhani]: 12301 - Howrah Rajdhani Express (HWH -> NDLS)");
        }

        // ---------------------------------------------------------------------
        // 2. Train 22436: Vande Bharat Express (VandeBharatTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("22436")) {
            BaseTrainEntity vandeBharat = new VandeBharatTrainEntity(
                    "22436",
                    "Vande Bharat Express",
                    bsb,
                    ndls,
                    LocalTime.of(15, 0),
                    LocalTime.of(23, 0),
                    "8h 00m",
                    759,
                    "Tue, Wed, Fri, Sat, Sun"
            );

            // Scheduled Halts
            vandeBharat.addHalt(new RouteHaltEntity(vandeBharat, bsb, "15:00", "15:00", 0, 0, 1, 1));
            vandeBharat.addHalt(new RouteHaltEntity(vandeBharat, cnb, "18:30", "18:35", 5, 319, 1, 2));
            vandeBharat.addHalt(new RouteHaltEntity(vandeBharat, ndls, "23:00", "23:00", 0, 759, 1, 3));

            // Seat Configurations
            vandeBharat.addSeat(new TrainSeatEntity(vandeBharat, CoachClass.CHAIR_CAR, 300, 210, BigDecimal.valueOf(1450.00)));
            vandeBharat.addSeat(new TrainSeatEntity(vandeBharat, CoachClass.EXECUTIVE_CHAIR, 52, 38, BigDecimal.valueOf(2680.00)));

            trainRepository.save(vandeBharat);
            log.info("  + Inserted [Vande Bharat]: 22436 - Vande Bharat Express (BSB -> NDLS)");
        }

        // ---------------------------------------------------------------------
        // 3. Train 12952: Mumbai Rajdhani Express (RajdhaniTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("12952")) {
            BaseTrainEntity mumbaiRaj = new RajdhaniTrainEntity(
                    "12952",
                    "Mumbai Rajdhani Express",
                    ndls,
                    csmt,
                    LocalTime.of(16, 55),
                    LocalTime.of(8, 35),
                    "15h 40m",
                    1386,
                    "Daily"
            );

            mumbaiRaj.addHalt(new RouteHaltEntity(mumbaiRaj, ndls, "16:55", "16:55", 0, 0, 1, 1));
            mumbaiRaj.addHalt(new RouteHaltEntity(mumbaiRaj, adi, "03:15", "03:25", 10, 934, 2, 2));
            mumbaiRaj.addHalt(new RouteHaltEntity(mumbaiRaj, csmt, "08:35", "08:35", 0, 1386, 2, 3));

            mumbaiRaj.addSeat(new TrainSeatEntity(mumbaiRaj, CoachClass.FIRST_AC, 32, 24, BigDecimal.valueOf(4650.00)));
            mumbaiRaj.addSeat(new TrainSeatEntity(mumbaiRaj, CoachClass.SECOND_AC, 120, 94, BigDecimal.valueOf(2820.00)));
            mumbaiRaj.addSeat(new TrainSeatEntity(mumbaiRaj, CoachClass.THIRD_AC, 220, 172, BigDecimal.valueOf(1890.00)));

            trainRepository.save(mumbaiRaj);
            log.info("  + Inserted [Rajdhani]: 12952 - Mumbai Rajdhani Express (NDLS -> CSMT)");
        }

        // ---------------------------------------------------------------------
        // 4. Train 12810: Howrah Mumbai Superfast Mail (SuperfastTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("12810")) {
            BaseTrainEntity superfastMail = new SuperfastTrainEntity(
                    "12810",
                    "Howrah Mumbai Superfast Mail",
                    hwh,
                    csmt,
                    LocalTime.of(19, 40),
                    LocalTime.of(4, 25),
                    "32h 45m",
                    1968,
                    "Daily"
            );

            superfastMail.addHalt(new RouteHaltEntity(superfastMail, hwh, "19:40", "19:40", 0, 0, 1, 1));
            superfastMail.addHalt(new RouteHaltEntity(superfastMail, bsb, "08:15", "08:25", 10, 678, 2, 2));
            superfastMail.addHalt(new RouteHaltEntity(superfastMail, pune, "23:10", "23:20", 10, 1776, 2, 3));
            superfastMail.addHalt(new RouteHaltEntity(superfastMail, csmt, "04:25", "04:25", 0, 1968, 3, 4));

            superfastMail.addSeat(new TrainSeatEntity(superfastMail, CoachClass.FIRST_AC, 24, 18, BigDecimal.valueOf(3840.00)));
            superfastMail.addSeat(new TrainSeatEntity(superfastMail, CoachClass.SECOND_AC, 80, 62, BigDecimal.valueOf(2310.00)));
            superfastMail.addSeat(new TrainSeatEntity(superfastMail, CoachClass.THIRD_AC, 180, 135, BigDecimal.valueOf(1580.00)));
            superfastMail.addSeat(new TrainSeatEntity(superfastMail, CoachClass.SLEEPER, 400, 310, BigDecimal.valueOf(640.00)));

            trainRepository.save(superfastMail);
            log.info("  + Inserted [Superfast]: 12810 - Howrah Mumbai Superfast Mail (HWH -> CSMT)");
        }

        // ---------------------------------------------------------------------
        // 5. Train 20608: Vande Bharat Express (SBC -> MAS) (VandeBharatTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("20608")) {
            BaseTrainEntity sbcMasVb = new VandeBharatTrainEntity(
                    "20608",
                    "Vande Bharat Express (SBC - MAS)",
                    sbc,
                    mas,
                    LocalTime.of(5, 45),
                    LocalTime.of(10, 15),
                    "4h 30m",
                    359,
                    "Mon, Tue, Thu, Fri, Sat, Sun"
            );

            sbcMasVb.addHalt(new RouteHaltEntity(sbcMasVb, sbc, "05:45", "05:45", 0, 0, 1, 1));
            sbcMasVb.addHalt(new RouteHaltEntity(sbcMasVb, mas, "10:15", "10:15", 0, 359, 1, 2));

            sbcMasVb.addSeat(new TrainSeatEntity(sbcMasVb, CoachClass.CHAIR_CAR, 320, 265, BigDecimal.valueOf(995.00)));
            sbcMasVb.addSeat(new TrainSeatEntity(sbcMasVb, CoachClass.EXECUTIVE_CHAIR, 52, 44, BigDecimal.valueOf(1885.00)));

            trainRepository.save(sbcMasVb);
            log.info("  + Inserted [Vande Bharat]: 20608 - Vande Bharat Express (SBC -> MAS)");
        }

        // ---------------------------------------------------------------------
        // 6. Train 12622: Tamil Nadu Superfast Express (SuperfastTrainEntity)
        // ---------------------------------------------------------------------
        if (!trainRepository.existsByTrainNumber("12622")) {
            BaseTrainEntity tnExpress = new SuperfastTrainEntity(
                    "12622",
                    "Tamil Nadu Superfast Express",
                    ndls,
                    mas,
                    LocalTime.of(21, 5),
                    LocalTime.of(6, 35),
                    "33h 30m",
                    2184,
                    "Daily"
            );

            tnExpress.addHalt(new RouteHaltEntity(tnExpress, ndls, "21:05", "21:05", 0, 0, 1, 1));
            tnExpress.addHalt(new RouteHaltEntity(tnExpress, cnb, "02:40", "02:45", 5, 440, 2, 2));
            tnExpress.addHalt(new RouteHaltEntity(tnExpress, mas, "06:35", "06:35", 0, 2184, 3, 3));

            tnExpress.addSeat(new TrainSeatEntity(tnExpress, CoachClass.SECOND_AC, 72, 54, BigDecimal.valueOf(2650.00)));
            tnExpress.addSeat(new TrainSeatEntity(tnExpress, CoachClass.THIRD_AC, 210, 168, BigDecimal.valueOf(1720.00)));
            tnExpress.addSeat(new TrainSeatEntity(tnExpress, CoachClass.SLEEPER, 480, 390, BigDecimal.valueOf(710.00)));

            trainRepository.save(tnExpress);
            log.info("  + Inserted [Superfast]: 12622 - Tamil Nadu Superfast Express (NDLS -> MAS)");
        }
    }

    /**
     * Seeds initial passengers and a verified PNR reservation with seat allocations.
     * Ensures dashboard KPI metrics, PNR lookup, and cancellation flows are immediately functional.
     */
    private void seedSampleReservations(Map<String, StationEntity> stations) {
        log.info("Checking and seeding sample passenger profiles and initial PNR reservation...");

        // Passenger 1: Student Project Lead
        PassengerEntity p1 = passengerRepository.findByPhone("+91 98765 43210")
                .orElseGet(() -> passengerRepository.save(new PassengerEntity(
                        "Shiv Shankar Mal",
                        22,
                        Gender.MALE,
                        "+91 98765 43210",
                        "shiv.cse@lab.edu",
                        IdProofType.AADHAAR_CARD,
                        "9876-5432-1098"
                )));

        // Passenger 2: Senior Citizen Professor (for viva concession demonstration)
        PassengerEntity p2 = passengerRepository.findByPhone("+91 91234 56780")
                .orElseGet(() -> passengerRepository.save(new PassengerEntity(
                        "Prof. Rajesh Sharma",
                        62,
                        Gender.MALE,
                        "+91 91234 56780",
                        "rajesh.prof@university.ac.in",
                        IdProofType.PAN_CARD,
                        "ABCPS1234F"
                )));

        // Passenger 3: Research Doctor
        passengerRepository.findByPhone("+91 98301 23456")
                .orElseGet(() -> passengerRepository.save(new PassengerEntity(
                        "Dr. Ananya Sen",
                        34,
                        Gender.FEMALE,
                        "+91 98301 23456",
                        "ananya.sen@medresearch.org",
                        IdProofType.PASSPORT,
                        "Z9876543"
                )));

        // Check if sample reservation exists
        String samplePnr = "2849182374";
        if (!reservationRepository.existsByPnr(samplePnr)) {
            trainRepository.findByTrainNumber("12301").ifPresent(train -> {
                StationEntity hwh = stations.get("HWH");
                StationEntity ndls = stations.get("NDLS");

                // Calculate fares: 2 passengers, 1 senior
                BigDecimal baseFare = BigDecimal.valueOf(3900.00);      // 1950 x 2
                BigDecimal resCharge = BigDecimal.valueOf(80.00);       // 40 x 2
                BigDecimal sfCharge = BigDecimal.valueOf(150.00);       // 75 x 2
                BigDecimal catering = BigDecimal.valueOf(680.00);       // 340 x 2
                BigDecimal seniorDiscount = BigDecimal.valueOf(487.50); // 25% of 1950
                BigDecimal taxable = baseFare.add(resCharge).add(sfCharge).add(catering).subtract(seniorDiscount); // 4322.50
                BigDecimal gst = BigDecimal.valueOf(216.13);            // 5% of 4322.50
                BigDecimal totalFare = BigDecimal.valueOf(4538.63);

                ReservationEntity reservation = new ReservationEntity(
                        samplePnr,
                        train,
                        hwh,
                        ndls,
                        LocalDate.now().plusDays(5),
                        CoachClass.THIRD_AC,
                        baseFare,
                        resCharge,
                        sfCharge,
                        catering,
                        gst,
                        seniorDiscount,
                        totalFare
                );
                reservation.setBookingStatus(BookingStatus.CONFIRMED);
                reservation.setBookedAt(LocalDateTime.now().minusHours(4));

                // Seat Allocations
                SeatAllocationEntity alloc1 = new SeatAllocationEntity(reservation, p1, "B2", 21, "Lower Berth");
                SeatAllocationEntity alloc2 = new SeatAllocationEntity(reservation, p2, "B2", 22, "Middle Berth");

                reservation.addSeatAllocation(alloc1);
                reservation.addSeatAllocation(alloc2);

                reservationRepository.save(reservation);
                log.info("  + Inserted Initial Booking: PNR {} (Howrah Rajdhani, 2 Passengers, ₹{})",
                        reservation.getFormattedPnr(), totalFare);
            });
        }
    }
}
