package com.railway.reservation.controller;

import com.railway.reservation.dao.AdminUserDAO;
import com.railway.reservation.model.AdminUser;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.CancellationService;
import com.railway.reservation.service.ReservationService;
import com.railway.reservation.service.StationService;
import com.railway.reservation.service.TrainSearchService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * Controller for Admin Authentication and Administrative Overview Dashboard.
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    private final AdminUserDAO adminUserDAO;
    private final ReservationService reservationService;
    private final TrainSearchService trainSearchService;
    private final StationService stationService;
    private final CancellationService cancellationService;

    public AdminController(AdminUserDAO adminUserDAO,
                           ReservationService reservationService,
                           TrainSearchService trainSearchService,
                           StationService stationService,
                           CancellationService cancellationService) {
        this.adminUserDAO = adminUserDAO;
        this.reservationService = reservationService;
        this.trainSearchService = trainSearchService;
        this.stationService = stationService;
        this.cancellationService = cancellationService;
    }

    @GetMapping("/login")
    public String showLoginForm(HttpSession session) {
        if (session.getAttribute("adminUser") != null) {
            return "redirect:/admin/dashboard";
        }
        return "admin/login";
    }

    @PostMapping("/authenticate")
    public String authenticate(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        Optional<AdminUser> adminOpt = adminUserDAO.authenticate(username, password);
        if (adminOpt.isPresent()) {
            session.setAttribute("adminUser", adminOpt.get());
            return "redirect:/admin/dashboard";
        } else {
            redirectAttributes.addFlashAttribute("errorMessage", "Invalid administrative username or password.");
            return "redirect:/admin/login";
        }
    }

    @GetMapping("/dashboard")
    public String showAdminDashboard(HttpSession session, Model model) {
        AdminUser admin = (AdminUser) session.getAttribute("adminUser");
        if (admin == null) {
            return "redirect:/admin/login";
        }

        int totalTrains = trainSearchService.getAllTrains().size();
        int totalStations = stationService.getTotalStationsCount();
        int totalBookings = reservationService.getTotalReservationsCount();
        double totalRevenue = reservationService.getTotalRevenue();
        int totalCancellations = cancellationService.getAllCancellations().size();

        List<Reservation> recentReservations = reservationService.getAllReservations();
        if (recentReservations.size() > 10) {
            recentReservations = recentReservations.subList(0, 10);
        }

        model.addAttribute("adminUser", admin);
        model.addAttribute("totalTrains", totalTrains);
        model.addAttribute("totalStations", totalStations);
        model.addAttribute("totalBookings", totalBookings);
        model.addAttribute("totalRevenue", totalRevenue);
        model.addAttribute("totalCancellations", totalCancellations);
        model.addAttribute("recentReservations", recentReservations);

        return "admin/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        session.removeAttribute("adminUser");
        session.invalidate();
        redirectAttributes.addFlashAttribute("successMessage", "Logged out successfully.");
        return "redirect:/admin/login";
    }
}
