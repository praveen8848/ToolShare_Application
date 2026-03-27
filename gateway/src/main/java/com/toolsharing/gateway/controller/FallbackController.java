package com.toolsharing.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/auth")
    public ResponseEntity<Map<String, Object>> authFallback() {
        return fallbackResponse("auth-service");
    }

    @RequestMapping("/user")
    public ResponseEntity<Map<String, Object>> userFallback() {
        return fallbackResponse("user-service");
    }

    @RequestMapping("/tool")
    public ResponseEntity<Map<String, Object>> toolFallback() {
        return fallbackResponse("tool-service");
    }

    @RequestMapping("/booking")
    public ResponseEntity<Map<String, Object>> bookingFallback() {
        return fallbackResponse("booking-service");
    }

    private ResponseEntity<Map<String, Object>> fallbackResponse(String service) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SERVICE_UNAVAILABLE");
        response.put("message", service + " is currently unavailable. Please try again later.");
        response.put("service", service);
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(response);
    }
}