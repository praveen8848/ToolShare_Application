package com.toolsharing.user_service.service;

import com.toolsharing.user_service.client.AuthServiceClient;
import com.toolsharing.user_service.dto.*;
import com.toolsharing.user_service.entity.UserProfile;
import com.toolsharing.user_service.repository.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private AuthServiceClient authServiceClient;

    @Value("${file.upload.dir:./uploads/profiles}")
    private String uploadDir;

    // Update getProfileByUserId method
    public UserProfileDto getProfileByUserId(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId));

        // Update last active
        userProfileRepository.updateLastActive(userId);

        return convertToDto(profile);
    }
    // Update getProfileByEmail method
    public UserProfileDto getProfileByEmail(String email) {
        UserProfile profile = userProfileRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for email: " + email));

        return convertToDto(profile);
    }
    /**
     * Check if user exists by ID
     */
    public boolean checkUserExists(Long userId) {
        return userProfileRepository.existsById(userId);
    }

    /**
     * Check if user exists by email
     */
    public boolean checkUserExistsByEmail(String email) {
        return userProfileRepository.existsByEmail(email);
    }

    // Update updateProfile method
    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found for ID: " + userId));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getPreferences() != null) {
            profile.setPreferences(request.getPreferences());
        }

        UserProfile updatedProfile = userProfileRepository.save(profile);
        logger.info("Profile updated for user: {}", userId);

        return convertToDto(updatedProfile);
    }

    // Update uploadProfilePicture method
    @Transactional
    public String uploadProfilePicture(Long userId, MultipartFile file) throws IOException {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or not provided");
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Update profile with image URL
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
            profile.setVerificationStatus(UserProfile.VerificationStatus.UNVERIFIED);
            profile.setTrustScore(0.0);
            profile.setTotalListings(0);
            profile.setTotalBookings(0);
            profile.setSuccessfulTransactions(0);
            profile.setCancelledTransactions(0);

            userProfileRepository.save(profile);
            logger.info("User synced from auth service: {}", authUser.getEmail());
        } else {
            // Update existing profile with latest info from auth
            UserProfile existingProfile = userProfileRepository.findById(authUser.getId()).get();
            existingProfile.setEmail(authUser.getEmail());
            existingProfile.setName(authUser.getName());
            userProfileRepository.save(existingProfile);
            logger.info("User profile updated from auth service: {}", authUser.getEmail());
        }
    }

    @Transactional
    public void updateTrustScore(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        // Calculate trust score based on transaction history
        // Formula: successful transactions * 10 - cancelled transactions * 5
        double score = (profile.getSuccessfulTransactions() * 10.0) -
                (profile.getCancelledTransactions() * 5.0);

        // Normalize to 0-100 range
        score = Math.max(0, Math.min(100, score));

        profile.setTrustScore(score);
        userProfileRepository.save(profile);

        logger.info("Trust score updated for user: {} -> {}", userId, score);
    }

    @Transactional
    public void incrementSuccessfulTransactions(Long userId) {
        userProfileRepository.incrementSuccessfulTransactions(userId);
        updateTrustScore(userId);
        logger.info("Incremented successful transactions for user: {}", userId);
    }

    @Transactional
    public void incrementCancelledTransactions(Long userId) {
        userProfileRepository.incrementCancelledTransactions(userId);
        updateTrustScore(userId);
        logger.info("Incremented cancelled transactions for user: {}", userId);
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