package com.toolsharing.auth_service.util;

/**
 * Constants used throughout authentication and security operations.
 */
public final class SecurityConstants {

    private SecurityConstants() {
        // Prevent instantiation
    }

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";

    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int LOCKOUT_DURATION_MINUTES = 15;
    public static final long DEFAULT_JWT_EXPIRATION_MS = 86400000L; // 24 hours
}
