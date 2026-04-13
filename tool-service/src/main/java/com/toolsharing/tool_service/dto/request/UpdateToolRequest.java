package com.toolsharing.tool_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateToolRequest {

    private String name;
    private String description;
    private Long categoryId;

    @PositiveOrZero(message = "Daily rate must be zero or positive")
    private BigDecimal dailyRate;

    @PositiveOrZero(message = "Weekly rate must be zero or positive")
    private BigDecimal weeklyRate;

    @PositiveOrZero(message = "Monthly rate must be zero or positive")
    private BigDecimal monthlyRate;

    @PositiveOrZero(message = "Deposit amount must be zero or positive")
    private BigDecimal depositAmount;

    private String status;
    private List<String> images;

    // ADD THESE:
    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;
    private String pickupInstructions;
    private String ownerContact;
    private String contactMethod;
}