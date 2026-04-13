package com.toolsharing.user_service.controller;

import com.toolsharing.user_service.dto.*;
import com.toolsharing.user_service.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Fetching profile for user: {}", userId);
        UserProfileDto profile = userService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get user by ID (for other services)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserById(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) Long requestingUserId) {

        logger.info("Fetching profile for user: {}", userId);
        UserProfileDto profile = userService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get user by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserProfileDto> getUserByEmail(
            @PathVariable String email,
            @RequestHeader(value = "X-User-Id", required = false) Long requestingUserId) {

        logger.info("Fetching profile for email: {}", email);
        UserProfileDto profile = userService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {

        logger.info("Updating profile for user: {}", userId);
        UserProfileDto updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Upload profile picture
     */
    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        if (file == null || file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No file provided");
            error.put("message", "Please select a file to upload");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File too large");
            error.put("message", "File size must be less than 5MB");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid file type");
            error.put("message", "Only image files are allowed (JPEG, PNG, GIF)");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            logger.info("Uploading profile picture for user: {}", userId);
            String imageUrl = userService.uploadProfilePicture(userId, file);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Profile picture uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid request");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (IOException e) {
            logger.error("Failed to upload profile picture", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image");
            error.put("message", "Server error while processing file");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Sync user from auth service
     */
    @PostMapping("/sync")
    public ResponseEntity<Void> syncUser(@RequestBody UserAuthDto authUser) {
        logger.info("Syncing user from auth: {}", authUser.getEmail());
        userService.syncUserFromAuth(authUser);
        return ResponseEntity.ok().build();
    }

    /**
     * Check if user exists (public endpoint)
     */
    @GetMapping("/exists/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkUserExists(@PathVariable Long userId) {
        boolean exists = userService.checkUserExists(userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if user exists by email
     */
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Map<String, Boolean>> checkUserExistsByEmail(@PathVariable String email) {
        boolean exists = userService.checkUserExistsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint hit by the React Frontend to verify the token
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        boolean isVerified = userService.verifyEmailToken(token);

        Map<String, String> response = new HashMap<>();
        if (isVerified) {
            response.put("message", "Email verified successfully!");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Invalid or expired verification link.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Endpoint to manually trigger the verification email (Useful for testing)
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@RequestHeader("X-User-Id") Long userId) {
        UserProfileDto profile = userService.getProfileByUserId(userId);

        if (!profile.getEmailVerified()) {
            userService.sendVerificationEmail(userId, profile.getEmail(), profile.getName());
        }

        return ResponseEntity.ok().build();
    }
}