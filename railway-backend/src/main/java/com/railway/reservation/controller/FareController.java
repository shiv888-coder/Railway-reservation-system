package com.railway.reservation.controller;

import com.railway.reservation.dto.FareBreakdown;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.model.Station;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.FareCalculationService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for Fare Enquiry & Official Railway Tariff Calculation.
 */
@Controller
@RequestMapping("/fare-enquiry")
public class FareController {

    private final FareCalculationService fareCalculationService;
    private final TrainSearchService trainSearchService;
    private final StationService stationService;

    public FareController(FareCalculationService fareCalculationService,
                          TrainSearchService trainSearchService,
                          StationService stationService) {
        this.fareCalculationService = fareCalculationService;
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
    }

    @GetMapping
    public String showFareCalculator(
            @RequestParam(required = false) String trainNumber,
            @RequestParam(required = false) String coachClass,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false, defaultValue = "1") int adults,
            @RequestParam(required = false, defaultValue = "0") int seniors,
            Model model) {

        List<Train> trains = trainSearchService.getAllTrains();
        List<Station> stations = stationService.getAllStations();

        model.addAttribute("trains", trains);
        model.addAttribute("stations", stations);
        model.addAttribute("coachClasses", CoachClass.values());
        model.addAttribute("selectedTrain", trainNumber);
        model.addAttribute("selectedClass", coachClass);
        model.addAttribute("selectedSource", source);
        model.addAttribute("selectedDestination", destination);
        model.addAttribute("adults", adults);
        model.addAttribute("seniors", seniors);

        if (trainNumber != null && !trainNumber.trim().isEmpty() && coachClass != null && !coachClass.trim().isEmpty()) {
            try {
                CoachClass cc = CoachClass.fromCode(coachClass.trim());
                List<Passenger> paxList = new ArrayList<>();

                int numAdults = Math.max(0, adults);
                for (int i = 0; i < numAdults; i++) {
                    paxList.add(new Passenger("Adult " + (i + 1), 30, Gender.MALE));
                }

                int numSeniors = Math.max(0, seniors);
                for (int i = 0; i < numSeniors; i++) {
                    paxList.add(new Passenger("Senior Citizen " + (i + 1), 65, Gender.FEMALE));
                }

                if (paxList.isEmpty()) {
                    paxList.add(new Passenger("Passenger 1", 30, Gender.MALE));
                }

                FareBreakdown breakdown = fareCalculationService.calculateFare(
                        trainNumber.trim(),
                        cc,
                        source,
                        destination,
                        paxList
                );

                model.addAttribute("fareBreakdown", breakdown);
                model.addAttribute("train", trainSearchService.getTrainByNumber(trainNumber.trim()));
            } catch (Exception e) {
                model.addAttribute("errorMessage", "Unable to calculate fare: " + e.getMessage());
            }
        }

        return "fare/enquiry";
    }
}
