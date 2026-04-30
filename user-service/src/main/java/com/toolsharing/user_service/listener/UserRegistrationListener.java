package com.toolsharing.user_service.listener;

import com.toolsharing.user_service.dto.UserAuthDto;
import com.toolsharing.user_service.entity.UserProfile;
import com.toolsharing.user_service.event.UserRegistrationEvent;
import com.toolsharing.user_service.repository.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserRegistrationListener {

    private static final Logger logger = LoggerFactory.getLogger(UserRegistrationListener.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    @EventListener
    @Transactional
    public void handleUserRegistration(UserRegistrationEvent event) {
        logger.info("Received user registration event for user: {}", event.getEmail());

        // Check if profile already exists
        if (userProfileRepository.existsById(event.getUserId())) {
            logger.info("User profile already exists for: {}", event.getEmail());
            return;
        }

        // Create profile from event
        UserProfile profile = new UserProfile();
        profile.setUserId(event.getUserId());
        profile.setEmail(event.getEmail());
        profile.setName(event.getName());
        profile.setAccountStatus(UserProfile.AccountStatus.ACTIVE);
        profile.setVerificationStatus(UserProfile.VerificationStatus.UNVERIFIED);
        profile.setTrustScore(0.0);
        profile.setTotalListings(0);
        profile.setTotalBookings(0);
//        profile.setSuccessfulTransactions(0);
//        profile.setCancelledTransactions(0);

        userProfileRepository.save(profile);

        logger.info("User profile created for: {}", event.getEmail());
    }
}