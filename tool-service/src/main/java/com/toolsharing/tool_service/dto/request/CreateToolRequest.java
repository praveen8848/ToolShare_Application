package com.toolsharing.tool_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateToolRequest {

    @NotBlank(message = "Tool name is required")
    private String name;

    private String description;

    private Long categoryId;

    @NotNull(message = "Daily rate is required")
    @PositiveOrZero(message = "Daily rate must be positive or zero")
    private BigDecimal dailyRate;

    private BigDecimal weeklyRate;

    private BigDecimal monthlyRate;

    private BigDecimal depositAmount;

    private String location;

    // Images field for tool photos
    private List<String> images = new ArrayList<>();

    // NEW: Pickup details fields (defaults for this tool)
    private String pickupLocation;

    private String pickupInstructions;

    private String ownerContact;

    private String contactMethod;  // CALL, TEXT, BOTH
}