package com.railway.reservation.controller;

import com.railway.reservation.model.Station;
import com.railway.reservation.service.StationService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for Indian Railway Station Exploration and Directory.
 */
@Controller
@RequestMapping("/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public String listStations(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String zone,
            Model model) {

        List<Station> stations;
        if (query != null && !query.trim().isEmpty()) {
            stations = stationService.searchStations(query.trim());
        } else {
            stations = stationService.getAllStations();
        }

        if (zone != null && !zone.trim().isEmpty()) {
            stations = stations.stream()
                    .filter(s -> s.getZone() != null && s.getZone().equalsIgnoreCase(zone.trim()))
                    .collect(Collectors.toList());
        }

        List<String> distinctZones = stationService.getAllStations().stream()
                .map(Station::getZone)
                .filter(z -> z != null && !z.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        model.addAttribute("stations", stations);
        model.addAttribute("totalCount", stations.size());
        model.addAttribute("allZones", distinctZones);
        model.addAttribute("selectedQuery", query);
        model.addAttribute("selectedZone", zone);

        return "stations/list";
    }
}
