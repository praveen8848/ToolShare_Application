package com.toolsharing.booking_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicOwnerProfileResponse {
    private String name;
    private LocalDateTime memberSince;
    private double successRate;
    private int totalTools;
}