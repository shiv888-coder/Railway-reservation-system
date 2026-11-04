package com.railway.reservation.service;

import com.railway.reservation.dto.PassengerDto;
import com.railway.reservation.entity.PassengerEntity;

import java.util.List;

/**
 * Service interface for passenger profile directory management.
 *
 * OOP Concept: Interface-Based Programming
 */
public interface PassengerService {

    List<PassengerEntity> getAllPassengers();

    PassengerEntity getPassengerById(Long id);

    PassengerEntity createPassenger(PassengerDto dto);

    PassengerEntity updatePassenger(Long id, PassengerDto dto);

    void deletePassenger(Long id);
}
