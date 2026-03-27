package com.toolsharing.auth_service.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSyncDto {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Boolean isActive;
}