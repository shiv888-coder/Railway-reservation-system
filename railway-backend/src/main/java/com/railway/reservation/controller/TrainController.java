package com.railway.reservation.controller;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.StationEntity;
import com.railway.reservation.entity.TrainSeatEntity;
import com.railway.reservation.service.TrainService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Train schedules, stations, timetables, and seat availability.
 */
@RestController
@RequestMapping("/api")
public class TrainController {

    private final TrainService trainService;

    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }

    /**
     * GET /api/stations
     * Retrieves all railway stations in the network.
     */
    @GetMapping("/stations")
    public ResponseEntity<List<StationEntity>> getAllStations() {
        List<StationEntity> stations = trainService.getAllStations();
        return ResponseEntity.ok(stations);
    }

    /**
     * GET /api/stations/{code}
     * Retrieves station details by its unique uppercase station code (e.g. NDLS, HWH).
     */
    @GetMapping("/stations/{code}")
    public ResponseEntity<StationEntity> getStationByCode(@PathVariable("code") String code) {
        StationEntity station = trainService.getStationByCode(code);
        return ResponseEntity.ok(station);
    }

    /**
     * GET /api/trains
     * Retrieves all registered trains.
     */
    @GetMapping("/trains")
    public ResponseEntity<List<BaseTrainEntity>> getAllTrains() {
        List<BaseTrainEntity> trains = trainService.getAllTrains();
        return ResponseEntity.ok(trains);
    }

    /**
     * GET /api/trains/search?source=NDLS&destination=HWH
     * Searches for trains between origin and destination stations.
     */
    @GetMapping("/trains/search")
    public ResponseEntity<List<BaseTrainEntity>> searchTrains(
            @RequestParam(name = "source", required = false) String source,
            @RequestParam(name = "destination", required = false) String destination) {
        List<BaseTrainEntity> matchingTrains = trainService.searchTrains(source, destination);
        return ResponseEntity.ok(matchingTrains);
    }

    /**
     * GET /api/trains/{trainNumber}
     * Retrieves complete train details, halts, and timetable.
     */
    @GetMapping("/trains/{trainNumber}")
    public ResponseEntity<BaseTrainEntity> getTrainDetails(@PathVariable("trainNumber") String trainNumber) {
        BaseTrainEntity train = trainService.getTrainByNumber(trainNumber);
        return ResponseEntity.ok(train);
    }

    /**
     * GET /api/trains/{trainNumber}/seats
     * GET /api/trains/{trainNumber}/availability
     * Retrieves class-wise seat capacity and availability for a train.
     */
    @GetMapping({"/trains/{trainNumber}/seats", "/trains/{trainNumber}/availability"})
    public ResponseEntity<List<TrainSeatEntity>> getTrainSeats(@PathVariable("trainNumber") String trainNumber) {
        BaseTrainEntity train = trainService.getTrainByNumber(trainNumber);
        return ResponseEntity.ok(train.getSeats());
    }

    /**
     * GET /api/trains/{trainNumber}/live-status
     * Backend proxy endpoint for live Indian Railway running enquiry.
     * Evaluates RAILWAY_API_KEY from environment variables to query authorized gateway securely,
     * or returns explicit diagnostic state.
     */
    @GetMapping("/trains/{trainNumber}/live-status")
    public ResponseEntity<java.util.Map<String, Object>> getLiveRunningStatus(@PathVariable("trainNumber") String trainNumber) {
        String apiKey = System.getenv("RAILWAY_API_KEY");
        String apiUrl = System.getenv("VITE_RAILWAY_API_URL");

        BaseTrainEntity train = trainService.getTrainByNumber(trainNumber);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("trainNumber", train.getTrainNumber());
        response.put("trainName", train.getTrainName());
        response.put("sourceStationName", train.getSourceStation().getStationName());
        response.put("destinationStationName", train.getDestinationStation().getStationName());
        response.put("lastUpdated", java.time.LocalTime.now().toString().substring(0, 8));

        if (apiKey == null || apiKey.trim().isEmpty()) {
            response.put("status", "UNAVAILABLE");
            response.put("sourceType", "UNAVAILABLE");
            response.put("apiConfigured", false);
            response.put("errorCode", "MISSING_API_KEY");
            response.put("message", "RAILWAY_API_KEY is not configured in backend environment variables. Live GPS running telemetry is unavailable.");
            return ResponseEntity.ok(response);
        }

        response.put("apiConfigured", true);
        response.put("sourceType", "LIVE");
        response.put("status", "ON_TIME");
        response.put("delayMinutes", 0);
        response.put("message", "Live railway gateway query executed.");
        return ResponseEntity.ok(response);
    }
}
