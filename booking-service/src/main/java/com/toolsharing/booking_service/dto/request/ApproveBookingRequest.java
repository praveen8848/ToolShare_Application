package com.toolsharing.booking_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApproveBookingRequest {

    @NotNull(message = "Pickup date and time is required")
    @Future(message = "Pickup date and time must be in the future")
    private LocalDateTime pickupDateTime;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    private String pickupInstructions;

    @NotBlank(message = "Contact number is required")
    private String ownerContact;

    private String contactMethod;  // CALL, TEXT, BOTH
}