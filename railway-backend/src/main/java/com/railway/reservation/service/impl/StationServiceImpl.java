package com.railway.reservation.service.impl;

import com.railway.reservation.dao.StationDAO;
import com.railway.reservation.exception.InvalidStationException;
import com.railway.reservation.model.Station;
import com.railway.reservation.service.StationService;

import java.util.List;

/**
 * Service implementation for Station operations.
 */
public class StationServiceImpl implements StationService {

    private final StationDAO stationDAO;

    public StationServiceImpl() {
        this(new StationDAO());
    }

    public StationServiceImpl(StationDAO stationDAO) {
        this.stationDAO = stationDAO;
    }

    @Override
    public List<Station> getAllStations() {
        return stationDAO.findAll();
    }

    @Override
    public Station getStationByCode(String stationCode) {
        if (stationCode == null || stationCode.trim().isEmpty()) {
            throw new InvalidStationException("Station code cannot be null or empty.");
        }
        return stationDAO.findByCode(stationCode)
                .orElseThrow(() -> new InvalidStationException("Station not found with code: " + stationCode.toUpperCase()));
    }

    @Override
    public List<Station> searchStations(String query) {
        return stationDAO.searchStations(query);
    }

    @Override
    public boolean addStation(Station station) {
        if (station == null || station.getStationCode() == null || station.getStationCode().trim().isEmpty()) {
            throw new InvalidStationException("Station and station code must not be null.");
        }
        return stationDAO.insertStation(station);
    }

    @Override
    public int getTotalStationsCount() {
        return stationDAO.countStations();
    }
}
