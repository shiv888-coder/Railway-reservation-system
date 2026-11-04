package com.railway.reservation.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Response DTO for GET /api/dashboard/stats
 */
public class DashboardStatsDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private long totalTrains;
    private long totalBookings;
    private long availableSeats;
    private long cancelledTickets;
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalTrains, long totalBookings, long availableSeats, long cancelledTickets, BigDecimal totalRevenue) {
        this.totalTrains = totalTrains;
        this.totalBookings = totalBookings;
        this.availableSeats = availableSeats;
        this.cancelledTickets = cancelledTickets;
        this.totalRevenue = totalRevenue != null ? totalRevenue : BigDecimal.ZERO;
    }

    public long getTotalTrains() {
        return totalTrains;
    }

    public void setTotalTrains(long totalTrains) {
        this.totalTrains = totalTrains;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(long availableSeats) {
        this.availableSeats = availableSeats;
    }

    public long getCancelledTickets() {
        return cancelledTickets;
    }

    public void setCancelledTickets(long cancelledTickets) {
        this.cancelledTickets = cancelledTickets;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
}
