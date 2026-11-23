package com.toolsharing.auth_service.service;

import com.toolsharing.auth_service.client.UserServiceClient;
import com.toolsharing.auth_service.dto.LoginRequest;
import com.toolsharing.auth_service.dto.LoginResponse;
import com.toolsharing.auth_service.dto.RegisterRequest;
import com.toolsharing.auth_service.dto.UserDto;
import com.toolsharing.auth_service.entity.User;
import com.toolsharing.auth_service.repository.UserRepository;
import com.toolsharing.auth_service.security.JwtTokenProvider;
import com.toolsharing.auth_service.security.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private LoginRateLimiter loginRateLimiter;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Test User");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPassword("encodedPassword");
        sampleUser.setRole("USER");
        sampleUser.setIsActive(true);
        sampleUser.setCreatedAt(LocalDateTime.now());

        registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void register_WhenEmailAvailable_ShouldRegisterUserSuccessfully() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserDto result = authService.register(registerRequest);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test User", result.getName());
        verify(userRepository).save(any(User.class));
        verify(userServiceClient).syncUser(any());
    }

    @Test
    void register_WhenEmailAlreadyExists_ShouldThrowIllegalArgumentException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_WhenCredentialsValid_ShouldReturnLoginResponse() {
        Authentication auth = mock(Authentication.class);
        when(loginRateLimiter.isLocked("test@example.com")).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked-jwt-token");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("test@example.com", response.getUser().getEmail());
        verify(loginRateLimiter).recordSuccess("test@example.com");
    }

    @Test
    void login_WhenAccountIsLocked_ShouldThrowLockedException() {
        when(loginRateLimiter.isLocked("test@example.com")).thenReturn(true);

        assertThrows(LockedException.class, () -> authService.login(loginRequest));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void login_WhenBadCredentials_ShouldRecordFailureAndThrow() {
        when(loginRateLimiter.isLocked("test@example.com")).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
        verify(loginRateLimiter).recordFailure("test@example.com");
    }

    @Test
    void updatePassword_WhenUserExists_ShouldUpdatePassword() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        boolean updated = authService.updatePassword("test@example.com", "newPassword");

        assertTrue(updated);
        verify(userRepository).save(sampleUser);
    }

    @Test
    void updatePassword_WhenUserNotFound_ShouldReturnFalse() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        boolean updated = authService.updatePassword("unknown@example.com", "newPassword");

        assertFalse(updated);
        verify(userRepository, never()).save(any());
    }

    @Test
    void isEmailAvailable_ShouldReturnCorrectStatus() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);
        when(userRepository.existsByEmail("available@example.com")).thenReturn(false);

        assertFalse(authService.isEmailAvailable("test@example.com"));
        assertTrue(authService.isEmailAvailable("available@example.com"));
    }
}
