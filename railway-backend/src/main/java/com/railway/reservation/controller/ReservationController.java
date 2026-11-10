package com.railway.reservation.controller;

import com.railway.reservation.model.Reservation;
import com.railway.reservation.model.Station;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.ReservationService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller for Booking History and Official Printable E-Ticket View.
 */
@Controller
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final TrainSearchService trainSearchService;
    private final StationService stationService;

    public ReservationController(ReservationService reservationService,
                                 TrainSearchService trainSearchService,
                                 StationService stationService) {
        this.reservationService = reservationService;
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
    }

    @GetMapping
    public String listReservations(
            @RequestParam(required = false) String status,
            Model model) {

        List<Reservation> reservations = reservationService.getAllReservations();
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            reservations = reservations.stream()
                    .filter(r -> r.getBookingStatus().name().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        model.addAttribute("reservations", reservations);
        model.addAttribute("selectedStatus", status);
        model.addAttribute("totalReservations", reservationService.getTotalReservationsCount());
        model.addAttribute("totalRevenue", reservationService.getTotalRevenue());

        return "reservations/history";
    }

    @GetMapping("/{pnr}")
    public String showTicketDetails(@PathVariable String pnr, Model model) {
        if (!reservationService.isValidPnr(pnr)) {
            model.addAttribute("errorMessage", "Invalid PNR: " + pnr);
            return "error/404";
        }

        Optional<Reservation> resOpt = reservationService.getReservationByPnr(pnr);
        if (resOpt.isEmpty()) {
            model.addAttribute("errorMessage", "Reservation not found for PNR: " + pnr);
            return "error/404";
        }

        Reservation res = resOpt.get();
        Train train = null;
        try {
            train = trainSearchService.getTrainByNumber(res.getTrainNumber());
        } catch (Exception ignored) {
        }

        Station srcStation = null;
        Station dstStation = null;
        try {
            srcStation = stationService.getStationByCode(res.getSourceStationCode());
            dstStation = stationService.getStationByCode(res.getDestinationStationCode());
        } catch (Exception ignored) {
        }

        model.addAttribute("reservation", res);
        model.addAttribute("train", train);
        model.addAttribute("sourceStation", srcStation);
        model.addAttribute("destinationStation", dstStation);

        return "reservations/ticket";
    }
}
