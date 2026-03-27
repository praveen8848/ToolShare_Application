package com.toolsharing.user_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserAuthDto {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Boolean isActive;
}