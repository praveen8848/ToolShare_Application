package com.toolsharing.booking_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class SuggestedDatesResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private BigDecimal totalPrice;
}