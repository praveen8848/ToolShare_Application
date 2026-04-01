package com.toolsharing.tool_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ToolResponse {
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

    // NEW: Add images field for tool photos
    private List<String> images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}