package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.railway.reservation.enums.BookingStatus;
import com.railway.reservation.enums.CoachClass;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entity representing an official Railway Passenger Reservation Record (PNR Record).
 *
 * OOP Concept: Aggregate Root & Encapsulated Transaction State
 * - Encapsulates passenger seat allocations, financial fare breakdown, journey itinerary,
 *   and cancellation lifecycle status.
 */
@Entity
@Table(name = "reservations")
public class ReservationEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key: 10-digit Passenger Name Record (PNR) number.
     */
    @Id
    @Column(name = "pnr", length = 10, nullable = false, updatable = false)
    @NotBlank(message = "PNR is required")
    @Size(min = 10, max = 10, message = "PNR must be exactly 10 digits")
    private String pnr;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "train_number", nullable = false)
    @NotNull(message = "Train is required")
    private BaseTrainEntity train;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_station_code", nullable = false)
    @NotNull(message = "Source station is required")
    private StationEntity sourceStation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_station_code", nullable = false)
    @NotNull(message = "Destination station is required")
    private StationEntity destinationStation;

    @Column(name = "journey_date", nullable = false)
    @NotNull(message = "Journey date is required")
    private LocalDate journeyDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_class", length = 20, nullable = false)
    @NotNull(message = "Travel class is required")
    private CoachClass travelClass;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", length = 20, nullable = false)
    @NotNull(message = "Booking status is required")
    private BookingStatus bookingStatus = BookingStatus.CONFIRMED;

    // --- Financial Fare Breakdown (Using BigDecimal for precision) ---

    @Column(name = "base_fare", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Base fare cannot be negative")
    private BigDecimal baseFare = BigDecimal.ZERO;

    @Column(name = "reservation_charge", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Reservation charge cannot be negative")
    private BigDecimal reservationCharge = BigDecimal.ZERO;

    @Column(name = "superfast_charge", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Superfast charge cannot be negative")
    private BigDecimal superfastCharge = BigDecimal.ZERO;

    @Column(name = "catering_charge", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Catering charge cannot be negative")
    private BigDecimal cateringCharge = BigDecimal.ZERO;

    @Column(name = "gst_amount", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "GST amount cannot be negative")
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "senior_discount", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Senior discount cannot be negative")
    private BigDecimal seniorDiscount = BigDecimal.ZERO;

    @Column(name = "total_fare", precision = 10, scale = 2, nullable = false)
    @PositiveOrZero(message = "Total fare cannot be negative")
    private BigDecimal totalFare = BigDecimal.ZERO;

    @Column(name = "booked_at", nullable = false, updatable = false)
    private LocalDateTime bookedAt = LocalDateTime.now();

    /**
     * Bidirectional relationship to seat allocations for each passenger on this ticket.
     */
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference(value = "reservation-allocations")
    private List<SeatAllocationEntity> seatAllocations = new ArrayList<>();

    /**
     * Optional 1-to-1 relationship to cancellation audit slip (if ticket is cancelled).
     */
    @OneToOne(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "reservation-cancellation")
    private CancellationSlipEntity cancellationSlip;

    public ReservationEntity() {
    }

    public ReservationEntity(String pnr, BaseTrainEntity train,
                             StationEntity sourceStation, StationEntity destinationStation,
                             LocalDate journeyDate, CoachClass travelClass,
                             BigDecimal baseFare, BigDecimal reservationCharge,
                             BigDecimal superfastCharge, BigDecimal cateringCharge,
                             BigDecimal gstAmount, BigDecimal seniorDiscount, BigDecimal totalFare) {
        this.pnr = pnr;
        this.train = train;
        this.sourceStation = sourceStation;
        this.destinationStation = destinationStation;
        this.journeyDate = journeyDate;
        this.travelClass = travelClass;
        this.bookingStatus = BookingStatus.CONFIRMED;
        this.baseFare = baseFare;
        this.reservationCharge = reservationCharge;
        this.superfastCharge = superfastCharge;
        this.cateringCharge = cateringCharge;
        this.gstAmount = gstAmount;
        this.seniorDiscount = seniorDiscount;
        this.totalFare = totalFare;
        this.bookedAt = LocalDateTime.now();
    }

    // =========================================================================
    // ENCAPSULATED DOMAIN METHODS
    // =========================================================================

    /**
     * Formats the 10-digit PNR into standard railway 3-7 layout (e.g., 284-9182374).
     */
    public String getFormattedPnr() {
        if (this.pnr != null && this.pnr.length() == 10) {
            return this.pnr.substring(0, 3) + "-" + this.pnr.substring(3);
        }
        return this.pnr;
    }

    public boolean isConfirmed() {
        return this.bookingStatus == BookingStatus.CONFIRMED;
    }

    public boolean isCancelled() {
        return this.bookingStatus == BookingStatus.CANCELLED;
    }

    public void addSeatAllocation(SeatAllocationEntity allocation) {
        this.seatAllocations.add(allocation);
        allocation.setReservation(this);
    }

    // --- Getters & Setters ---

    public String getPnr() {
        return pnr;
    }

    public void setPnr(String pnr) {
        this.pnr = pnr;
    }

    public BaseTrainEntity getTrain() {
        return train;
    }

    public void setTrain(BaseTrainEntity train) {
        this.train = train;
    }

    public StationEntity getSourceStation() {
        return sourceStation;
    }

    public void setSourceStation(StationEntity sourceStation) {
        this.sourceStation = sourceStation;
    }

    public StationEntity getDestinationStation() {
        return destinationStation;
    }

    public void setDestinationStation(StationEntity destinationStation) {
        this.destinationStation = destinationStation;
    }

    public LocalDate getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(LocalDate journeyDate) {
        this.journeyDate = journeyDate;
    }

    public CoachClass getTravelClass() {
        return travelClass;
    }

    public void setTravelClass(CoachClass travelClass) {
        this.travelClass = travelClass;
    }

    public BookingStatus getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(BookingStatus bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }

    public BigDecimal getReservationCharge() {
        return reservationCharge;
    }

    public void setReservationCharge(BigDecimal reservationCharge) {
        this.reservationCharge = reservationCharge;
    }

    public BigDecimal getSuperfastCharge() {
        return superfastCharge;
    }

    public void setSuperfastCharge(BigDecimal superfastCharge) {
        this.superfastCharge = superfastCharge;
    }

    public BigDecimal getCateringCharge() {
        return cateringCharge;
    }

    public void setCateringCharge(BigDecimal cateringCharge) {
        this.cateringCharge = cateringCharge;
    }

    public BigDecimal getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(BigDecimal gstAmount) {
        this.gstAmount = gstAmount;
    }

    public BigDecimal getSeniorDiscount() {
        return seniorDiscount;
    }

    public void setSeniorDiscount(BigDecimal seniorDiscount) {
        this.seniorDiscount = seniorDiscount;
    }

    public BigDecimal getTotalFare() {
        return totalFare;
    }

    public void setTotalFare(BigDecimal totalFare) {
        this.totalFare = totalFare;
    }

    public LocalDateTime getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(LocalDateTime bookedAt) {
        this.bookedAt = bookedAt;
    }

    public List<SeatAllocationEntity> getSeatAllocations() {
        return seatAllocations;
    }

    public void setSeatAllocations(List<SeatAllocationEntity> seatAllocations) {
        this.seatAllocations = seatAllocations;
    }

    public CancellationSlipEntity getCancellationSlip() {
        return cancellationSlip;
    }

    public void setCancellationSlip(CancellationSlipEntity cancellationSlip) {
        this.cancellationSlip = cancellationSlip;
        if (cancellationSlip != null) {
            cancellationSlip.setReservation(this);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReservationEntity that = (ReservationEntity) o;
        return Objects.equals(pnr, that.pnr);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pnr);
    }
}
