package com.railway.reservation.config;

import com.railway.reservation.dao.*;
import com.railway.reservation.db.DatabaseManager;
import com.railway.reservation.service.*;
import com.railway.reservation.service.impl.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring IoC Configuration wiring existing JDBC DAOs and Java OOP Business Services.
 * Ensures zero duplication of business logic and clean dependency injection into Spring MVC Controllers.
 */
@Configuration
public class RailwayAppConfig {

    @Bean
    public DatabaseManager databaseManager() {
        return DatabaseManager.getInstance();
    }

    // =========================================================================
    // JDBC DATA ACCESS OBJECTS (DAOs)
    // =========================================================================

    @Bean
    public StationDAO stationDAO(DatabaseManager dbManager) {
        return new StationDAO(dbManager);
    }

    @Bean
    public TrainDAO trainDAO(DatabaseManager dbManager) {
        return new TrainDAO(dbManager);
    }

    @Bean
    public RouteDAO routeDAO(DatabaseManager dbManager) {
        return new RouteDAO(dbManager);
    }

    @Bean
    public SeatInventoryDAO seatInventoryDAO(DatabaseManager dbManager) {
        return new SeatInventoryDAO(dbManager);
    }

    @Bean
    public PassengerDAO passengerDAO(DatabaseManager dbManager) {
        return new PassengerDAO(dbManager);
    }

    @Bean
    public ReservationDAO reservationDAO(DatabaseManager dbManager,
                                         PassengerDAO passengerDAO,
                                         SeatInventoryDAO seatInventoryDAO) {
        return new ReservationDAO(dbManager, passengerDAO, seatInventoryDAO);
    }

    @Bean
    public CancellationDAO cancellationDAO(DatabaseManager dbManager,
                                           ReservationDAO reservationDAO,
                                           SeatInventoryDAO seatInventoryDAO) {
        return new CancellationDAO(dbManager, reservationDAO, seatInventoryDAO);
    }

    @Bean
    public AdminUserDAO adminUserDAO(DatabaseManager dbManager) {
        return new AdminUserDAO(dbManager);
    }

    // =========================================================================
    // BUSINESS SERVICES
    // =========================================================================

    @Bean
    public StationService stationService(StationDAO stationDAO) {
        return new StationServiceImpl(stationDAO);
    }

    @Bean
    public TrainSearchService trainSearchService(TrainDAO trainDAO,
                                                 StationDAO stationDAO,
                                                 RouteDAO routeDAO,
                                                 SeatInventoryDAO seatInventoryDAO) {
        return new TrainSearchServiceImpl(trainDAO, stationDAO, routeDAO, seatInventoryDAO);
    }

    @Bean
    public SeatAvailabilityService seatAvailabilityService(SeatInventoryDAO seatInventoryDAO) {
        return new SeatAvailabilityServiceImpl(seatInventoryDAO);
    }

    @Bean
    public FareCalculationService fareCalculationService(DatabaseManager dbManager, TrainDAO trainDAO) {
        return new FareCalculationServiceImpl(dbManager, trainDAO);
    }

    @Bean
    public PassengerService passengerService(PassengerDAO passengerDAO) {
        return new PassengerServiceImpl(passengerDAO);
    }

    @Bean
    public BookingService bookingService(TrainSearchService trainSearchService,
                                         SeatAvailabilityService seatAvailabilityService,
                                         FareCalculationService fareCalculationService,
                                         PassengerService passengerService,
                                         ReservationDAO reservationDAO) {
        return new BookingServiceImpl(trainSearchService, seatAvailabilityService, fareCalculationService, passengerService, reservationDAO);
    }

    @Bean
    public CancellationService cancellationService(CancellationDAO cancellationDAO,
                                                   ReservationDAO reservationDAO) {
        return new CancellationServiceImpl(cancellationDAO, reservationDAO);
    }

    @Bean
    public ReservationService reservationService(ReservationDAO reservationDAO) {
        return new ReservationServiceImpl(reservationDAO);
    }
}
