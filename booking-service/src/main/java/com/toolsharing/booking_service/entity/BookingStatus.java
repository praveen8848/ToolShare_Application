package com.toolsharing.booking_service.entity;

public enum BookingStatus {
    PENDING,    // Waiting for owner approval
    CONFIRMED,  // Owner approved - dates locked
    REJECTED,   // Owner rejected
    CANCELLED,  // Borrower cancelled
    COMPLETED   // Returned successfully
}