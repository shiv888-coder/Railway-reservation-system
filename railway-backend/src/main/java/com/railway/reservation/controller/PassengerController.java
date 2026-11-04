package com.railway.reservation.controller;

import com.railway.reservation.dto.PassengerDto;
import com.railway.reservation.entity.PassengerEntity;
import com.railway.reservation.service.PassengerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Passenger Profile Directory CRUD management.
 */
@RestController
@RequestMapping("/api/passengers")
public class PassengerController {

    private final PassengerService passengerService;

    public PassengerController(PassengerService passengerService) {
        this.passengerService = passengerService;
    }

    /**
     * GET /api/passengers
     * Retrieves all saved passenger profiles.
     */
    @GetMapping
    public ResponseEntity<List<PassengerEntity>> getAllPassengers() {
        List<PassengerEntity> passengers = passengerService.getAllPassengers();
        return ResponseEntity.ok(passengers);
    }

    /**
     * GET /api/passengers/{id}
     * Retrieves an individual passenger profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PassengerEntity> getPassengerById(@PathVariable("id") Long id) {
        PassengerEntity passenger = passengerService.getPassengerById(id);
        return ResponseEntity.ok(passenger);
    }

    /**
     * POST /api/passengers
     * Creates and saves a new passenger profile.
     */
    @PostMapping
    public ResponseEntity<PassengerEntity> createPassenger(@Valid @RequestBody PassengerDto passengerDto) {
        PassengerEntity created = passengerService.createPassenger(passengerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/passengers/{id}
     * Updates an existing passenger profile.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PassengerEntity> updatePassenger(@PathVariable("id") Long id,
                                                           @Valid @RequestBody PassengerDto passengerDto) {
        PassengerEntity updated = passengerService.updatePassenger(id, passengerDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/passengers/{id}
     * Removes a passenger profile from the directory.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable("id") Long id) {
        passengerService.deletePassenger(id);
        return ResponseEntity.noContent().build();
    }
}
