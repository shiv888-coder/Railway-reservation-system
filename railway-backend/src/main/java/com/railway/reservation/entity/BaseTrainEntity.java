package com.railway.reservation.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.TrainType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Abstract Base Entity representing a passenger train in the railway network.
 *
 * OOP CONCEPTS DEMONSTRATED:
 * 1. Abstraction:
 *    - Marked 'abstract'; cannot be instantiated directly.
 *    - Defines template state and common railway operational behaviors.
 *
 * 2. Inheritance:
 *    - Serves as the parent class for specialized train categories
 *      (RajdhaniTrainEntity, VandeBharatTrainEntity, SuperfastTrainEntity).
 *    - Utilizes JPA SINGLE_TABLE inheritance with a discriminator column.
 *
 * 3. Encapsulation:
 *    - Fields are protected/private with validated accessors and mutators.
 *    - Encapsulates domain logic for seat reservations and cancellations.
 *
 * 4. Polymorphism:
 *    - Declares the abstract calculateFare() contract that each train subclass
 *      overrides with its own dynamic pricing algorithm.
 */
@Entity
@Table(name = "trains")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "train_category", discriminatorType = DiscriminatorType.STRING, length = 30)
public abstract class BaseTrainEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key: 5-digit unique Train Number (e.g., "12301", "22436")
     */
    @Id
    @Column(name = "train_number", length = 10, nullable = false, updatable = false)
    @NotBlank(message = "Train number is required")
    protected String trainNumber;

    @Column(name = "train_name", length = 120, nullable = false)
    @NotBlank(message = "Train name is required")
    protected String trainName;

    @Enumerated(EnumType.STRING)
    @Column(name = "train_type", length = 30, nullable = false)
    @NotNull(message = "Train type cannot be null")
    protected TrainType trainType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_station_code", nullable = false)
    @NotNull(message = "Source station is required")
    protected StationEntity sourceStation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_station_code", nullable = false)
    @NotNull(message = "Destination station is required")
    protected StationEntity destinationStation;

    @Column(name = "departure_time", nullable = false)
    @NotNull(message = "Departure time is required")
    protected LocalTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    @NotNull(message = "Arrival time is required")
    protected LocalTime arrivalTime;

    @Column(name = "duration_hours", length = 20, nullable = false)
    @NotBlank(message = "Journey duration is required")
    protected String durationHours;

    @Column(name = "distance_km", nullable = false)
    @Positive(message = "Distance must be greater than zero")
    protected int distanceKm;

    @Column(name = "days_of_operation", length = 120, nullable = false)
    protected String daysOfOperation;

    /**
     * Bidirectional mapping to scheduled route halts.
     * JsonManagedReference prevents infinite recursion during Jackson serialization.
     */
    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stopSequence ASC")
    @JsonManagedReference(value = "train-halts")
    protected List<RouteHaltEntity> halts = new ArrayList<>();

    /**
     * Bidirectional mapping to class-wise seat capacity and tariffs.
     */
    @OneToMany(mappedBy = "train", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference(value = "train-seats")
    protected List<TrainSeatEntity> seats = new ArrayList<>();

    /**
     * Default No-Arg Constructor (Required by JPA)
     */
    public BaseTrainEntity() {
    }

    /**
     * Parameterized Constructor (OOP Object Construction)
     */
    public BaseTrainEntity(String trainNumber, String trainName, TrainType trainType,
                           StationEntity sourceStation, StationEntity destinationStation,
                           LocalTime departureTime, LocalTime arrivalTime,
                           String durationHours, int distanceKm, String daysOfOperation) {
        this.trainNumber = trainNumber;
        this.trainName = trainName;
        this.trainType = trainType;
        this.sourceStation = sourceStation;
        this.destinationStation = destinationStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.durationHours = durationHours;
        this.distanceKm = distanceKm;
        this.daysOfOperation = daysOfOperation != null ? daysOfOperation : "Daily";
    }

    // =========================================================================
    // POLYMORPHIC ABSTRACT METHOD
    // Every train subclass (Rajdhani, Vande Bharat, Superfast) must implement
    // its own distinct pricing calculation logic.
    // =========================================================================
    public abstract BigDecimal calculateFare(CoachClass coachClass, int passengerCount, int seniorCount);

    // =========================================================================
    // ENCAPSULATED DOMAIN METHODS (Seat Inventory Management)
    // =========================================================================

    /**
     * Retrieves the current available seats for a specific travel class.
     */
    public int getAvailableSeats(CoachClass coachClass) {
        for (TrainSeatEntity seat : seats) {
            if (seat.getCoachClass() == coachClass) {
                return seat.getAvailableSeats();
            }
        }
        return 0;
    }

    /**
     * Safely books seat count in the requested class.
     * Returns true if successful, false if insufficient seats.
     */
    public boolean bookSeats(CoachClass coachClass, int count) {
        for (TrainSeatEntity seat : seats) {
            if (seat.getCoachClass() == coachClass) {
                if (seat.getAvailableSeats() >= count) {
                    seat.setAvailableSeats(seat.getAvailableSeats() - count);
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    /**
     * Returns released seats back into train inventory upon cancellation.
     */
    public void cancelSeats(CoachClass coachClass, int count) {
        for (TrainSeatEntity seat : seats) {
            if (seat.getCoachClass() == coachClass) {
                int updated = Math.min(seat.getTotalSeats(), seat.getAvailableSeats() + count);
                seat.setAvailableSeats(updated);
                return;
            }
        }
    }

    // --- Getters & Setters ---

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }

    public TrainType getTrainType() {
        return trainType;
    }

    public void setTrainType(TrainType trainType) {
        this.trainType = trainType;
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

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(String durationHours) {
        this.durationHours = durationHours;
    }

    public int getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(int distanceKm) {
        this.distanceKm = distanceKm;
    }

    public String getDaysOfOperation() {
        return daysOfOperation;
    }

    public void setDaysOfOperation(String daysOfOperation) {
        this.daysOfOperation = daysOfOperation;
    }

    public List<RouteHaltEntity> getHalts() {
        return halts;
    }

    public void setHalts(List<RouteHaltEntity> halts) {
        this.halts = halts;
    }

    public List<TrainSeatEntity> getSeats() {
        return seats;
    }

    public void setSeats(List<TrainSeatEntity> seats) {
        this.seats = seats;
    }

    public void addHalt(RouteHaltEntity halt) {
        halts.add(halt);
        halt.setTrain(this);
    }

    public void addSeat(TrainSeatEntity seat) {
        seats.add(seat);
        seat.setTrain(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseTrainEntity that = (BaseTrainEntity) o;
        return Objects.equals(trainNumber, that.trainNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(trainNumber);
    }
}
