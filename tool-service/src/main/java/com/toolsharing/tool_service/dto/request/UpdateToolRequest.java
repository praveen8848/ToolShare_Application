package com.toolsharing.tool_service.dto.request;

import jakarta.validation.constraints.Positive;
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

    @PositiveOrZero(message = "Daily rate must be zero or positive")
    private BigDecimal weeklyRate;

    @PositiveOrZero(message = "Daily rate must be zero or positive")
    private BigDecimal monthlyRate;

    @PositiveOrZero(message = "Daily rate must be zero or positive")
    private BigDecimal depositAmount;

    private String location;

    private String status;

    // Images field for updating tool photos
    private List<String> images;

    // NEW: Pickup details fields (update defaults for this tool)
    private String pickupLocation;

    private String pickupInstructions;

    private String ownerContact;

    private String contactMethod;  // CALL, TEXT, BOTH
}