package com.toolsharing.booking_service.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateBookingRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}