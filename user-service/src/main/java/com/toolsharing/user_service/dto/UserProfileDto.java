package com.toolsharing.user_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileDto {
    private Long userId;
    private String email;
    private String name;
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
    private Integer successfulTransactions;
    private Integer cancelledTransactions;
    private String preferences;
    private LocalDateTime lastActive;
    private LocalDateTime createdAt;
}