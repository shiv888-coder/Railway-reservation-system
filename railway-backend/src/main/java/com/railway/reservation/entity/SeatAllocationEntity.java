package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.util.Objects;

/**
 * Entity representing the physical coach and berth allocation assigned to an individual passenger.
 *
 * OOP Concept: Associative Entity
 * - Maps passenger manifest entries to concrete coach berths within a reservation.
 */
@Entity
@Table(name = "seat_allocations")
public class SeatAllocationEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pnr", nullable = false)
    @JsonBackReference(value = "reservation-allocations")
    private ReservationEntity reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passenger_id", nullable = false)
    @NotNull(message = "Passenger is required")
    private PassengerEntity passenger;

    @Column(name = "coach_number", length = 15, nullable = false)
    @NotBlank(message = "Coach number is required")
    private String coachNumber;

    @Column(name = "berth_number", nullable = false)
    @Positive(message = "Berth number must be positive")
    private int berthNumber;

    @Column(name = "berth_type", length = 40, nullable = false)
    @NotBlank(message = "Berth type is required")
    private String berthType;

    public SeatAllocationEntity() {
    }

    public SeatAllocationEntity(ReservationEntity reservation, PassengerEntity passenger,
                                String coachNumber, int berthNumber, String berthType) {
        this.reservation = reservation;
        this.passenger = passenger;
        this.coachNumber = coachNumber;
        this.berthNumber = berthNumber;
        this.berthType = berthType;
    }

    // --- Getters & Setters ---

    public Long getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Long allocationId) {
        this.allocationId = allocationId;
    }

    public ReservationEntity getReservation() {
        return reservation;
    }

    public void setReservation(ReservationEntity reservation) {
        this.reservation = reservation;
    }

    public PassengerEntity getPassenger() {
        return passenger;
    }

    public void setPassenger(PassengerEntity passenger) {
        this.passenger = passenger;
    }

    public String getCoachNumber() {
        return coachNumber;
    }

    public void setCoachNumber(String coachNumber) {
        this.coachNumber = coachNumber;
    }

    public int getBerthNumber() {
        return berthNumber;
    }

    public void setBerthNumber(int berthNumber) {
        this.berthNumber = berthNumber;
    }

    public String getBerthType() {
        return berthType;
    }

    public void setBerthType(String berthType) {
        this.berthType = berthType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SeatAllocationEntity that = (SeatAllocationEntity) o;
        return Objects.equals(allocationId, that.allocationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(allocationId);
    }
}
