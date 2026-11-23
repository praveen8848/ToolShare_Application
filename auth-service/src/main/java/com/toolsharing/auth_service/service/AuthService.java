package com.toolsharing.auth_service.service;

import com.toolsharing.auth_service.client.UserServiceClient;
import com.toolsharing.auth_service.dto.*;
import com.toolsharing.auth_service.entity.User;
import com.toolsharing.auth_service.repository.UserRepository;
import com.toolsharing.auth_service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for authentication operations.
 * Handles user registration, login, token validation, and password management.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserServiceClient userServiceClient;
    private final com.toolsharing.auth_service.security.LoginRateLimiter loginRateLimiter;

    /**
     * Registers a new user in the system.
     *
     * @param registerRequest The registration request containing user details
     * @return UserDto containing the registered user's information
     * @throws IllegalArgumentException if email is already taken
     */
    @Transactional
    public UserDto register(RegisterRequest registerRequest) {
        logger.info("Registering user with email: {}", registerRequest.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already taken!");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // Sync with User Service
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
        return userDto;
    }

    /**
     * Authenticates a user and generates a JWT token with rate limiting and lockout protection.
     *
     * @param loginRequest The login request containing email and password
     * @return LoginResponse containing JWT token and user details
     * @throws AuthenticationException if credentials are invalid or account is locked
     */
    public LoginResponse login(LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        if (loginRateLimiter.isLocked(loginRequest.getEmail())) {
            logger.warn("Login attempt blocked for locked account: {}", loginRequest.getEmail());
            throw new org.springframework.security.authentication.LockedException(
                    "Account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes."
            );
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Record successful login
            loginRateLimiter.recordSuccess(loginRequest.getEmail());

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
            return response;
        } catch (AuthenticationException e) {
            loginRateLimiter.recordFailure(loginRequest.getEmail());
            throw e;
        }
    }

    /**
     * Validates a JWT token.
     *
     * @param token The JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    /**
     * Gets user ID from a JWT token.
     *
     * @param token The JWT token
     * @return User ID extracted from token
     */
    public Long getUserIdFromToken(String token) {
        return tokenProvider.getUserIdFromToken(token);
    }

    /**
     * Gets email from a JWT token.
     *
     * @param token The JWT token
     * @return Email extracted from token
     */
    public String getEmailFromToken(String token) {
        return tokenProvider.getEmailFromToken(token);
    }

    /**
     * Gets current user details by user ID.
     *
     * @param userId The user ID
     * @return UserDto containing user details
     */
    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Refreshes a JWT token.
     *
     * @param oldToken The old JWT token
     * @return New JWT token
     */
    public String refreshToken(String oldToken) {
        // Validate old token
        if (!tokenProvider.validateToken(oldToken)) {
            throw new IllegalArgumentException("Invalid token");
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

        logger.info("Token refreshed for user: {}", user.getEmail());
        return newToken;
    }

    /**
     * Checks if an email is already registered.
     *
     * @param email The email to check
     * @return true if email is available, false if already taken
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * Updates user password (for internal use by user-service).
     * This method should only be called through authenticated internal endpoints.
     *
     * @param email The user's email
     * @param newPassword The new password (will be encoded)
     * @return true if password was updated, false if user not found
     */
    @Transactional
    public boolean updatePassword(String email, String newPassword) {
        logger.info("Updating password for email: {}", email);

        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    logger.info("Password successfully updated for user: {}", email);
                    return true;
                })
                .orElseGet(() -> {
                    logger.warn("Attempted to update password for non-existent user: {}", email);
                    return false;
                });
    }
}
