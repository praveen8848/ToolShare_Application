package com.toolsharing.user_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationEvent {
    private Long userId;
    private String email;
    private String name;
    private String role;
    private Long timestamp;
}