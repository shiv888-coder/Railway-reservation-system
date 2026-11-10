package com.railway.reservation.service;

import com.railway.reservation.dto.CancellationResult;
import com.railway.reservation.model.CancellationSlip;

import java.util.List;

/**
 * Service interface for ticket cancellation and refund processing.
 */
public interface CancellationService {

    /**
     * Cancels a confirmed ticket by PNR, calculates refunds, restores seats,
     * and logs the cancellation slip.
     */
    CancellationResult cancelTicket(String pnr, String reason);

    CancellationSlip getCancellationSlip(String pnr);

    List<CancellationSlip> getAllCancellations();
}
