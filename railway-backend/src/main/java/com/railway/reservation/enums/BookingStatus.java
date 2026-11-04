package com.railway.reservation.enums;

/**
 * Enumeration representing the lifecycle state of a ticket reservation.
 */
public enum BookingStatus {
    CONFIRMED("Confirmed Ticket - Berth Allocated"),
    CANCELLED("Cancelled Ticket - Refund Processed"),
    WAITLIST("Reservation Against Cancellation / Waitlist");

    private final String description;

    BookingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
