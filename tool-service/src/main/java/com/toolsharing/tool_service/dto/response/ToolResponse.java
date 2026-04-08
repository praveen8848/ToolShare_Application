package com.toolsharing.tool_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ToolResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long ownerId;
    private String ownerName;
    private String status;
    private BigDecimal dailyRate;
    private BigDecimal weeklyRate;
    private BigDecimal monthlyRate;
    private BigDecimal depositAmount;
    private String location;
    private Integer viewsCount;
    private Integer favoritesCount;
    private List<String> images;
    private String pickupLocation;
    private String pickupInstructions;
    private String ownerContact;
    private String contactMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}