package com.railway.reservation.service.impl;

import com.railway.reservation.dao.RouteDAO;
import com.railway.reservation.dao.SeatInventoryDAO;
import com.railway.reservation.dao.StationDAO;
import com.railway.reservation.dao.TrainDAO;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.exception.InvalidJourneyException;
import com.railway.reservation.exception.InvalidStationException;
import com.railway.reservation.exception.TrainNotFoundException;
import com.railway.reservation.model.Train;
import com.railway.reservation.model.TrainRoute;
import com.railway.reservation.model.TrainSchedule;
import com.railway.reservation.service.TrainSearchService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation for Train Search and Route queries.
 * Demonstrates Method Overloading across train search contracts.
 */
public class TrainSearchServiceImpl implements TrainSearchService {

    private final TrainDAO trainDAO;
    private final StationDAO stationDAO;
    private final RouteDAO routeDAO;
    private final SeatInventoryDAO inventoryDAO;

    public TrainSearchServiceImpl() {
        this(new TrainDAO(), new StationDAO(), new RouteDAO(), new SeatInventoryDAO());
    }

    public TrainSearchServiceImpl(TrainDAO trainDAO, StationDAO stationDAO, RouteDAO routeDAO, SeatInventoryDAO inventoryDAO) {
        this.trainDAO = trainDAO;
        this.stationDAO = stationDAO;
        this.routeDAO = routeDAO;
        this.inventoryDAO = inventoryDAO;
    }

    @Override
    public Train getTrainByNumber(String trainNumber) {
        if (trainNumber == null || trainNumber.trim().isEmpty()) {
            throw new TrainNotFoundException("Null or blank train number");
        }
        return trainDAO.findByNumber(trainNumber.trim())
                .orElseThrow(() -> new TrainNotFoundException(trainNumber.trim()));
    }

    @Override
    public List<Train> getAllTrains() {
        return trainDAO.findAll();
    }

    @Override
    public List<Train> searchTrains(String sourceStationCode, String destinationStationCode) {
        validateStationCodes(sourceStationCode, destinationStationCode);
        return trainDAO.searchTrainsBetweenStations(sourceStationCode.trim(), destinationStationCode.trim());
    }

    @Override
    public List<Train> searchTrains(String sourceStationCode, String destinationStationCode, String journeyDate) {
        List<Train> baseResults = searchTrains(sourceStationCode, destinationStationCode);
        if (journeyDate == null || journeyDate.trim().isEmpty()) {
            return baseResults;
        }

        String targetDay = extractDayAbbreviation(journeyDate.trim());
        if (targetDay == null) {
            return baseResults;
        }

        List<Train> filtered = new ArrayList<>();
        for (Train t : baseResults) {
            String days = t.getOperatingDays();
            if (days != null && (days.equalsIgnoreCase("Daily") || days.toLowerCase().contains(targetDay.toLowerCase()))) {
                filtered.add(t);
            }
        }
        return filtered;
    }

    @Override
    public List<Train> searchTrains(String sourceStationCode, String destinationStationCode, String journeyDate, CoachClass coachClass) {
        List<Train> dateFiltered = searchTrains(sourceStationCode, destinationStationCode, journeyDate);
        if (coachClass == null) {
            return dateFiltered;
        }

        List<Train> classFiltered = new ArrayList<>();
        for (Train t : dateFiltered) {
            int avail = inventoryDAO.getAvailableSeats(t.getTrainNumber(), coachClass);
            if (avail > 0) {
                classFiltered.add(t);
            }
        }
        return classFiltered;
    }

    @Override
    public List<TrainRoute> getTrainRoute(String trainNumber) {
        return routeDAO.getRoutesForTrain(trainNumber);
    }

    @Override
    public List<TrainSchedule> getTrainSchedule(String trainNumber) {
        return routeDAO.getSchedulesForTrain(trainNumber);
    }

    @Override
    public int calculateDistance(String trainNumber, String sourceStationCode, String destinationStationCode) {
        validateStationCodes(sourceStationCode, destinationStationCode);
        int dist = routeDAO.calculateDistanceBetweenStations(trainNumber, sourceStationCode, destinationStationCode);
        if (dist <= 0) {
            Train t = getTrainByNumber(trainNumber);
            dist = t.getDistanceKm();
        }
        return dist;
    }

    private void validateStationCodes(String src, String dst) {
        if (src == null || src.trim().isEmpty()) {
            throw new InvalidStationException("Source station code cannot be empty.");
        }
        if (dst == null || dst.trim().isEmpty()) {
            throw new InvalidStationException("Destination station code cannot be empty.");
        }
        String cleanSrc = src.trim().toUpperCase();
        String cleanDst = dst.trim().toUpperCase();

        if (cleanSrc.equals(cleanDst)) {
            throw new InvalidJourneyException("Source and destination stations cannot be identical (" + cleanSrc + ").");
        }
        if (stationDAO.findByCode(cleanSrc).isEmpty()) {
            throw new InvalidStationException("Source station code not found: " + cleanSrc);
        }
        if (stationDAO.findByCode(cleanDst).isEmpty()) {
            throw new InvalidStationException("Destination station code not found: " + cleanDst);
        }
    }

    private String extractDayAbbreviation(String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return switch (date.getDayOfWeek()) {
                case MONDAY -> "Mon";
                case TUESDAY -> "Tue";
                case WEDNESDAY -> "Wed";
                case THURSDAY -> "Thu";
                case FRIDAY -> "Fri";
                case SATURDAY -> "Sat";
                case SUNDAY -> "Sun";
            };
        } catch (Exception e) {
            return null;
        }
    }
}
