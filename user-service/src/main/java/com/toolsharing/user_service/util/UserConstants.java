package com.toolsharing.user_service.util;

/**
 * Constants used across the User Service.
 */
public final class UserConstants {

    private UserConstants() {
        // Prevent instantiation
    }

    public static final int REGISTRATION_OTP_EXPIRY_MINUTES = 10;
    public static final int PASSWORD_RESET_OTP_EXPIRY_MINUTES = 15;
    public static final long MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    public static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";
}
