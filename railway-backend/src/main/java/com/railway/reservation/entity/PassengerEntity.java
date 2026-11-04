package com.railway.reservation.entity;

import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Entity representing an individual passenger profile.
 *
 * OOP Concept: Encapsulation & Domain Logic Validation
 * - Private fields with defensive validation (validateAge, email format).
 * - Domain methods: isSeniorCitizen() for concession checks, getMaskedIdProof() for privacy.
 */
@Entity
@Table(name = "passengers")
public class PassengerEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passenger_id")
    private Long passengerId;

    @Column(name = "full_name", length = 100, nullable = false)
    @NotBlank(message = "Passenger name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @Column(name = "age", nullable = false)
    @Min(value = 1, message = "Age must be at least 1 year")
    @Max(value = 120, message = "Age must be under 120 years")
    private int age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20, nullable = false)
    @NotNull(message = "Gender is required")
    private Gender gender;

    @Column(name = "phone", length = 25, nullable = false)
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Column(name = "email", length = 120, nullable = false)
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_proof_type", length = 30, nullable = false)
    @NotNull(message = "ID Proof type is required")
    private IdProofType idProofType;

    @Column(name = "id_proof_number", length = 60, nullable = false)
    @NotBlank(message = "ID Proof number is required")
    private String idProofNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PassengerEntity() {
    }

    public PassengerEntity(String fullName, int age, Gender gender,
                           String phone, String email,
                           IdProofType idProofType, String idProofNumber) {
        validateAge(age);
        this.fullName = fullName != null ? fullName.trim() : null;
        this.age = age;
        this.gender = gender;
        this.phone = phone != null ? phone.trim() : null;
        this.email = email != null ? email.trim().toLowerCase() : null;
        this.idProofType = idProofType;
        this.idProofNumber = idProofNumber != null ? idProofNumber.trim() : null;
        this.createdAt = LocalDateTime.now();
    }

    // =========================================================================
    // ENCAPSULATED DOMAIN METHODS
    // =========================================================================

    /**
     * Invariant check ensuring age boundaries are respected.
     */
    private void validateAge(int age) {
        if (age < 1 || age > 120) {
            throw new IllegalArgumentException("Invalid passenger age: " + age + ". Must be between 1 and 120.");
        }
    }

    /**
     * Checks if the passenger qualifies for senior citizen lower-berth priority & fare concessions.
     */
    public boolean isSeniorCitizen() {
        return this.age >= 60;
    }

    /**
     * Masks the government ID number for data privacy compliance.
     */
    public String getMaskedIdProof() {
        if (this.idProofNumber == null || this.idProofNumber.length() < 4) {
            return "••••-••••";
        }
        String lastFour = this.idProofNumber.substring(this.idProofNumber.length() - 4);
        return "••••-••••-" + lastFour;
    }

    // --- Getters & Setters ---

    public Long getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(Long passengerId) {
        this.passengerId = passengerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName != null ? fullName.trim() : null;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        validateAge(age);
        this.age = age;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim().toLowerCase() : null;
    }

    public IdProofType getIdProofType() {
        return idProofType;
    }

    public void setIdProofType(IdProofType idProofType) {
        this.idProofType = idProofType;
    }

    public String getIdProofNumber() {
        return idProofNumber;
    }

    public void setIdProofNumber(String idProofNumber) {
        this.idProofNumber = idProofNumber != null ? idProofNumber.trim() : null;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PassengerEntity that = (PassengerEntity) o;
        return Objects.equals(passengerId, that.passengerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(passengerId);
    }
}
