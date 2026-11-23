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

/**
 * REST controller for user profile management.
 * Handles profile operations, picture uploads, and user verification.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Get current user profile.
     * GET /api/users/profile
     *
     * @param userId The authenticated user's ID from X-User-Id header
     * @return UserProfileDto containing the user's profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@RequestHeader("X-User-Id") Long userId) {
        logger.info("Fetching profile for user: {}", userId);
        UserProfileDto profile = userService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get user by ID.
     * GET /api/users/{userId}
     *
     * SECURITY FIX: Added authorization check to prevent unauthorized access to user profiles.
     * Only the user themselves or admins can access full profile details.
     *
     * @param userId The ID of the user to retrieve
     * @param requestingUserId The ID of the user making the request
     * @return UserProfileDto containing the user's profile information
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long userId,
            @RequestHeader(value = "X-User-Id", required = false) Long requestingUserId) {

        logger.info("Fetching profile for user: {} requested by: {}", userId, requestingUserId);

        // SECURITY FIX: Authorization check
        if (requestingUserId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Allow users to access their own profile
        if (!userId.equals(requestingUserId)) {
            // For other users, check if requester is admin
            UserProfileDto requesterProfile = userService.getProfileByUserId(requestingUserId);
            if (requesterProfile == null || !"ADMIN".equals(requesterProfile.getRole())) {
                logger.warn("User {} attempted to access user {} profile without authorization",
                    requestingUserId, userId);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Access denied. You can only access your own profile.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
        }

        UserProfileDto profile = userService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get user by email.
     * GET /api/users/email/{email}
     *
     * SECURITY FIX: Added authorization check to prevent unauthorized access.
     *
     * @param email The email of the user to retrieve
     * @param requestingUserId The ID of the user making the request
     * @return UserProfileDto containing the user's profile information
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(
            @PathVariable String email,
            @RequestHeader(value = "X-User-Id", required = false) Long requestingUserId) {

        logger.info("Fetching profile for email: {} requested by: {}", email, requestingUserId);

        // SECURITY FIX: Authorization check
        if (requestingUserId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        UserProfileDto profile = userService.getProfileByEmail(email);

        if (profile != null) {
            // Allow users to access their own profile
            if (!profile.getUserId().equals(requestingUserId)) {
                // For other users, check if requester is admin
                UserProfileDto requesterProfile = userService.getProfileByUserId(requestingUserId);
                if (requesterProfile == null || !"ADMIN".equals(requesterProfile.getRole())) {
                    logger.warn("User {} attempted to access user {} profile by email without authorization",
                        requestingUserId, profile.getUserId());
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Access denied. You can only access your own profile.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }
        }

        return ResponseEntity.ok(profile);
    }

    /**
     * Update user profile.
     * PUT /api/users/profile
     *
     * @param userId The authenticated user's ID from X-User-Id header
     * @param request The update request containing new profile data
     * @return Updated UserProfileDto
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
     * Upload profile picture.
     * POST /api/users/profile/picture
     *
     * @param userId The authenticated user's ID from X-User-Id header
     * @param file The image file to upload
     * @return Response with the uploaded image URL
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
     * Sync user from auth service (internal use).
     * POST /api/users/sync
     *
     * @param authUser The user data from auth service
     * @return Success response
     */
    @PostMapping("/sync")
    public ResponseEntity<Void> syncUser(@RequestBody UserAuthDto authUser) {
        logger.info("Syncing user from auth: {}", authUser.getEmail());
        userService.syncUserFromAuth(authUser);
        return ResponseEntity.ok().build();
    }

    /**
     * Check if user exists (public endpoint for inter-service communication).
     * GET /api/users/exists/{userId}
     *
     * @param userId The user ID to check
     * @return Map with exists boolean
     */
    @GetMapping("/exists/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkUserExists(@PathVariable Long userId) {
        boolean exists = userService.checkUserExists(userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if user exists by email.
     * GET /api/users/exists/email/{email}
     *
     * @param email The email to check
     * @return Map with exists boolean
     */
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Map<String, Boolean>> checkUserExistsByEmail(@PathVariable String email) {
        boolean exists = userService.checkUserExistsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    // =========================================================================
    // OTP & PASSWORD RESET ENDPOINTS
    // =========================================================================

    /**
     * Verify Registration OTP.
     * POST /api/users/verify-email
     *
     * @param request Map containing email and otp
     * @return Success or error response
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        boolean isVerified = userService.verifyRegistrationOtp(email, otp);

        if (isVerified) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email verified successfully!");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid or expired OTP");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Request Password Reset OTP.
     * POST /api/users/forgot-password
     *
     * @param request Map containing email
     * @return Success response (always returns success for security)
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Triggers the email if user exists, but always returns 200 OK for security
        // (prevents hackers from checking which emails are registered)
        userService.requestPasswordReset(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "If that email exists, a reset code has been sent.");
        return ResponseEntity.ok(response);
    }

    /**
     * Verify OTP and Set New Password.
     * POST /api/users/reset-password
     *
     * @param request Map containing email, otp, and newPassword
     * @return Success or error response
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        boolean isReset = userService.verifyPasswordResetOtpAndChangePassword(email, otp, newPassword);

        if (isReset) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password has been reset successfully. You can now login.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid OTP or OTP has expired.");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
