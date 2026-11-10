package com.railway.reservation.controller;

import com.railway.reservation.dto.BookingForm;
import com.railway.reservation.dto.BookingRequest;
import com.railway.reservation.dto.BookingResult;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.model.Station;
import com.railway.reservation.model.Train;
import com.railway.reservation.service.BookingService;
import com.railway.reservation.service.SeatAvailabilityService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for Ticket Booking flow and ACID transaction processing.
 */
@Controller
@RequestMapping("/booking")
public class BookingController {

    private final BookingService bookingService;
    private final TrainSearchService trainSearchService;
    private final StationService stationService;
    private final SeatAvailabilityService seatAvailabilityService;

    public BookingController(BookingService bookingService,
                             TrainSearchService trainSearchService,
                             StationService stationService,
                             SeatAvailabilityService seatAvailabilityService) {
        this.bookingService = bookingService;
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
        this.seatAvailabilityService = seatAvailabilityService;
    }

    @GetMapping
    public String showBookingPage(
            @RequestParam(required = false) String trainNumber,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String coachClass,
            @RequestParam(required = false, defaultValue = "1") int passengerCount,
            Model model) {

        BookingForm form = new BookingForm();
        if (trainNumber != null && !trainNumber.trim().isEmpty()) {
            form.setTrainNumber(trainNumber.trim());
        }
        if (source != null && !source.trim().isEmpty()) {
            form.setSourceStationCode(source.trim().toUpperCase());
        }
        if (destination != null && !destination.trim().isEmpty()) {
            form.setDestinationStationCode(destination.trim().toUpperCase());
        }
        if (date != null && !date.trim().isEmpty()) {
            form.setJourneyDate(date.trim());
        } else {
            form.setJourneyDate(LocalDate.now().plusDays(2).toString());
        }
        if (coachClass != null && !coachClass.trim().isEmpty()) {
            form.setCoachClass(CoachClass.fromCode(coachClass.trim()));
        }

        // Setup requested number of passenger rows (1 to 6)
        int paxCount = Math.min(Math.max(1, passengerCount), 6);
        form.getPassengers().clear();
        for (int i = 0; i < paxCount; i++) {
            form.getPassengers().add(new BookingForm.PassengerItem());
        }

        populateModelAttributes(model);
        model.addAttribute("bookingForm", form);
        return "booking/form";
    }

    @PostMapping("/submit")
    public String submitBooking(@ModelAttribute("bookingForm") BookingForm form,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        try {
            BookingRequest req = form.toBookingRequest();
            BookingResult result = bookingService.bookTicket(req);

            redirectAttributes.addFlashAttribute("successMessage",
                    "Ticket successfully booked! PNR: " + result.getPnr());
            return "redirect:/reservations/" + result.getPnr();
        } catch (Exception e) {
            model.addAttribute("errorMessage", e.getMessage());
            model.addAttribute("bookingForm", form);
            populateModelAttributes(model);
            return "booking/form";
        }
    }

    private void populateModelAttributes(Model model) {
        List<Train> trains = trainSearchService.getAllTrains();
        List<Station> stations = stationService.getAllStations();
        model.addAttribute("allTrains", trains);
        model.addAttribute("allStations", stations);
        model.addAttribute("coachClasses", CoachClass.values());
        model.addAttribute("genders", Gender.values());
        model.addAttribute("idProofTypes", IdProofType.values());
    }
}
