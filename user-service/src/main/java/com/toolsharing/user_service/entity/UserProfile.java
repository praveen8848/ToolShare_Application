package com.toolsharing.user_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profiles", indexes = {
        @Index(name = "idx_user_profiles_email", columnList = "email", unique = true),
        @Index(name = "idx_user_profiles_status", columnList = "account_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    private Long userId;  // Same ID as auth service user

    @Version
    private Long version;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role = "USER";

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String profileImageUrl;

    private String bio;

    @Column(name = "account_status")
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "phone_verified")
    private Boolean phoneVerified = false;

    @Column(name = "verification_status")
    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    private Double trustScore = 0.0;

    @Column(name = "total_listings")
    private Integer totalListings = 0;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "current_otp")
    private String currentOtp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastActive = LocalDateTime.now();
        if (role == null) role = "USER";
        if (accountStatus == null) accountStatus = AccountStatus.ACTIVE;
        if (verificationStatus == null) verificationStatus = VerificationStatus.UNVERIFIED;
        if (emailVerified == null) emailVerified = false;
        if (phoneVerified == null) phoneVerified = false;
        if (trustScore == null) trustScore = 0.0;
        if (totalListings == null) totalListings = 0;
        if (totalBookings == null) totalBookings = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AccountStatus {
        ACTIVE, SUSPENDED, DEACTIVATED, BANNED
    }

    public enum VerificationStatus {
        UNVERIFIED, PENDING, VERIFIED, REJECTED
    }
}