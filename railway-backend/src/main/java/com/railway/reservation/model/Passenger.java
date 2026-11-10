package com.railway.reservation.model;

import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;

import java.io.Serializable;

/**
 * Passenger domain entity representing a traveler.
 */
public class Passenger implements Serializable {

    private static final long serialVersionUID = 1L;

    private int passengerId;
    private String fullName;
    private int age;
    private Gender gender;
    private String phone;
    private String email;
    private IdProofType idProofType;
    private String idProofNumber;
    private String createdAt;

    public Passenger() {
    }

    /**
     * Minimal constructor (Constructor Overloading).
     */
    public Passenger(String fullName, int age, Gender gender) {
        this(0, fullName, age, gender, "", "", IdProofType.AADHAAR_CARD, "", null);
    }

    /**
     * Common booking constructor without database ID (Constructor Overloading).
     */
    public Passenger(String fullName, int age, Gender gender, String phone, IdProofType idProofType, String idProofNumber) {
        this(0, fullName, age, gender, phone, "", idProofType, idProofNumber, null);
    }

    /**
     * Full database entity constructor (Constructor Overloading).
     */
    public Passenger(int passengerId, String fullName, int age, Gender gender,
                     String phone, String email, IdProofType idProofType,
                     String idProofNumber, String createdAt) {
        this.passengerId = passengerId;
        this.fullName = fullName != null ? fullName.trim() : "";
        this.age = age;
        this.gender = gender != null ? gender : Gender.MALE;
        this.phone = phone != null ? phone.trim() : "";
        this.email = email != null ? email.trim() : "";
        this.idProofType = idProofType != null ? idProofType : IdProofType.AADHAAR;
        this.idProofNumber = idProofNumber != null ? idProofNumber.trim() : "";
        this.createdAt = createdAt;
    }

    public boolean isSeniorCitizen() {
        return this.age >= 60;
    }

    public int getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(int passengerId) {
        this.passengerId = passengerId;
    }

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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
