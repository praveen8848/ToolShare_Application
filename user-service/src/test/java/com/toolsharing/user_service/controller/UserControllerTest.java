package com.toolsharing.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolsharing.user_service.dto.UpdateProfileRequest;
import com.toolsharing.user_service.dto.UserProfileDto;
import com.toolsharing.user_service.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void getProfile_WhenHeaderPresent_ShouldReturnProfile() throws Exception {
        UserProfileDto dto = UserProfileDto.builder()
                .userId(1L)
                .email("test@example.com")
                .name("Test User")
                .role("USER")
                .build();

        when(userService.getProfileByUserId(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/users/profile").header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getUserById_WhenSameUser_ShouldReturnProfile() throws Exception {
        UserProfileDto dto = UserProfileDto.builder()
                .userId(1L)
                .email("test@example.com")
                .name("Test User")
                .role("USER")
                .build();

        when(userService.getProfileByUserId(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/users/1").header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    void getUserById_WhenDifferentUserAndNotAdmin_ShouldReturnForbidden() throws Exception {
        UserProfileDto requesterProfile = UserProfileDto.builder()
                .userId(2L)
                .role("USER")
                .build();

        when(userService.getProfileByUserId(2L)).thenReturn(requesterProfile);

        mockMvc.perform(get("/api/users/1").header("X-User-Id", "2"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserById_WhenDifferentUserAndAdmin_ShouldReturnProfile() throws Exception {
        UserProfileDto targetProfile = UserProfileDto.builder()
                .userId(1L)
                .email("target@example.com")
                .role("USER")
                .build();

        UserProfileDto adminProfile = UserProfileDto.builder()
                .userId(99L)
                .role("ADMIN")
                .build();

        when(userService.getProfileByUserId(99L)).thenReturn(adminProfile);
        when(userService.getProfileByUserId(1L)).thenReturn(targetProfile);

        mockMvc.perform(get("/api/users/1").header("X-User-Id", "99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("target@example.com"));
    }

    @Test
    void updateProfile_WhenValidRequest_ShouldReturnUpdated() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("New Name");

        UserProfileDto updatedDto = UserProfileDto.builder()
                .userId(1L)
                .name("New Name")
                .build();

        when(userService.updateProfile(eq(1L), any(UpdateProfileRequest.class))).thenReturn(updatedDto);

        mockMvc.perform(put("/api/users/profile")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    void verifyEmailOtp_WhenValid_ShouldReturn200() throws Exception {
        when(userService.verifyRegistrationOtp("test@example.com", "123456")).thenReturn(true);

        mockMvc.perform(post("/api/users/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "test@example.com", "otp", "123456"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully!"));
    }
}
