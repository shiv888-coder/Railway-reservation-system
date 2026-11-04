package com.railway.reservation.service;

import com.railway.reservation.dto.DashboardStatsDto;

/**
 * Service interface for operational railway dashboard KPIs and statistics.
 */
public interface DashboardService {

    DashboardStatsDto getDashboardStats();
}
