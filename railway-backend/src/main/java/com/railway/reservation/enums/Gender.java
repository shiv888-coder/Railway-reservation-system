package com.railway.reservation.enums;

/**
 * Enumeration representing passenger gender identities.
 */
public enum Gender {
    MALE("Male"),
    FEMALE("Female"),
    TRANSGENDER("Transgender"),
    OTHER("Other");

    private final String label;

    Gender(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
