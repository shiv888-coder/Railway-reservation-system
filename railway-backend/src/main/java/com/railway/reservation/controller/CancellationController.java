package com.railway.reservation.controller;

import com.railway.reservation.dto.CancellationResult;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.model.CancellationSlip;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.CancellationService;
import com.railway.reservation.service.ReservationService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

/**
 * Controller for Ticket Cancellation, Refund Processing, and Cancellation Slips.
 */
@Controller
public class CancellationController {

    private final CancellationService cancellationService;
    private final ReservationService reservationService;

    public CancellationController(CancellationService cancellationService,
                                  ReservationService reservationService) {
        this.cancellationService = cancellationService;
        this.reservationService = reservationService;
    }

    @GetMapping("/cancellation")
    public String showCancellationForm(
            @RequestParam(required = false) String pnr,
            Model model) {

        model.addAttribute("searchedPnr", pnr);

        if (pnr != null && !pnr.trim().isEmpty()) {
            String cleanPnr = pnr.trim();
            if (!reservationService.isValidPnr(cleanPnr)) {
                model.addAttribute("errorMessage", "Invalid PNR format. PNR must be 10 digits.");
                return "cancellation/form";
            }

            Optional<Reservation> resOpt = reservationService.getReservationByPnr(cleanPnr);
            if (resOpt.isPresent()) {
                Reservation res = resOpt.get();
                if (res.getBookingStatus() == BookingStatus.CANCELLED) {
                    model.addAttribute("errorMessage", "This ticket has already been cancelled previously.");
                    model.addAttribute("alreadyCancelled", true);
                } else {
                    double refundEstimate = Math.round(res.getTotalFare() * 0.85 * 100.0) / 100.0;
                    double feeEstimate = Math.round(res.getTotalFare() * 0.15 * 100.0) / 100.0;
                    model.addAttribute("reservation", res);
                    model.addAttribute("refundEstimate", refundEstimate);
                    model.addAttribute("feeEstimate", feeEstimate);
                }
            } else {
                model.addAttribute("errorMessage", "No booking record found for PNR: " + cleanPnr);
            }
        }

        return "cancellation/form";
    }

    @PostMapping("/cancellation/submit")
    public String processCancellation(
            @RequestParam String pnr,
            @RequestParam(defaultValue = "Customer requested cancellation") String reason,
            RedirectAttributes redirectAttributes) {

        try {
            CancellationResult result = cancellationService.cancelTicket(pnr.trim(), reason);
            redirectAttributes.addFlashAttribute("successMessage", result.getMessage());
            return "redirect:/cancellations/" + pnr.trim();
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/cancellation?pnr=" + pnr.trim();
        }
    }

    @GetMapping("/cancellations/{pnr}")
    public String showCancellationSlip(@PathVariable String pnr, Model model) {
        try {
            CancellationSlip slip = cancellationService.getCancellationSlip(pnr.trim());
            Optional<Reservation> resOpt = reservationService.getReservationByPnr(pnr.trim());

            model.addAttribute("slip", slip);
            resOpt.ifPresent(reservation -> model.addAttribute("reservation", reservation));
            return "cancellation/slip";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Cancellation slip not found: " + e.getMessage());
            return "error/404";
        }
    }
}
