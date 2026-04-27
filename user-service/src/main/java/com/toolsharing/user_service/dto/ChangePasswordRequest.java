//package com.toolsharing.user_service.dto;
//
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.Size;
//import lombok.Data;
//
//@Data
//public class ChangePasswordRequest {
//
//    @NotBlank(message = "Current password is required")
//    private String currentPassword;
//
//    @NotBlank(message = "New password is required")
//    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
//    private String newPassword;
//
//    @NotBlank(message = "Confirm password is required")
//    private String confirmPassword;
//}