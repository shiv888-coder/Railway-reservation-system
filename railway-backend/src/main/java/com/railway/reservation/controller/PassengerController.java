package com.railway.reservation.controller;

import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.model.Passenger;
import com.railway.reservation.service.PassengerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for Passenger Management, Demographic Policies, and Traveler Directory.
 */
@Controller
@RequestMapping("/passengers")
public class PassengerController {

    private final PassengerService passengerService;

    public PassengerController(PassengerService passengerService) {
        this.passengerService = passengerService;
    }

    @GetMapping
    public String showPassengerManagement(
            @RequestParam(required = false) String search,
            Model model) {

        List<Passenger> passengers = passengerService.getAllPassengers();
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            passengers = passengers.stream()
                    .filter(p -> (p.getFullName() != null && p.getFullName().toLowerCase().contains(q)) ||
                                 (p.getPhone() != null && p.getPhone().contains(q)) ||
                                 (p.getIdProofNumber() != null && p.getIdProofNumber().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        long seniorCount = passengers.stream().filter(Passenger::isSeniorCitizen).count();

        model.addAttribute("passengers", passengers);
        model.addAttribute("totalPassengers", passengers.size());
        model.addAttribute("seniorCount", seniorCount);
        model.addAttribute("searchQuery", search);
        model.addAttribute("idProofTypes", IdProofType.values());
        model.addAttribute("genders", Gender.values());

        return "passengers/list";
    }
}
