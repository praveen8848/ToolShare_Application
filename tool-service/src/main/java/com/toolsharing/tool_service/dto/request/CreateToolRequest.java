package com.toolsharing.tool_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @Positive(message = "Daily rate must be positive")
    private BigDecimal dailyRate;

    private BigDecimal weeklyRate;

    private BigDecimal monthlyRate;

    private BigDecimal depositAmount;

    private String location;

    // NEW: Add images field for tool photos
    private List<String> images = new ArrayList<>();
}