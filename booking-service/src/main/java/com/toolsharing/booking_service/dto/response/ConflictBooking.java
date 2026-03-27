package com.toolsharing.booking_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ConflictBooking {
    private Long bookingId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}