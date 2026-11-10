package com.railway.reservation.controller;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import com.railway.reservation.model.SeatInventory;
import com.railway.reservation.model.Station;
import com.railway.reservation.model.Train;
import com.railway.reservation.model.TrainRoute;
import com.railway.reservation.model.TrainSchedule;
import com.railway.reservation.service.SeatAvailabilityService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for Train Search and Detailed Timetable / Route inspection.
 */
@Controller
@RequestMapping("/trains")
public class TrainController {

    private final TrainSearchService trainSearchService;
    private final StationService stationService;
    private final SeatAvailabilityService seatAvailabilityService;

    public TrainController(TrainSearchService trainSearchService,
                           StationService stationService,
                           SeatAvailabilityService seatAvailabilityService) {
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
        this.seatAvailabilityService = seatAvailabilityService;
    }

    @GetMapping("/search")
    public String searchTrains(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String journeyDate,
            @RequestParam(required = false) String coachClass,
            @RequestParam(required = false) String trainType,
            Model model) {

        List<Station> allStations = stationService.getAllStations();
        model.addAttribute("stations", allStations);
        model.addAttribute("selectedSource", source);
        model.addAttribute("selectedDestination", destination);
        model.addAttribute("selectedDate", journeyDate);
        model.addAttribute("selectedClass", coachClass);
        model.addAttribute("selectedType", trainType);
        model.addAttribute("coachClasses", CoachClass.values());
        model.addAttribute("trainTypes", TrainType.values());

        List<Train> searchResults = new ArrayList<>();
        boolean hasSearched = false;

        if (source != null && !source.trim().isEmpty() && destination != null && !destination.trim().isEmpty()) {
            hasSearched = true;
            try {
                CoachClass cc = (coachClass != null && !coachClass.trim().isEmpty()) ? CoachClass.fromCode(coachClass.trim()) : null;
                List<Train> results;

                if (cc != null && journeyDate != null && !journeyDate.trim().isEmpty()) {
                    results = trainSearchService.searchTrains(source, destination, journeyDate, cc);
                } else if (journeyDate != null && !journeyDate.trim().isEmpty()) {
                    results = trainSearchService.searchTrains(source, destination, journeyDate);
                } else {
                    results = trainSearchService.searchTrains(source, destination);
                }

                if (trainType != null && !trainType.trim().isEmpty()) {
                    results = results.stream()
                            .filter(t -> t.getTrainType().name().equalsIgnoreCase(trainType.trim()) ||
                                         t.getCategoryName().equalsIgnoreCase(trainType.trim()))
                            .collect(Collectors.toList());
                }

                searchResults = results;
            } catch (Exception e) {
                model.addAttribute("errorMessage", e.getMessage());
            }
        } else {
            // Show all trains initially if no search query provided
            searchResults = trainSearchService.getAllTrains();
        }

        model.addAttribute("hasSearched", hasSearched);
        model.addAttribute("trains", searchResults);
        return "trains/search";
    }

    @GetMapping("/{trainNumber}")
    public String showTrainDetails(@PathVariable String trainNumber, Model model) {
        try {
            Train train = trainSearchService.getTrainByNumber(trainNumber);
            List<TrainRoute> routes = trainSearchService.getTrainRoute(trainNumber);
            List<TrainSchedule> schedules = trainSearchService.getTrainSchedule(trainNumber);
            List<SeatInventory> seatMatrix = seatAvailabilityService.getTrainSeatMatrix(trainNumber);

            Station srcStation = stationService.getStationByCode(train.getSourceStationCode());
            Station dstStation = stationService.getStationByCode(train.getDestinationStationCode());

            model.addAttribute("train", train);
            model.addAttribute("routes", routes);
            model.addAttribute("schedules", schedules);
            model.addAttribute("seatMatrix", seatMatrix);
            model.addAttribute("sourceStation", srcStation);
            model.addAttribute("destinationStation", dstStation);

            return "trains/details";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Train details not found for: " + trainNumber);
            return "error/404";
        }
    }
}
