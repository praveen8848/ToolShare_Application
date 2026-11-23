package com.toolsharing.user_service.service;

import com.toolsharing.user_service.client.AuthServiceClient;
import com.toolsharing.user_service.dto.UpdateProfileRequest;
import com.toolsharing.user_service.dto.UserAuthDto;
import com.toolsharing.user_service.dto.UserProfileDto;
import com.toolsharing.user_service.entity.UserProfile;
import com.toolsharing.user_service.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private AuthServiceClient authServiceClient;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserProfile sampleProfile;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "internalServiceSecret", "toolshare-internal-secure-secret-key-2026");
        ReflectionTestUtils.setField(userService, "uploadDir", "./target/test-uploads");

        sampleProfile = new UserProfile();
        sampleProfile.setUserId(1L);
        sampleProfile.setEmail("test@example.com");
        sampleProfile.setName("Test User");
        sampleProfile.setRole("USER");
        sampleProfile.setAccountStatus(UserProfile.AccountStatus.ACTIVE);
        sampleProfile.setEmailVerified(false);
        sampleProfile.setVerificationStatus(UserProfile.VerificationStatus.UNVERIFIED);
        sampleProfile.setCurrentOtp("hashedOtp123");
        sampleProfile.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
    }

    @Test
    void getProfileByUserId_WhenUserExists_ShouldReturnDto() {
        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));

        UserProfileDto result = userService.getProfileByUserId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getName());
        verify(userProfileRepository).updateLastActive(1L);
    }

    @Test
    void getProfileByUserId_WhenUserNotFound_ShouldThrowNotFound() {
        when(userProfileRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getProfileByUserId(99L));
    }

    @Test
    void updateProfile_WhenUserExists_ShouldUpdateFields() {
        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(sampleProfile);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Updated Name");
        request.setBio("New Bio");
        request.setPhoneNumber("1234567890");

        UserProfileDto updated = userService.updateProfile(1L, request);

        assertNotNull(updated);
        assertEquals("Updated Name", sampleProfile.getName());
        assertEquals("New Bio", sampleProfile.getBio());
        verify(userProfileRepository).save(sampleProfile);
    }

    @Test
    void syncUserFromAuth_WhenNewUser_ShouldCreateProfileAndSendWelcomeNotification() {
        when(userProfileRepository.existsById(2L)).thenReturn(false);

        UserAuthDto authDto = UserAuthDto.builder()
                .id(2L)
                .email("new@example.com")
                .name("New User")
                .role("USER")
                .build();

        userService.syncUserFromAuth(authDto);

        verify(userProfileRepository).save(any(UserProfile.class));
        verify(rabbitTemplate).convertAndSend(eq("toolshare_exchange"), eq("notification_routing_key"), any(Object.class));
    }

    @Test
    void verifyRegistrationOtp_WhenOtpMatches_ShouldVerifyUser() {
        when(userProfileRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleProfile));
        when(passwordEncoder.matches("123456", "hashedOtp123")).thenReturn(true);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(sampleProfile);

        boolean result = userService.verifyRegistrationOtp("test@example.com", "123456");

        assertTrue(result);
        assertTrue(sampleProfile.getEmailVerified());
        assertEquals(UserProfile.VerificationStatus.VERIFIED, sampleProfile.getVerificationStatus());
        assertNull(sampleProfile.getCurrentOtp());
        verify(userProfileRepository).save(sampleProfile);
    }

    @Test
    void verifyRegistrationOtp_WhenOtpWrong_ShouldReturnFalse() {
        when(userProfileRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleProfile));
        when(passwordEncoder.matches("wrongOtp", "hashedOtp123")).thenReturn(false);

        boolean result = userService.verifyRegistrationOtp("test@example.com", "wrongOtp");

        assertFalse(result);
        assertFalse(sampleProfile.getEmailVerified());
    }

    @Test
    void verifyPasswordResetOtpAndChangePassword_WhenOtpValid_ShouldCallAuthService() {
        when(userProfileRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleProfile));
        when(passwordEncoder.matches("123456", "hashedOtp123")).thenReturn(true);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(sampleProfile);

        boolean result = userService.verifyPasswordResetOtpAndChangePassword("test@example.com", "123456", "newPass123");

        assertTrue(result);
        verify(authServiceClient).updatePassword("toolshare-internal-secure-secret-key-2026", "test@example.com", "newPass123");
        assertNull(sampleProfile.getCurrentOtp());
    }

    @Test
    void verifyPasswordResetOtpAndChangePassword_WhenOtpInvalid_ShouldReturnFalse() {
        when(userProfileRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleProfile));
        when(passwordEncoder.matches("wrongOtp", "hashedOtp123")).thenReturn(false);

        boolean result = userService.verifyPasswordResetOtpAndChangePassword("test@example.com", "wrongOtp", "newPass123");

        assertFalse(result);
        verify(authServiceClient, never()).updatePassword(any(), any(), any());
    }
}
