package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing an official Railway Cancellation and Refund Audit Voucher.
 *
 * OOP Concept: Encapsulation & Domain Financial Ledger
 * - Records cancellation penalties, refunded sums, reasons, and tracking reference IDs.
 */
@Entity
@Table(name = "cancellation_slips")
public class CancellationSlipEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slip_id")
    private Long slipId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pnr", nullable = false, unique = true)
    @JsonBackReference(value = "reservation-cancellation")
    private ReservationEntity reservation;

    @Column(name = "cancelled_at", nullable = false)
    private LocalDateTime cancelledAt = LocalDateTime.now();

    @Column(name = "cancellation_fee", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Cancellation fee cannot be negative")
    private BigDecimal cancellationFee;

    @Column(name = "refund_amount", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Refund amount cannot be negative")
    private BigDecimal refundAmount;

    @Column(name = "cancellation_reason", length = 255, nullable = false)
    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;

    @Column(name = "refund_reference_id", length = 40, nullable = false, unique = true)
    private String refundReferenceId;

    public CancellationSlipEntity() {
    }

    public CancellationSlipEntity(ReservationEntity reservation, BigDecimal cancellationFee,
                                  BigDecimal refundAmount, String cancellationReason) {
        this.reservation = reservation;
        this.cancellationFee = cancellationFee;
        this.refundAmount = refundAmount;
        this.cancellationReason = cancellationReason;
        this.cancelledAt = LocalDateTime.now();
        this.refundReferenceId = "REF-" + Math.abs(UUID.randomUUID().getMostSignificantBits()).toString().substring(0, 10);
    }

    // --- Getters & Setters ---

    public Long getSlipId() {
        return slipId;
    }

    public void setSlipId(Long slipId) {
        this.slipId = slipId;
    }

    @JsonProperty("pnr")
    public String getPnr() {
        return reservation != null ? reservation.getPnr() : null;
    }

    public ReservationEntity getReservation() {
        return reservation;
    }

    public void setReservation(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public BigDecimal getCancellationFee() {
        return cancellationFee;
    }

    public void setCancellationFee(BigDecimal cancellationFee) {
        this.cancellationFee = cancellationFee;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getRefundReferenceId() {
        return refundReferenceId;
    }

    public void setRefundReferenceId(String refundReferenceId) {
        this.refundReferenceId = refundReferenceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CancellationSlipEntity that = (CancellationSlipEntity) o;
        return Objects.equals(slipId, that.slipId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(slipId);
    }
}
