package com.toolsharing.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Utility class for JWT token operations.
 * Handles token parsing, validation, and claims extraction.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Gets the signing key for JWT operations.
     * Uses HMAC SHA algorithm with the configured secret.
     *
     * @return SecretKey for JWT signing/verification
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extracts all claims from a JWT token.
     *
     * @param token The JWT token
     * @return Claims object containing all token claims
     * @throws io.jsonwebtoken.JwtException if token is invalid
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // FIX: Use verifyWith instead of deprecated setSigningKey
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts user ID from JWT token.
     *
     * @param token The JWT token
     * @return User ID or null if extraction fails
     */
    public Long getUserIdFromToken(String token) {
        try {
            Object sub = extractClaims(token).get("sub");
            if (sub instanceof String) {
                return Long.parseLong((String) sub);
            } else if (sub instanceof Integer) {
                return ((Integer) sub).longValue();
            } else if (sub instanceof Long) {
                return (Long) sub;
            }
            return Long.parseLong(extractClaims(token).getSubject());
        } catch (Exception e) {
            logger.error("Failed to extract user ID from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts email from JWT token.
     *
     * @param token The JWT token
     * @return Email or null if extraction fails
     */
    public String getEmailFromToken(String token) {
        try {
            return extractClaims(token).get("email", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract email from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts name from JWT token.
     *
     * @param token The JWT token
     * @return Name or null if extraction fails
     */
    public String getNameFromToken(String token) {
        try {
            return extractClaims(token).get("name", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract name from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts role from JWT token.
     *
     * @param token The JWT token
     * @return Role or null if extraction fails
     */
    public String getRoleFromToken(String token) {
        try {
            return extractClaims(token).get("role", String.class);
        } catch (Exception e) {
            logger.error("Failed to extract role from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Validates a JWT token.
     *
     * @param token The JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}
