package com.toolsharing.booking_service.constant;

/**
 * Standardized notification event types.
 */
public enum NotificationEventType {
    BOOKING_REQUESTED("BOOKING_REQUESTED"),
    BOOKING_APPROVED("BOOKING_APPROVED"),
    BOOKING_REJECTED("BOOKING_REJECTED"),
    BOOKING_CANCELLED("BOOKING_CANCELLED"),
    BOOKING_COMPLETED("BOOKING_COMPLETED"),
    USER_REGISTERED("USER_REGISTERED"),
    PASSWORD_RESET("PASSWORD_RESET");

    private final String value;

    NotificationEventType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
