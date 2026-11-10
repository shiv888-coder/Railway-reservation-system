package com.railway.reservation.enums;

/**
 * Enumeration representing officially recognized government identity proof documents.
 */
public enum IdProofType {
    AADHAAR_CARD("Aadhaar Card"),
    AADHAAR("Aadhaar Card"),
    PAN_CARD("PAN Card"),
    PASSPORT("Passport"),
    VOTER_ID("Voter ID"),
    DRIVING_LICENSE("Driving License"),
    STUDENT_ID("Student ID Card");

    private final String label;

    IdProofType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public String getDisplayName() {
        return label;
    }

    public static IdProofType fromString(String val) {
        if (val == null) return AADHAAR_CARD;
        String trimmed = val.trim().toUpperCase().replace(" ", "_");
        for (IdProofType t : IdProofType.values()) {
            if (t.name().equalsIgnoreCase(trimmed) || t.label.equalsIgnoreCase(val.trim())) {
                return t;
            }
        }
        return AADHAAR_CARD;
    }
}
