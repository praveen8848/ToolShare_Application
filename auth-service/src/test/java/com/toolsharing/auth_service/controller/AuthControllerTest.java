package com.toolsharing.auth_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolsharing.auth_service.dto.LoginRequest;
import com.toolsharing.auth_service.dto.LoginResponse;
import com.toolsharing.auth_service.dto.RegisterRequest;
import com.toolsharing.auth_service.dto.UserDto;
import com.toolsharing.auth_service.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void registerUser_WhenValidRequest_ShouldReturn200() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password123");

        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role("USER")
                .isActive(true)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(userDto);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void authenticateUser_WhenValidCredentials_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");

        LoginResponse response = LoginResponse.builder()
                .token("jwt-token-xyz")
                .tokenType("Bearer")
                .user(UserDto.builder().id(1L).email("john@example.com").name("John Doe").build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-xyz"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void authenticateUser_WhenInvalidCredentials_ShouldReturn401() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("wrongpassword");

        when(authService.login(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void checkEmailAvailability_ShouldReturnAvailabilityStatus() throws Exception {
        when(authService.isEmailAvailable("available@example.com")).thenReturn(true);

        mockMvc.perform(get("/api/auth/check-email").param("email", "available@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void updatePassword_WhenInvalidInternalSecret_ShouldReturn403() throws Exception {
        mockMvc.perform(put("/api/auth/internal/update-password")
                        .header("X-Internal-Secret", "wrong-secret")
                        .param("email", "john@example.com")
                        .param("password", "newpassword"))
                .andExpect(status().isForbidden());
    }

    @Test
    void updatePassword_WhenValidInternalSecret_ShouldReturn200() throws Exception {
        when(authService.updatePassword("john@example.com", "newpassword")).thenReturn(true);

        mockMvc.perform(put("/api/auth/internal/update-password")
                        .header("X-Internal-Secret", "toolshare-internal-secure-secret-key-2026")
                        .param("email", "john@example.com")
                        .param("password", "newpassword"))
                .andExpect(status().isOk());
    }
}
