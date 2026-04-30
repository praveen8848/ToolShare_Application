package com.toolsharing.user_service.service;

import com.toolsharing.user_service.client.AuthServiceClient;
import com.toolsharing.user_service.dto.*;
import com.toolsharing.user_service.entity.UserProfile;
import com.toolsharing.user_service.repository.UserProfileRepository;
import com.toolsharing.user_service.util.OtpGenerator;
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
import java.time.LocalDateTime;
import java.util.Optional;
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
        Optional<UserProfile> optionalProfile = userProfileRepository.findById(userId);
        if (!optionalProfile.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId);
        }

        UserProfile profile = optionalProfile.get();
        userProfileRepository.updateLastActive(userId);
        return convertToDto(profile);
    }

    public UserProfileDto getProfileByEmail(String email) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByEmail(email);
        if (!optionalProfile.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for email: " + email);
        }

        return convertToDto(optionalProfile.get());
    }

    public boolean checkUserExists(Long userId) {
        return userProfileRepository.existsById(userId);
    }

    public boolean checkUserExistsByEmail(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findById(userId);
        if (!optionalProfile.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId);
        }

        UserProfile profile = optionalProfile.get();

        if (request.getName() != null) profile.setName(request.getName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getBio() != null) profile.setBio(request.getBio());

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

        Optional<UserProfile> optionalProfile = userProfileRepository.findById(userId);
        if (!optionalProfile.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId);
        }

        UserProfile profile = optionalProfile.get();
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

            // Set to UNVERIFIED for OTP flow
            profile.setEmailVerified(false);
            profile.setVerificationStatus(UserProfile.VerificationStatus.UNVERIFIED);

            profile.setTrustScore(0.0);
            profile.setTotalListings(0);
            profile.setTotalBookings(0);

            // Generate Registration OTP
            String otp = OtpGenerator.generateSixDigitOtp();
            profile.setCurrentOtp(otp);
            profile.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

            userProfileRepository.save(profile);
            logger.info("User synced and pending verification: {}", authUser.getEmail());

            // 🛠️ FIX: Custom body for Registration
            String emailBody = String.format(
                    "Hi %s,\n\nYour account verification code is: %s\n\nThis code will expire in 10 minutes.",
                    authUser.getName(), otp
            );
            sendNotification(authUser.getEmail(), "Verify your ToolShare Account", emailBody, "VERIFICATION_EMAIL");

        } else {
            Optional<UserProfile> optionalProfile = userProfileRepository.findById(authUser.getId());
            if (optionalProfile.isPresent()) {
                UserProfile existingProfile = optionalProfile.get();
                existingProfile.setEmail(authUser.getEmail());
                existingProfile.setName(authUser.getName());
                userProfileRepository.save(existingProfile);
                logger.info("User profile updated: {}", authUser.getEmail());
            }
        }
    }

    // =========================================================================
    // OTP & NOTIFICATION LOGIC
    // =========================================================================

    // 🛠️ FIX: Made this generic so it accepts ANY email body
    private void sendNotification(String email, String subject, String messageBody, String eventType) {
        NotificationEvent event = NotificationEvent.builder()
                .eventType(eventType)
                .recipientEmail(email)
                .subject(subject)
                .messageBody(messageBody) // Pass the custom body here!
                .build();

        try {
            rabbitTemplate.convertAndSend("toolshare_exchange", "notification_routing_key", event);
            logger.info("{} event sent to RabbitMQ for: {}", eventType, email);
        } catch (Exception e) {
            logger.error("RabbitMQ error: Could not send email to {}", email, e);
        }
    }

    @Transactional
    public boolean verifyRegistrationOtp(String email, String otp) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByEmail(email);
        if (!optionalProfile.isPresent()) {
            return false;
        }

        UserProfile profile = optionalProfile.get();

        if (profile.getCurrentOtp() == null || !profile.getCurrentOtp().equals(otp)) {
            return false;
        }

        if (profile.getOtpExpiry() != null && profile.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return false; // OTP expired
        }

        // Success: Mark as verified and clear OTP
        profile.setEmailVerified(true);
        profile.setVerificationStatus(UserProfile.VerificationStatus.VERIFIED);
        profile.setCurrentOtp(null);
        profile.setOtpExpiry(null);
        userProfileRepository.save(profile);

        logger.info("User email verified successfully: {}", email);

        // 🛠️ FIX: Beautiful, custom welcome email body
        String welcomeBody = String.format(
                "Hi %s,\n\nWelcome to ToolShare! Your account has been successfully verified. You are now ready to start exploring and sharing tools!\n\nHappy building!",
                profile.getName()
        );
        sendNotification(email, "Welcome to ToolShare!", welcomeBody, "WELCOME_EMAIL");

        return true;
    }

    @Transactional
    public void requestPasswordReset(String email) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByEmail(email);
        if (optionalProfile.isPresent()) {
            UserProfile profile = optionalProfile.get();
            String otp = OtpGenerator.generateSixDigitOtp();
            profile.setCurrentOtp(otp);
            profile.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
            userProfileRepository.save(profile);

            // 🛠️ FIX: Custom body for Password Reset
            String emailBody = String.format(
                    "Hi %s,\n\nYour password reset code is: %s\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.",
                    profile.getName(), otp
            );
            sendNotification(email, "ToolShare Password Reset Code", emailBody, "PASSWORD_RESET_EMAIL");
        }
    }

    @Transactional
    public boolean verifyPasswordResetOtpAndChangePassword(String email, String otp, String newPassword) {
        Optional<UserProfile> optionalProfile = userProfileRepository.findByEmail(email);
        if (!optionalProfile.isPresent()) {
            logger.warn("Password reset failed: No user found for email {}", email);
            return false;
        }

        UserProfile profile = optionalProfile.get();

        if (profile.getCurrentOtp() == null || !profile.getCurrentOtp().trim().equals(otp.trim())) {
            logger.warn("Password reset failed: OTP mismatch for {}. DB: '{}', Input: '{}'",
                    email, profile.getCurrentOtp(), otp);
            return false;
        }

        if (profile.getOtpExpiry() != null && profile.getOtpExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("Password reset failed: OTP expired for {}", email);
            return false;
        }

        try {
            logger.info("OTP verified successfully for {}. Attempting to call Auth Service...", email);

            authServiceClient.updatePassword(email, newPassword);

            profile.setCurrentOtp(null);
            profile.setOtpExpiry(null);
            userProfileRepository.save(profile);

            logger.info("Password successfully reset for: {}", email);
            return true;

        } catch (Exception e) {
            logger.error("CRITICAL: OTP was correct, but Auth Service rejected the password update for {}. Error: {}", email, e.getMessage());
            throw new RuntimeException("OTP is correct, but the Auth Service failed to update the password.");
        }
    }

    // =========================================================================

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
                .lastActive(profile.getLastActive())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}