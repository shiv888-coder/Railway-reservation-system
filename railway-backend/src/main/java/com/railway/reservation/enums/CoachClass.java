package com.railway.reservation.enums;

/**
 * Enumeration representing available railway coach accommodation classes.
 * Each class has a standardized code and human-readable description.
 */
public enum CoachClass {
    FIRST_AC("1A", "AC First Class"),
    SECOND_AC("2A", "AC 2-Tier Sleeper"),
    THIRD_AC("3A", "AC 3-Tier Sleeper"),
    SLEEPER("SL", "Sleeper Class (Non-AC)"),
    CHAIR_CAR("CC", "AC Chair Car"),
    EXECUTIVE_CHAIR("EC", "Executive Anubhuti Chair Car"),
    SECOND_SEATING("2S", "Second Sitting (2S)");

    private final String code;
    private final String displayName;

    CoachClass(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static CoachClass fromCode(String code) {
        if (code == null) return null;
        String trimmed = code.trim();
        for (CoachClass c : CoachClass.values()) {
            if (c.getCode().equalsIgnoreCase(trimmed) || c.name().equalsIgnoreCase(trimmed)) {
                return c;
            }
        }
        return SLEEPER;
    }
}
