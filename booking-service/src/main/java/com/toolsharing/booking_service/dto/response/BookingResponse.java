package com.toolsharing.booking_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long borrowerId;
    private String borrowerName;
    private Long ownerId;
    private String ownerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String qrCode;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
}