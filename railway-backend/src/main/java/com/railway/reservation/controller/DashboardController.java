package com.railway.reservation.controller;

import com.railway.reservation.enums.TrainType;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.ReservationService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for the Main Indian Railways Dashboard.
 */
@Controller
public class DashboardController {

    private final TrainSearchService trainSearchService;
    private final StationService stationService;
    private final ReservationService reservationService;

    public DashboardController(TrainSearchService trainSearchService,
                               StationService stationService,
                               ReservationService reservationService) {
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
        this.reservationService = reservationService;
    }

    @GetMapping({"/", "/dashboard"})
    public String showDashboard(Model model) {
        List<Train> allTrains = trainSearchService.getAllTrains();
        int totalStations = stationService.getTotalStationsCount();
        int totalReservations = reservationService.getTotalReservationsCount();
        double totalRevenue = reservationService.getTotalRevenue();

        // Featured Premier Trains: Rajdhani & Vande Bharat Express
        List<Train> featuredTrains = allTrains.stream()
                .filter(t -> t.getTrainType() == TrainType.RAJDHANI || t.getTrainType() == TrainType.VANDE_BHARAT)
                .limit(6)
                .collect(Collectors.toList());

        model.addAttribute("totalTrains", allTrains.size());
        model.addAttribute("totalStations", totalStations);
        model.addAttribute("totalReservations", totalReservations);
        model.addAttribute("totalRevenue", totalRevenue);
        model.addAttribute("featuredTrains", featuredTrains);
        model.addAttribute("stations", stationService.getAllStations());

        return "dashboard";
    }
}
