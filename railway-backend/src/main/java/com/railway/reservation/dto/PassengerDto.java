package com.railway.reservation.dto;

import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import jakarta.validation.constraints.*;

import java.io.Serializable;

/**
 * Data Transfer Object for passenger details submitted during ticket booking.
 */
public class PassengerDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Passenger name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be under 120")
    private int age;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "ID Proof type is required")
    private IdProofType idProofType;

    @NotBlank(message = "ID Proof number is required")
    private String idProofNumber;

    private String berthPreference;

    public PassengerDto() {
    }

    public PassengerDto(String fullName, int age, Gender gender, String phone,
                        String email, IdProofType idProofType, String idProofNumber,
                        String berthPreference) {
        this.fullName = fullName;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.idProofType = idProofType;
        this.idProofNumber = idProofNumber;
        this.berthPreference = berthPreference;
    }

    public boolean isSeniorCitizen() {
        return this.age >= 60;
    }

    // --- Getters & Setters ---

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
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
        this.email = email;
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
        this.idProofNumber = idProofNumber;
    }

    public String getBerthPreference() {
        return berthPreference;
    }

    public void setBerthPreference(String berthPreference) {
        this.berthPreference = berthPreference;
    }
}
