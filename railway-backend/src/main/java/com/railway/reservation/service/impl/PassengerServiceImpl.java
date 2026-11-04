package com.railway.reservation.service.impl;

import com.railway.reservation.dto.PassengerDto;
import com.railway.reservation.entity.PassengerEntity;
import com.railway.reservation.exception.ResourceNotFoundException;
import com.railway.reservation.repository.PassengerRepository;
import com.railway.reservation.service.PassengerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Concrete implementation of PassengerService.
 */
@Service
public class PassengerServiceImpl implements PassengerService {

    private final PassengerRepository passengerRepository;

    public PassengerServiceImpl(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PassengerEntity> getAllPassengers() {
        return passengerRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public PassengerEntity getPassengerById(Long id) {
        return passengerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger", "id", id));
    }

    @Override
    @Transactional
    public PassengerEntity createPassenger(PassengerDto dto) {
        PassengerEntity entity = new PassengerEntity(
                dto.getFullName(),
                dto.getAge(),
                dto.getGender(),
                dto.getPhone(),
                dto.getEmail(),
                dto.getIdProofType(),
                dto.getIdProofNumber()
        );
        return passengerRepository.save(entity);
    }

    @Override
    @Transactional
    public PassengerEntity updatePassenger(Long id, PassengerDto dto) {
        PassengerEntity existing = getPassengerById(id);
        existing.setFullName(dto.getFullName());
        existing.setAge(dto.getAge());
        existing.setGender(dto.getGender());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setIdProofType(dto.getIdProofType());
        existing.setIdProofNumber(dto.getIdProofNumber());
        return passengerRepository.save(existing);
    }

    @Override
    @Transactional
    public void deletePassenger(Long id) {
        PassengerEntity existing = getPassengerById(id);
        passengerRepository.delete(existing);
    }
}
