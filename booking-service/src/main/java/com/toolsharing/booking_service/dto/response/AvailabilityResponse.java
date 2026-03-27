package com.toolsharing.booking_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AvailabilityResponse {
    private boolean available;
    private String message;
    private Integer pendingRequests;
    private List<SuggestedDatesResponse> suggestedDates;
    private List<ConflictBooking> conflictingBookings;
}