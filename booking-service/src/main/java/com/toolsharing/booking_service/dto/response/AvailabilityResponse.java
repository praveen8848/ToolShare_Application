package com.toolsharing.booking_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor  // <--- CRITICAL FOR REDIS/JACKSON
@AllArgsConstructor // <--- CRITICAL FOR @BUILDER TO KEEP WORKING
public class AvailabilityResponse {
    private boolean available;
    private String message;
    private Integer pendingRequests;
    private List<SuggestedDatesResponse> suggestedDates;
    private List<ConflictBooking> conflictingBookings;
}