package com.toolsharing.gateway.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.Map;

@Component
public class FallbackHandler {

    /**
     * Generic fallback for when a service is unavailable
     */
    public Mono<ServerResponse> handleFallback(ServerRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", "The requested service is temporarily unavailable. Please try again later.");
        response.put("path", request.uri().getPath());

        return ServerResponse
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }

    /**
     * Auth service specific fallback
     */
    public Mono<ServerResponse> handleAuthFallback(ServerRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Authentication Service Unavailable");
        response.put("message", "Unable to authenticate at this time. Please try again later.");

        return ServerResponse
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }

    /**
     * Tool service specific fallback
     */
    public Mono<ServerResponse> handleToolFallback(ServerRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Tool Service Unavailable");
        response.put("message", "Unable to fetch tools at this time. Please try again later.");

        return ServerResponse
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }

    /**
     * Booking service specific fallback
     */
    public Mono<ServerResponse> handleBookingFallback(ServerRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Booking Service Unavailable");
        response.put("message", "Unable to process booking at this time. Please try again later.");

        return ServerResponse
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }

    /**
     * User service specific fallback
     */
    public Mono<ServerResponse> handleUserFallback(ServerRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "User Service Unavailable");
        response.put("message", "Unable to fetch user data at this time. Please try again later.");

        return ServerResponse
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(response);
    }
}