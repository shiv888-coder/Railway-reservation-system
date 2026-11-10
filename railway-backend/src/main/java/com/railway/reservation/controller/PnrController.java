package com.railway.reservation.controller;

import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.ReservationService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

/**
 * Controller for 10-Digit PNR Status Enquiry and Live Verification.
 */
@Controller
@RequestMapping("/pnr-enquiry")
public class PnrController {

    private final ReservationService reservationService;

    public PnrController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public String showPnrEnquiry(
            @RequestParam(required = false) String pnr,
            Model model) {

        model.addAttribute("searchedPnr", pnr);

        if (pnr != null && !pnr.trim().isEmpty()) {
            String cleanPnr = pnr.trim();
            if (!reservationService.isValidPnr(cleanPnr)) {
                model.addAttribute("errorMessage", "Invalid PNR format. PNR must be an authentic 10-digit numeric code.");
                return "pnr/enquiry";
            }

            Optional<Reservation> reservationOpt = reservationService.getReservationByPnr(cleanPnr);
            if (reservationOpt.isPresent()) {
                model.addAttribute("reservation", reservationOpt.get());
            } else {
                model.addAttribute("errorMessage", "No active reservation found for PNR: " + cleanPnr + ". Please verify and try again.");
            }
        }

        return "pnr/enquiry";
    }
}
