package com.toolsharing.user_service.client;

import com.toolsharing.user_service.dto.UserAuthDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service", url = "${auth.service.url:http://localhost:8081}")
public interface AuthServiceClient {

    @GetMapping("/api/auth/users/{id}")
    UserAuthDto getUserById(@PathVariable("id") Long id);

    @PostMapping("/api/auth/users/sync")
    void syncUser(@RequestBody UserAuthDto userAuthDto);

    @PostMapping("/api/auth/validate")
    TokenValidationResponse validateToken(@RequestHeader("Authorization") String token);
}

record TokenValidationResponse(boolean valid, Long userId, String email, String name, String role) {}