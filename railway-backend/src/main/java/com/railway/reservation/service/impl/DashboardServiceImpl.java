package com.railway.reservation.service.impl;

import com.railway.reservation.dto.DashboardStatsDto;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.repository.ReservationRepository;
import com.railway.reservation.repository.TrainRepository;
import com.railway.reservation.repository.TrainSeatRepository;
import com.railway.reservation.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Concrete implementation of DashboardService.
 */
@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final TrainRepository trainRepository;
    private final ReservationRepository reservationRepository;
    private final TrainSeatRepository trainSeatRepository;

    public DashboardServiceImpl(TrainRepository trainRepository,
                                ReservationRepository reservationRepository,
                                TrainSeatRepository trainSeatRepository) {
        this.trainRepository = trainRepository;
        this.reservationRepository = reservationRepository;
        this.trainSeatRepository = trainSeatRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalTrains = trainRepository.count();
        long totalBookings = reservationRepository.count();
        Long availableSeats = trainSeatRepository.sumTotalNetworkAvailableSeats();
        long cancelled = reservationRepository.countByBookingStatus(BookingStatus.CANCELLED);
        Double revenue = reservationRepository.calculateTotalRevenueByStatus(BookingStatus.CONFIRMED);

        BigDecimal totalRevenue = revenue != null
                ? BigDecimal.valueOf(revenue).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new DashboardStatsDto(
                totalTrains,
                totalBookings,
                availableSeats != null ? availableSeats : 0L,
                cancelled,
                totalRevenue
        );
    }
}
