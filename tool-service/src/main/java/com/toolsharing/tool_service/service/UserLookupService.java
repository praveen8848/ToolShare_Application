package com.toolsharing.tool_service.service;

import com.toolsharing.tool_service.client.UserServiceClient;
import com.toolsharing.tool_service.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Service to lookup and cache user information to prevent N+1 HTTP calls.
 */
@Service
@RequiredArgsConstructor
public class UserLookupService {

    private static final Logger logger = LoggerFactory.getLogger(UserLookupService.class);

    private final UserServiceClient userServiceClient;

    /**
     * Fetches and caches the user's name by their ID.
     *
     * @param userId The user's ID
     * @return User's display name or null if unavailable
     */
    @Cacheable(value = "userNames", key = "#userId.toString()", unless = "#result == null")
    public String getOwnerName(Long userId) {
        if (userId == null) return null;
        try {
            UserDto user = userServiceClient.getUserById(userId);
            return user != null ? user.getName() : null;
        } catch (Exception e) {
            logger.warn("Could not fetch user name for user ID: {} - {}", userId, e.getMessage());
            return null;
        }
    }

    @Cacheable(value = "users", key = "#userId.toString()", unless = "#result == null")
    public UserDto getUser(Long userId) {
        if (userId == null) return null;
        return userServiceClient.getUserById(userId);
    }
}
