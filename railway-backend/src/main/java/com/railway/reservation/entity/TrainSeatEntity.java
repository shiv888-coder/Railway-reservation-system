package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.railway.reservation.enums.CoachClass;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * Entity representing class-wise seat capacity, availability, and tariff for a train.
 *
 * OOP Concept: Encapsulation & Concurrency Control
 * - Enforces positive seat quantities.
 * - Employs JPA @Version for optimistic locking to prevent race conditions during concurrent bookings.
 */
@Entity
@Table(name = "train_seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"train_number", "coach_class"})
})
public class TrainSeatEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_number", nullable = false)
    @JsonBackReference(value = "train-seats")
    private BaseTrainEntity train;

    @Enumerated(EnumType.STRING)
    @Column(name = "coach_class", length = 20, nullable = false)
    @NotNull(message = "Coach class is required")
    private CoachClass coachClass;

    @Column(name = "total_seats", nullable = false)
    @PositiveOrZero(message = "Total seats cannot be negative")
    private int totalSeats;

    @Column(name = "available_seats", nullable = false)
    @PositiveOrZero(message = "Available seats cannot be negative")
    private int availableSeats;

    @Column(name = "base_fare", precision = 10, scale = 2, nullable = false)
    @NotNull(message = "Base fare cannot be null")
    private BigDecimal baseFare;

    /**
     * Optimistic locking version field for concurrent seat reservation safety.
     */
    @Version
    @Column(name = "version")
    private Integer version;

    public TrainSeatEntity() {
    }

    public TrainSeatEntity(BaseTrainEntity train, CoachClass coachClass, int totalSeats, int availableSeats, BigDecimal baseFare) {
        this.train = train;
        this.coachClass = coachClass;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.baseFare = baseFare;
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BaseTrainEntity getTrain() {
        return train;
    }

    public void setTrain(BaseTrainEntity train) {
        this.train = train;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        if (availableSeats < 0) {
            throw new IllegalArgumentException("Available seats cannot be negative.");
        }
        this.availableSeats = availableSeats;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(BigDecimal baseFare) {
        this.baseFare = baseFare;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TrainSeatEntity that = (TrainSeatEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
