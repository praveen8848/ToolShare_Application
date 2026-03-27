package com.toolsharing.user_service.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phoneNumber;

    @Size(max = 500, message = "Address must be less than 500 characters")
    private String address;

    @Size(max = 1000, message = "Bio must be less than 1000 characters")
    private String bio;

    private String preferences; // JSON string
}