package com.railway.reservation.enums;

/**
 * Enumeration representing categories of passenger trains operating on the network.
 */
public enum TrainType {
    RAJDHANI("Rajdhani Express", "Premier fully air-conditioned express connecting state capitals to Delhi"),
    VANDE_BHARAT("Vande Bharat Express", "Next-gen semi-high-speed electric train with chair car accommodations"),
    SUPERFAST("Superfast Express", "Long-distance fast service with prioritized right-of-way"),
    MAIL_EXPRESS("Mail / Express", "Standard daily passenger mail express service"),
    SHATABDI("Shatabdi Express", "Daytime high-speed intercity express with air-conditioned chair car accommodations"),
    DURONTO("Duronto Express", "Point-to-point non-stop long-distance express with high operational priority"),
    GARIB_RATH("Garib Rath Express", "Affordable all air-conditioned express with subsidized tariff fares"),
    HUMSAFAR("Humsafar Express", "All 3-Tier AC superfast express with modern amenities"),
    PASSENGER("Passenger", "Standard passenger halt service connecting local stations"),
    MEMU("MEMU", "Mainline Electric Multiple Unit suburban / interurban service"),
    LOCAL("Local", "Suburban local commuter service");

    private final String displayName;
    private final String description;

    TrainType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public static TrainType fromString(String text) {
        if (text == null) return MAIL_EXPRESS;
        String normalized = text.trim().toUpperCase().replace(" ", "_").replace("-", "_").replace("/", "_");
        for (TrainType t : TrainType.values()) {
            if (t.name().equalsIgnoreCase(normalized) || 
                t.displayName.equalsIgnoreCase(text.trim()) ||
                normalized.contains(t.name())) {
                return t;
            }
        }
        return MAIL_EXPRESS;
    }
}
