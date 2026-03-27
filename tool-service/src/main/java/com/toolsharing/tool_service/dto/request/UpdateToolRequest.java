package com.toolsharing.tool_service.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateToolRequest {

    private String name;

    private String description;

    private Long categoryId;

    @Positive(message = "Daily rate must be positive")
    private BigDecimal dailyRate;

    @Positive(message = "Weekly rate must be positive")
    private BigDecimal weeklyRate;

    @Positive(message = "Monthly rate must be positive")
    private BigDecimal monthlyRate;

    @Positive(message = "Deposit amount must be positive")
    private BigDecimal depositAmount;

    private String location;

    private String status;
}