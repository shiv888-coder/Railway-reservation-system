package com.railway.reservation.model;

import com.railway.reservation.enums.CoachClass;

import java.io.Serializable;

/**
 * Entity representing available accommodation classes and base fare rates for a train.
 */
public class TrainClass implements Serializable {

    private static final long serialVersionUID = 1L;

    private int classId;
    private String trainNumber;
    private CoachClass coachClass;
    private double baseFare;

    public TrainClass() {
    }

    public TrainClass(int classId, String trainNumber, CoachClass coachClass, double baseFare) {
        this.classId = classId;
        this.trainNumber = trainNumber;
        this.coachClass = coachClass;
        this.baseFare = baseFare;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public CoachClass getCoachClass() {
        return coachClass;
    }

    public void setCoachClass(CoachClass coachClass) {
        this.coachClass = coachClass;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public void setBaseFare(double baseFare) {
        this.baseFare = baseFare;
    }
}
