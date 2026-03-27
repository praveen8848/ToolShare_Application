package com.toolsharing.auth_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private UserDto user;
}