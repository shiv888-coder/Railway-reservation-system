package com.railway.reservation;

import com.railway.reservation.db.DatabaseManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 * Spring Boot Application Entry Point for Indian Railway Reservation System (Web Edition).
 * Group 9 - B.Tech Computer Science & Engineering.
 */
@SpringBootApplication
public class RailwayReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(RailwayReservationApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseInitializer(
            @Value("${railway.db.path:railway.db}") String dbPath) {
        return args -> {
            DatabaseManager.setConfiguredDbPath(dbPath);
            DatabaseManager dbManager = DatabaseManager.getInstance();
            dbManager.initializeDatabase();
            System.out.println("=====================================================================");
            System.out.println("🚆 Indian Railway Reservation System (Spring Boot Web Interface)");
            System.out.println("   Database: " + dbPath + " [INITIALIZED & VERIFIED]");
            System.out.println("   Server running on: http://localhost:8080");
            System.out.println("=====================================================================");
        };
    }
}
