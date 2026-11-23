package com.toolsharing.auth_service.controller;

import com.toolsharing.auth_service.dto.*;
import com.toolsharing.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for authentication endpoints.
 * Handles user registration, login, token validation, and related operations.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @Value("${internal.service.secret:toolshare-internal-secure-secret-key-2026}")
    private String internalServiceSecret;

    /**
     * Register a new user.
     * POST /api/auth/register
     *
     * @param registerRequest The registration request containing user details
     * @return UserDto containing the registered user's information
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            UserDto userDto = authService.register(registerRequest);
            return ResponseEntity.ok(userDto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", registerRequest.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Authenticate user and return JWT token.
     * POST /api/auth/login
     *
     * @param loginRequest The login request containing email and password
     * @return LoginResponse containing JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            logger.warn("Login failed for email: {}", loginRequest.getEmail());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            logger.error("Login failed for email: {}", loginRequest.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Validate JWT token.
     * POST /api/auth/validate
     *
     * @param authHeader The Authorization header containing the Bearer token
     * @return Validation result with user information
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        // Check if Authorization header is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String token = authHeader.substring(7);
        boolean isValid = authService.validateToken(token);

        if (isValid) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("userId", authService.getUserIdFromToken(token));
            response.put("email", authService.getEmailFromToken(token));
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get current user details from token.
     * GET /api/auth/me
     *
     * @param authHeader The Authorization header containing the Bearer token
     * @return UserDto containing current user's information
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // Check if Authorization header is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String token = authHeader.substring(7);

        // Validate token
        if (!authService.validateToken(token)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        try {
            Long userId = authService.getUserIdFromToken(token);
            UserDto userDto = authService.getCurrentUser(userId);
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            logger.error("Failed to get current user", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Refresh JWT token.
     * POST /api/auth/refresh
     *
     * @param authHeader The Authorization header containing the Bearer token
     * @return New JWT token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        // Check if Authorization header is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String oldToken = authHeader.substring(7);

        try {
            String newToken = authService.refreshToken(oldToken);

            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            response.put("tokenType", "Bearer");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Token refresh failed");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Logout user (invalidate token on client side).
     * POST /api/auth/logout
     *
     * @param authHeader The Authorization header containing the Bearer token
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        // Since we're using stateless JWT, logout is handled on client side
        // This endpoint exists for consistency
        logger.info("User logged out");

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Check if email is available.
     * GET /api/auth/check-email?email=user@example.com
     *
     * @param email The email to check
     * @return Availability status
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);

        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        response.put("email", email);

        return ResponseEntity.ok(response);
    }

    /**
     * Internal endpoint for updating password.
     * This endpoint is restricted to service-to-service communication only.
     * PUT /api/auth/internal/update-password
     *
     * @param email The user's email
     * @param password The new password
     * @return Success or not found response
     */
    @PutMapping("/internal/update-password")
    public ResponseEntity<Void> updatePassword(
            @RequestHeader(value = "X-Internal-Secret", required = false) String internalSecret,
            @RequestParam String email,
            @RequestParam String password) {

        // SECURITY FIX: Verify internal secret for service-to-service authentication
        if (internalServiceSecret == null || !internalServiceSecret.equals(internalSecret)) {
            logger.warn("Unauthorized internal API call attempt for password update");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean updated = authService.updatePassword(email, password);

        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
