package com.railway.reservation;

import com.railway.reservation.dto.BookingForm;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.model.AdminUser;
import com.railway.reservation.model.Reservation;
import com.railway.reservation.service.BookingService;
import com.railway.reservation.service.ReservationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Stage 4 Automated Verification Test Suite.
 * Validates Spring Boot Web MVC controllers, Thymeleaf views, HTTP routing,
 * and end-to-end integration across all 13 required pages.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class Stage4WebInterfaceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReservationService reservationService;

    private static String testPnr;

    @Test
    @Order(1)
    @DisplayName("Page 1: Home Dashboard (GET / and /dashboard)")
    void testDashboardPage() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"))
                .andExpect(model().attribute("totalTrains", is(38)))
                .andExpect(model().attribute("totalStations", is(367)))
                .andExpect(model().attributeExists("featuredTrains"));

        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"));
    }

    @Test
    @Order(2)
    @DisplayName("Page 2: Search Trains (GET /trains/search)")
    void testTrainSearchPage() throws Exception {
        // Initial search page
        mockMvc.perform(get("/trains/search"))
                .andExpect(status().isOk())
                .andExpect(view().name("trains/search"))
                .andExpect(model().attribute("trains", hasSize(38)))
                .andExpect(model().attribute("hasSearched", is(false)));

        // Filtered search query (Howrah to New Delhi)
        mockMvc.perform(get("/trains/search")
                        .param("source", "HWH")
                        .param("destination", "NDLS"))
                .andExpect(status().isOk())
                .andExpect(view().name("trains/search"))
                .andExpect(model().attribute("hasSearched", is(true)))
                .andExpect(model().attribute("trains", not(empty())));
    }

    @Test
    @Order(3)
    @DisplayName("Page 3: Train Details and Complete Route (GET /trains/{trainNumber})")
    void testTrainDetailsPage() throws Exception {
        mockMvc.perform(get("/trains/12301"))
                .andExpect(status().isOk())
                .andExpect(view().name("trains/details"))
                .andExpect(model().attributeExists("train"))
                .andExpect(model().attributeExists("routes"))
                .andExpect(model().attributeExists("seatMatrix"));
    }

    @Test
    @Order(4)
    @DisplayName("Page 4: Station Directory & Search (GET /stations)")
    void testStationSearchPage() throws Exception {
        mockMvc.perform(get("/stations"))
                .andExpect(status().isOk())
                .andExpect(view().name("stations/list"))
                .andExpect(model().attribute("totalCount", is(367)))
                .andExpect(model().attribute("stations", hasSize(367)));

        // Search with query "Naihati"
        mockMvc.perform(get("/stations").param("query", "Naihati"))
                .andExpect(status().isOk())
                .andExpect(view().name("stations/list"))
                .andExpect(model().attribute("stations", not(empty())));
    }

    @Test
    @Order(5)
    @DisplayName("Page 5: Passenger Management (GET /passengers)")
    void testPassengerManagementPage() throws Exception {
        mockMvc.perform(get("/passengers"))
                .andExpect(status().isOk())
                .andExpect(view().name("passengers/list"))
                .andExpect(model().attributeExists("passengers"))
                .andExpect(model().attributeExists("idProofTypes"));
    }

    @Test
    @Order(6)
    @DisplayName("Page 6: Ticket Booking Form & Submission (GET /booking, POST /booking/submit)")
    void testTicketBookingFlow() throws Exception {
        // GET Booking Form
        mockMvc.perform(get("/booking")
                        .param("trainNumber", "12301")
                        .param("source", "HWH")
                        .param("destination", "NDLS"))
                .andExpect(status().isOk())
                .andExpect(view().name("booking/form"))
                .andExpect(model().attributeExists("bookingForm"));

        // POST Booking Submission with 1 passenger
        mockMvc.perform(post("/booking/submit")
                        .param("trainNumber", "12301")
                        .param("sourceStationCode", "HWH")
                        .param("destinationStationCode", "NDLS")
                        .param("journeyDate", "2026-11-25")
                        .param("coachClass", "THIRD_AC")
                        .param("passengers[0].fullName", "Shiv Shankar Mal")
                        .param("passengers[0].age", "21")
                        .param("passengers[0].gender", "MALE")
                        .param("passengers[0].phone", "9876543210")
                        .param("passengers[0].idProofType", "AADHAAR")
                        .param("passengers[0].idProofNumber", "123456789012"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("/reservations/*"));

        // Save generated PNR for downstream ticket and cancellation tests
        List<Reservation> all = reservationService.getAllReservations();
        assertFalse(all.isEmpty());
        testPnr = all.get(0).getPnr();
        assertNotNull(testPnr);
    }

    @Test
    @Order(7)
    @DisplayName("Page 7: Fare Details Calculator (GET /fare-enquiry)")
    void testFareEnquiryPage() throws Exception {
        mockMvc.perform(get("/fare-enquiry")
                        .param("trainNumber", "12301")
                        .param("coachClass", "3A")
                        .param("adults", "1")
                        .param("seniors", "1"))
                .andExpect(status().isOk())
                .andExpect(view().name("fare/enquiry"))
                .andExpect(model().attributeExists("fareBreakdown"))
                .andExpect(model().attribute("fareBreakdown", hasProperty("seniorCitizenCount", is(1))));
    }

    @Test
    @Order(8)
    @DisplayName("Page 8: PNR Status Enquiry (GET /pnr-enquiry)")
    void testPnrEnquiryPage() throws Exception {
        assertNotNull(testPnr);
        mockMvc.perform(get("/pnr-enquiry").param("pnr", testPnr))
                .andExpect(status().isOk())
                .andExpect(view().name("pnr/enquiry"))
                .andExpect(model().attributeExists("reservation"))
                .andExpect(model().attribute("reservation", hasProperty("pnr", is(testPnr))));
    }

    @Test
    @Order(9)
    @DisplayName("Page 9: Reservation Details & Printable Ticket (GET /reservations/{pnr})")
    void testPrintableTicketPage() throws Exception {
        assertNotNull(testPnr);
        mockMvc.perform(get("/reservations/" + testPnr))
                .andExpect(status().isOk())
                .andExpect(view().name("reservations/ticket"))
                .andExpect(model().attributeExists("reservation"))
                .andExpect(model().attributeExists("train"));
    }

    @Test
    @Order(10)
    @DisplayName("Page 12: Booking History (GET /reservations)")
    void testBookingHistoryPage() throws Exception {
        mockMvc.perform(get("/reservations"))
                .andExpect(status().isOk())
                .andExpect(view().name("reservations/history"))
                .andExpect(model().attribute("reservations", not(empty())));
    }

    @Test
    @Order(11)
    @DisplayName("Page 10: Ticket Cancellation Form & Preview (GET /cancellation)")
    void testCancellationFormPage() throws Exception {
        assertNotNull(testPnr);
        mockMvc.perform(get("/cancellation").param("pnr", testPnr))
                .andExpect(status().isOk())
                .andExpect(view().name("cancellation/form"))
                .andExpect(model().attributeExists("reservation"))
                .andExpect(model().attributeExists("refundEstimate"))
                .andExpect(model().attributeExists("feeEstimate"));
    }

    @Test
    @Order(12)
    @DisplayName("Page 11: Cancellation Execution & Refund Voucher (POST /cancellation/submit, GET /cancellations/{pnr})")
    void testCancellationExecutionFlow() throws Exception {
        assertNotNull(testPnr);

        // Submit cancellation
        mockMvc.perform(post("/cancellation/submit")
                        .param("pnr", testPnr)
                        .param("reason", "Change of travel plan"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/cancellations/" + testPnr));

        // GET Cancellation Slip
        mockMvc.perform(get("/cancellations/" + testPnr))
                .andExpect(status().isOk())
                .andExpect(view().name("cancellation/slip"))
                .andExpect(model().attributeExists("slip"))
                .andExpect(model().attribute("slip", hasProperty("pnr", is(testPnr))))
                .andExpect(model().attribute("slip", hasProperty("refundReferenceId", startsWith("REF-"))));
    }

    @Test
    @Order(13)
    @DisplayName("Page 13: Admin Login & Dashboard (GET /admin/login, POST /admin/authenticate, GET /admin/dashboard)")
    void testAdminWorkflow() throws Exception {
        // GET Login Page
        mockMvc.perform(get("/admin/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/login"));

        // POST Authenticate with valid credentials
        mockMvc.perform(post("/admin/authenticate")
                        .param("username", "admin")
                        .param("password", "admin123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));

        // GET Dashboard with mock session
        AdminUser admin = new AdminUser(1, "admin", "hash", "System Administrator", "ADMIN", true, "2026-11-10 10:00:00");
        mockMvc.perform(get("/admin/dashboard").sessionAttr("adminUser", admin))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/dashboard"))
                .andExpect(model().attribute("totalTrains", is(38)))
                .andExpect(model().attribute("totalStations", is(367)))
                .andExpect(model().attributeExists("totalRevenue"));
    }
}
