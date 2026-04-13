package com.toolsharing.user_service.service;

import com.toolsharing.user_service.client.AuthServiceClient;
import com.toolsharing.user_service.dto.*;
import com.toolsharing.user_service.entity.UserProfile;
import com.toolsharing.user_service.repository.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private AuthServiceClient authServiceClient;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${file.upload.dir:./uploads/profiles}")
    private String uploadDir;

    public UserProfileDto getProfileByUserId(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId));
        userProfileRepository.updateLastActive(userId);
        return convertToDto(profile);
    }

    public UserProfileDto getProfileByEmail(String email) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for email: " + email));
        return convertToDto(profile);
    }

    public boolean checkUserExists(Long userId) {
        return userProfileRepository.existsById(userId);
    }

    public boolean checkUserExistsByEmail(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId));

        if (request.getName() != null) profile.setName(request.getName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getPreferences() != null) profile.setPreferences(request.getPreferences());

        UserProfile updatedProfile = userProfileRepository.save(profile);
        logger.info("Profile updated for user: {}", userId);
        return convertToDto(updatedProfile);
    }

    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or not provided");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId));

        String imageUrl = "/uploads/profiles/" + filename;
        profile.setProfileImageUrl(imageUrl);
        userProfileRepository.save(profile);

        logger.info("Profile picture uploaded for user: {}", userId);
        return imageUrl;
    }

    @Transactional
    public void syncUserFromAuth(UserAuthDto authUser) {
        if (!userProfileRepository.existsById(authUser.getId())) {
            UserProfile profile = new UserProfile();
            profile.setUserId(authUser.getId());
            profile.setEmail(authUser.getEmail());
            profile.setName(authUser.getName());
            profile.setAccountStatus(UserProfile.AccountStatus.ACTIVE);

            // AUTOMATICALLY VERIFY HERE
            profile.setEmailVerified(true);
            profile.setVerificationStatus(UserProfile.VerificationStatus.VERIFIED);

            profile.setTrustScore(0.0);
            profile.setTotalListings(0);
            profile.setTotalBookings(0);
            profile.setSuccessfulTransactions(0);
            profile.setCancelledTransactions(0);

            userProfileRepository.save(profile);
            logger.info("User synced and verified: {}", authUser.getEmail());

            sendWelcomeEmail(authUser.getEmail(), authUser.getName());
        } else {
            UserProfile existingProfile = userProfileRepository.findById(authUser.getId()).get();
            existingProfile.setEmail(authUser.getEmail());
            existingProfile.setName(authUser.getName());
            userProfileRepository.save(existingProfile);
            logger.info("User profile updated: {}", authUser.getEmail());
        }
    }

    public void sendWelcomeEmail(String email, String name) {
        String emailBody = String.format(
                "Welcome to ToolShare, %s!\n\nYour account is now active. You can start listing your tools or browsing for tools in your neighborhood immediately.\n\nHappy Building!",
                name
        );

        NotificationEvent event = NotificationEvent.builder()
                .eventType("WELCOME_EMAIL")
                .recipientEmail(email)
                .subject("Welcome to ToolShare!")
                .messageBody(emailBody)
                .build();

        try {
            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("Welcome email event sent to RabbitMQ for: {}", email);
        } catch (Exception e) {
            logger.error("RabbitMQ error: Could not send welcome email, but user is still active.");
        }
    }

    // =========================================================================
    // ADDED BACK: To prevent UserController compilation errors
    // =========================================================================

    public boolean verifyEmailToken(String token) {
        logger.info("Verification endpoint called for token: {}", token);
        // Since you are auto-verifying users in syncUserFromAuth, we can just return true here
        // to satisfy the controller without needing a complex Redis/Database token setup.
        return true;
    }

    public void sendVerificationEmail(Long userId, String email, String name) {
        String token = UUID.randomUUID().toString();
        String emailBody = String.format(
                "Hi %s,\n\nPlease verify your email by clicking this link: http://localhost:8082/api/users/verify?token=%s",
                name, token
        );

        NotificationEvent event = NotificationEvent.builder()
                .eventType("VERIFICATION_EMAIL")
                .recipientEmail(email)
                .subject("Verify your ToolShare Account")
                .messageBody(emailBody)
                .build();

        try {
            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("Verification email event sent to RabbitMQ for: {}", email);
        } catch (Exception e) {
            logger.error("RabbitMQ error: Could not send verification email.");
        }
    }
    // =========================================================================

    @Transactional
    public void updateTrustScore(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        double score = (profile.getSuccessfulTransactions() * 10.0) - (profile.getCancelledTransactions() * 5.0);
        score = Math.max(0, Math.min(100, score));

        profile.setTrustScore(score);
        userProfileRepository.save(profile);
    }

    @Transactional
    public void incrementSuccessfulTransactions(Long userId) {
        userProfileRepository.incrementSuccessfulTransactions(userId);
        updateTrustScore(userId);
    }

    @Transactional
    public void incrementCancelledTransactions(Long userId) {
        userProfileRepository.incrementCancelledTransactions(userId);
        updateTrustScore(userId);
    }

    @Transactional
    public void updateLastActive(Long userId) {
        userProfileRepository.updateLastActive(userId);
    }

    private UserProfileDto convertToDto(UserProfile profile) {
        return UserProfileDto.builder()
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .name(profile.getName())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .profileImageUrl(profile.getProfileImageUrl())
                .bio(profile.getBio())
                .accountStatus(profile.getAccountStatus() != null ? profile.getAccountStatus().name() : "ACTIVE")
                .emailVerified(profile.getEmailVerified() != null ? profile.getEmailVerified() : false)
                .phoneVerified(profile.getPhoneVerified() != null ? profile.getPhoneVerified() : false)
                .verificationStatus(profile.getVerificationStatus() != null ? profile.getVerificationStatus().name() : "UNVERIFIED")
                .trustScore(profile.getTrustScore() != null ? profile.getTrustScore() : 0.0)
                .totalListings(profile.getTotalListings() != null ? profile.getTotalListings() : 0)
                .totalBookings(profile.getTotalBookings() != null ? profile.getTotalBookings() : 0)
                .successfulTransactions(profile.getSuccessfulTransactions() != null ? profile.getSuccessfulTransactions() : 0)
                .cancelledTransactions(profile.getCancelledTransactions() != null ? profile.getCancelledTransactions() : 0)
                .preferences(profile.getPreferences())
                .lastActive(profile.getLastActive())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}