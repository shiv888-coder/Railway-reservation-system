package com.railway.reservation.enums;

/**
 * Enumeration representing categories of passenger trains operating on the network.
 */
public enum TrainType {
    RAJDHANI("Rajdhani Express", "Premier fully air-conditioned express connecting state capitals to Delhi"),
    VANDE_BHARAT("Vande Bharat Express", "Next-gen semi-high-speed electric train with chair car accommodations"),
    SUPERFAST("Superfast Express", "Long-distance fast service with prioritized right-of-way"),
    MAIL_EXPRESS("Mail / Express", "Standard daily passenger mail express service"),
    SHATABDI("Shatabdi Express", "Daytime high-speed intercity express with all air-conditioned chair car accommodations"),
    DURONTO("Duronto Express", "Point-to-point non-stop long-distance express with high operational priority"),
    GARIB_RATH("Garib Rath Express", "Affordable all air-conditioned express with subsidized tariff fares");

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
}
