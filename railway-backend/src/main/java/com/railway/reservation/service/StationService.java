package com.railway.reservation.service;

import com.railway.reservation.model.Station;

import java.util.List;

/**
 * Service interface for Indian Railway Station lookup and directory management.
 */
public interface StationService {

    List<Station> getAllStations();

    Station getStationByCode(String stationCode);

    List<Station> searchStations(String query);

    boolean addStation(Station station);

    int getTotalStationsCount();
}
