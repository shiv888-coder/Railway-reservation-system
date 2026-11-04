package com.railway.reservation.service.impl;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.RouteHaltEntity;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.exception.ResourceNotFoundException;
import com.railway.reservation.repository.RouteHaltRepository;
import com.railway.reservation.repository.StationRepository;
import com.railway.reservation.repository.TrainRepository;
import com.railway.reservation.repository.TrainSeatRepository;
import com.railway.reservation.service.TrainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Concrete implementation of TrainService.
 *
 * OOP Concept: Encapsulation & Separation of Concerns
 * - Interacts with JPA repositories using Spring dependency injection via constructor.
 */
@Service
@Transactional(readOnly = true)
public class TrainServiceImpl implements TrainService {

    private final TrainRepository trainRepository;
    private final StationRepository stationRepository;
    private final RouteHaltRepository routeHaltRepository;
    private final TrainSeatRepository trainSeatRepository;

    /**
     * Parameterized Constructor Injection (Spring Best Practice - avoids field injection)
     */
    public TrainServiceImpl(TrainRepository trainRepository,
                            StationRepository stationRepository,
                            RouteHaltRepository routeHaltRepository,
                            TrainSeatRepository trainSeatRepository) {
        this.trainRepository = trainRepository;
        this.stationRepository = stationRepository;
        this.routeHaltRepository = routeHaltRepository;
        this.trainSeatRepository = trainSeatRepository;
    }

    @Override
    public List<BaseTrainEntity> searchTrains(String sourceStationCode, String destinationStationCode) {
        String src = sourceStationCode != null ? sourceStationCode.trim().toUpperCase() : "";
        String dest = destinationStationCode != null ? destinationStationCode.trim().toUpperCase() : "";

        if (src.isEmpty() && dest.isEmpty()) {
            return trainRepository.findAll();
        }

        List<BaseTrainEntity> allTrains = trainRepository.findAll();
        return allTrains.stream().filter(train -> {
            List<RouteHaltEntity> halts = train.getHalts();
            if (halts == null || halts.isEmpty()) {
                boolean sMatch = src.isEmpty() || (train.getSourceStation() != null && train.getSourceStation().getStationCode().equalsIgnoreCase(src));
                boolean dMatch = dest.isEmpty() || (train.getDestinationStation() != null && train.getDestinationStation().getStationCode().equalsIgnoreCase(dest));
                return sMatch && dMatch;
            }

            if (!src.isEmpty() && !dest.isEmpty()) {
                int srcSeq = -1;
                int destSeq = -1;
                for (RouteHaltEntity h : halts) {
                    if (h.getStation() != null && h.getStation().getStationCode().equalsIgnoreCase(src)) {
                        srcSeq = h.getStopSequence();
                    }
                    if (h.getStation() != null && h.getStation().getStationCode().equalsIgnoreCase(dest)) {
                        destSeq = h.getStopSequence();
                    }
                }
                return srcSeq != -1 && destSeq != -1 && srcSeq < destSeq;
            } else if (!src.isEmpty()) {
                int maxSeq = halts.stream().mapToInt(RouteHaltEntity::getStopSequence).max().orElse(Integer.MAX_VALUE);
                return halts.stream().anyMatch(h -> h.getStation() != null && h.getStation().getStationCode().equalsIgnoreCase(src) && h.getStopSequence() < maxSeq);
            } else {
                int minSeq = halts.stream().mapToInt(RouteHaltEntity::getStopSequence).min().orElse(0);
                return halts.stream().anyMatch(h -> h.getStation() != null && h.getStation().getStationCode().equalsIgnoreCase(dest) && h.getStopSequence() > minSeq);
            }
        }).toList();
    }

    @Override
    public BaseTrainEntity getTrainByNumber(String trainNumber) {
        if (trainNumber == null || trainNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Train number cannot be null or empty.");
        }

        return trainRepository.findByTrainNumber(trainNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Train", "trainNumber", trainNumber));
    }

    @Override
    public List<RouteHaltEntity> getRouteHalts(String trainNumber) {
        // First verify that the train exists
        if (!trainRepository.existsByTrainNumber(trainNumber)) {
            throw new ResourceNotFoundException("Train", "trainNumber", trainNumber);
        }

        return routeHaltRepository.findByTrain_TrainNumberOrderByStopSequenceAsc(trainNumber.trim());
    }

    @Override
    public int getAvailableSeats(String trainNumber, CoachClass coachClass) {
        return trainSeatRepository.findAvailableSeats(trainNumber.trim(), coachClass)
                .orElse(0);
    }

    @Override
    public List<BaseTrainEntity> getAllTrains() {
        return trainRepository.findAll();
    }

    @Override
    public List<com.railway.reservation.entity.StationEntity> getAllStations() {
        return stationRepository.findAll();
    }

    @Override
    public com.railway.reservation.entity.StationEntity getStationByCode(String stationCode) {
        if (stationCode == null || stationCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Station code cannot be null or empty.");
        }
        return stationRepository.findByStationCode(stationCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Station", "stationCode", stationCode));
    }
}
