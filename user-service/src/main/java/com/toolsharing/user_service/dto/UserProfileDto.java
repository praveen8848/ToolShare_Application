package com.toolsharing.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long userId;
    private String email;
    private String name;
    private String role;
    private String phoneNumber;
    private String address;
    private String profileImageUrl;
    private String bio;
    private String accountStatus;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String verificationStatus;
    private Double trustScore;
    private Integer totalListings;
    private Integer totalBookings;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
}