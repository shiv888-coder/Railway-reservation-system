package com.railway.reservation.dto;

import com.railway.reservation.enums.CoachClass;
import com.railway.reservation.enums.Gender;
import com.railway.reservation.enums.IdProofType;
import com.railway.reservation.model.Passenger;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Form backing bean for Spring MVC and Thymeleaf multi-passenger ticket bookings.
 */
public class BookingForm implements Serializable {

    private static final long serialVersionUID = 1L;

    private String trainNumber;
    private String sourceStationCode;
    private String destinationStationCode;
    private String journeyDate;
    private CoachClass coachClass = CoachClass.THIRD_AC;
    private List<PassengerItem> passengers = new ArrayList<>();

    public BookingForm() {
        // Initialize with 1 default passenger item
        passengers.add(new PassengerItem());
    }

    public static class PassengerItem implements Serializable {
        private String fullName;
        private int age = 25;
        private Gender gender = Gender.MALE;
        private String phone;
        private String email;
        private IdProofType idProofType = IdProofType.AADHAAR;
        private String idProofNumber;

        public PassengerItem() {
        }

        public Passenger toPassenger() {
            return new Passenger(0, fullName, age, gender, phone, email, idProofType, idProofNumber, null);
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
    }

    public BookingRequest toBookingRequest() {
        BookingRequest req = new BookingRequest();
        req.setTrainNumber(trainNumber);
        req.setSourceStationCode(sourceStationCode);
        req.setDestinationStationCode(destinationStationCode);
        req.setJourneyDate(journeyDate);
        req.setCoachClass(coachClass);

        List<Passenger> paxList = new ArrayList<>();
        if (passengers != null) {
            for (PassengerItem item : passengers) {
                if (item.getFullName() != null && !item.getFullName().trim().isEmpty()) {
                    paxList.add(item.toPassenger());
                }
            }
        }
        req.setPassengers(paxList);
        return req;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public String getSourceStationCode() {
        return sourceStationCode;
    }

    public void setSourceStationCode(String sourceStationCode) {
        this.sourceStationCode = sourceStationCode;
    }

    public String getDestinationStationCode() {
        return destinationStationCode;
    }

    public void setDestinationStationCode(String destinationStationCode) {
        this.destinationStationCode = destinationStationCode;
    }

    public String getJourneyDate() {
        return journeyDate;
    }

    public void setJourneyDate(String journeyDate) {
        this.journeyDate = journeyDate;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public List<PassengerItem> getPassengers() {
        return passengers;
    }

    public void setPassengers(List<PassengerItem> passengers) {
        this.passengers = passengers;
    }
}
