package com.railway.reservation.enums;

/**
 * Enumeration representing available railway coach accommodation classes.
 *
 * Each class has a standardized code and human-readable description.
 */
public enum CoachClass {
    FIRST_AC("1A", "AC First Class"),
    SECOND_AC("2A", "AC 2-Tier Sleeper"),
    THIRD_AC("3A", "AC 3-Tier Sleeper"),
    SLEEPER("SL", "Sleeper Class (Non-AC)"),
    CHAIR_CAR("CC", "AC Chair Car"),
    EXECUTIVE_CHAIR("EC", "Executive Anubhuti Chair Car");

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

    /**
     * Resolves a CoachClass from its short code (e.g. "3A" -> THIRD_AC)
     */
    public static CoachClass fromCode(String code) {
        if (code == null) return null;
        for (CoachClass c : CoachClass.values()) {
            if (c.getCode().equalsIgnoreCase(code.trim()) || c.name().equalsIgnoreCase(code.trim())) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown Coach Class code: " + code);
    }
}
