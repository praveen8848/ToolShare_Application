package com.toolsharing.auth_service.controller;
import com.toolsharing.auth_service.client.UserServiceClient;
import com.toolsharing.auth_service.dto.*;
import com.toolsharing.auth_service.entity.User;
import com.toolsharing.auth_service.repository.UserRepository;
import com.toolsharing.auth_service.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserServiceClient userServiceClient;  // Add this

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Registering user with email: {}", registerRequest.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is already taken!");
            return ResponseEntity.badRequest().body(error);
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // 🔥 NEW: Sync with User Service
        try {
            UserSyncDto syncDto = UserSyncDto.builder()
                    .id(savedUser.getId())
                    .email(savedUser.getEmail())
                    .name(savedUser.getName())
                    .role(savedUser.getRole())
                    .isActive(savedUser.getIsActive())
                    .build();

            userServiceClient.syncUser(syncDto);
            logger.info("User synced with User Service: {}", savedUser.getEmail());
        } catch (Exception e) {
            // Log error but don't fail registration
            logger.error("Failed to sync user with User Service: {}", e.getMessage());
        }

        // Convert to DTO
        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .isActive(savedUser.getIsActive())
                .createdAt(savedUser.getCreatedAt())
                .build();

        logger.info("User registered successfully with id: {}", savedUser.getId());
        return ResponseEntity.ok(userDto);
    }

    /**
     * Register a new user
     * POST /api/auth/register
     */
//    @PostMapping("/register")
//    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
//        logger.info("Registering user with email: {}", registerRequest.getEmail());
//
//        // Check if email already exists
//        if (userRepository.existsByEmail(registerRequest.getEmail())) {
//            Map<String, String> error = new HashMap<>();
//            error.put("message", "Email is already taken!");
//            return ResponseEntity.badRequest().body(error);
//        }
//
//        // Create new user
//        User user = new User();
//        user.setName(registerRequest.getName());
//        user.setEmail(registerRequest.getEmail());
//        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
//        user.setRole("USER");
//
//        User savedUser = userRepository.save(user);
//
//        // Convert to DTO
//        UserDto userDto = UserDto.builder()
//                .id(savedUser.getId())
//                .name(savedUser.getName())
//                .email(savedUser.getEmail())
//                .role(savedUser.getRole())
//                .isActive(savedUser.getIsActive())
//                .createdAt(savedUser.getCreatedAt())
//                .build();
//
//        logger.info("User registered successfully with id: {}", savedUser.getId());
//        return ResponseEntity.ok(userDto);
//    }

    /**
     * Authenticate user and return JWT token
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);

            // Get user details
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create response DTO
            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .isActive(user.getIsActive())
                    .createdAt(user.getCreatedAt())
                    .build();

            LoginResponse response = LoginResponse.builder()
                    .token(jwt)
                    .tokenType("Bearer")
                    .user(userDto)
                    .build();

            logger.info("User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Login failed for email: {}", loginRequest.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Validate JWT token
     * POST /api/auth/validate
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
        boolean isValid = tokenProvider.validateToken(token);

        if (isValid) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("userId", tokenProvider.getUserIdFromToken(token));
            response.put("email", tokenProvider.getEmailFromToken(token));
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get current user details from token
     * GET /api/auth/me
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
        if (!tokenProvider.validateToken(token)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Get user from token
        Long userId = tokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Convert to DTO
        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(userDto);
    }

    /**
     * Refresh JWT token
     * POST /api/auth/refresh
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

        // Validate old token
        if (!tokenProvider.validateToken(oldToken)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Generate new token with same user details
        Long userId = tokenProvider.getUserIdFromToken(oldToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create authentication object
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null);

        // Generate new token
        String newToken = tokenProvider.generateToken(authentication);

        Map<String, String> response = new HashMap<>();
        response.put("token", newToken);
        response.put("tokenType", "Bearer");

        logger.info("Token refreshed for user: {}", user.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Logout user (invalidate token on client side)
     * POST /api/auth/logout
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
     * Check if email is available
     * GET /api/auth/check-email?email=user@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);

        Map<String, Object> response = new HashMap<>();
        response.put("available", !exists);
        response.put("email", email);

        return ResponseEntity.ok(response);
    }
}