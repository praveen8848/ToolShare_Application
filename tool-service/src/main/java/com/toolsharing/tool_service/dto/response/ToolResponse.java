package com.toolsharing.tool_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    // REPLACED: String location is now separated into spatial coordinates
    private Double latitude;
    private Double longitude;

    private Integer viewsCount;
    private Integer favoritesCount;
    private List<String> images;
    private String pincode;
    private String city;
    private String state;
    private String pickupInstructions;
    private String ownerContact;
    private String contactMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}