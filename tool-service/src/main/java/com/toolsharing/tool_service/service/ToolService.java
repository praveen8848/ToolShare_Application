package com.toolsharing.tool_service.service;

import com.toolsharing.tool_service.client.UserServiceClient;
import com.toolsharing.tool_service.dto.request.CreateToolRequest;
import com.toolsharing.tool_service.dto.request.UpdateToolRequest;
import com.toolsharing.tool_service.dto.response.ToolResponse;
import com.toolsharing.tool_service.entity.Category;
import com.toolsharing.tool_service.entity.Tool;
import com.toolsharing.tool_service.repository.CategoryRepository;
import com.toolsharing.tool_service.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ToolService {

    private static final Logger logger = LoggerFactory.getLogger(ToolService.class);

    private final ToolRepository toolRepository;
    private final CategoryRepository categoryRepository;
    private final UserServiceClient userServiceClient;

    // FIXED: Added @Cacheable. Without this, evicting "searchResults" does nothing!
    @Cacheable(value = "searchResults", unless = "#result == null || #result.isEmpty()")
    public List<ToolResponse> getAllTools(Long categoryId, String status, String search) {
        logger.info("Fetching all tools from DATABASE (cache miss) - Category: {}, Status: {}, Search: {}", categoryId, status, search);
        String toolStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                Tool.ToolStatus.valueOf(status.toUpperCase());
                toolStatus = status.toUpperCase();
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        List<Tool> tools = toolRepository.searchTools(categoryId, toolStatus, search);

        return tools.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "tools", key = "#id", unless = "#result == null")
    public ToolResponse getToolById(Long id) {
        logger.info("Fetching tool by id {} from DATABASE (cache miss)", id);
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found with id: " + id));

        // PRODUCTION WARNING: When Redis is enabled, this will ONLY increment
        // on a cache miss. If 100 users view the tool while it is cached,
        // the view count in the database will only go up by 1.
        toolRepository.incrementViewsCount(id);

        return convertToResponse(tool);
    }

    @Cacheable(value = "userTools", key = "#ownerId", unless = "#result == null || #result.isEmpty()")
    public List<ToolResponse> getToolsByOwner(Long ownerId) {
        logger.info("Fetching tools for owner {} from DATABASE (cache miss)", ownerId);
        List<Tool> tools = toolRepository.findByOwnerId(ownerId);
        return tools.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Caching(evict = {
            @CacheEvict(value = "userTools", key = "#ownerId"),
            @CacheEvict(value = "searchResults", allEntries = true)
            // Removed eviction for "tools" by ID because this is a new tool that isn't cached yet.
    })
    @Transactional
    public ToolResponse createTool(Long ownerId, CreateToolRequest request) {
        logger.info("Creating tool for user {}, clearing related caches", ownerId);

        try {
            userServiceClient.getUserById(ownerId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid owner ID: " + ownerId);
        }

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        }

        Tool tool = new Tool();
        tool.setName(request.getName());
        tool.setDescription(request.getDescription());
        tool.setCategoryId(request.getCategoryId());
        tool.setOwnerId(ownerId);
        tool.setDailyRate(request.getDailyRate());
        tool.setWeeklyRate(request.getWeeklyRate());
        tool.setMonthlyRate(request.getMonthlyRate());
        tool.setDepositAmount(request.getDepositAmount());
        tool.setLocation(request.getLocation());

        if (request.getPickupLocation() != null) tool.setPickupLocation(request.getPickupLocation());
        if (request.getPickupInstructions() != null) tool.setPickupInstructions(request.getPickupInstructions());
        if (request.getOwnerContact() != null) tool.setOwnerContact(request.getOwnerContact());
        if (request.getContactMethod() != null) tool.setContactMethod(request.getContactMethod());

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            tool.setImages(request.getImages());
        }

        Tool savedTool = toolRepository.save(tool);
        logger.info("Tool created with id: {} by owner: {}", savedTool.getId(), ownerId);

        return convertToResponse(savedTool);
    }

    @Caching(evict = {
            @CacheEvict(value = "tools", key = "#id"),
            @CacheEvict(value = "userTools", key = "#userId"),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    @Transactional
    public ToolResponse updateTool(Long id, Long userId, UpdateToolRequest request) {
        logger.info("Updating tool {}, clearing related caches", id);

        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found"));

        if (!tool.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own tools");
        }

        if (request.getName() != null) tool.setName(request.getName());
        if (request.getDescription() != null) tool.setDescription(request.getDescription());
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            tool.setCategoryId(request.getCategoryId());
        }
        if (request.getDailyRate() != null) tool.setDailyRate(request.getDailyRate());
        if (request.getWeeklyRate() != null) tool.setWeeklyRate(request.getWeeklyRate());
        if (request.getMonthlyRate() != null) tool.setMonthlyRate(request.getMonthlyRate());
        if (request.getDepositAmount() != null) tool.setDepositAmount(request.getDepositAmount());
        if (request.getLocation() != null) tool.setLocation(request.getLocation());
        if (request.getStatus() != null) {
            try {
                tool.setStatus(Tool.ToolStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }

        if (request.getPickupLocation() != null) tool.setPickupLocation(request.getPickupLocation());
        if (request.getPickupInstructions() != null) tool.setPickupInstructions(request.getPickupInstructions());
        if (request.getOwnerContact() != null) tool.setOwnerContact(request.getOwnerContact());
        if (request.getContactMethod() != null) tool.setContactMethod(request.getContactMethod());

        if (request.getImages() != null) {
            tool.setImages(request.getImages());
        }

        Tool updatedTool = toolRepository.save(tool);
        logger.info("Tool updated with id: {} by owner: {}", updatedTool.getId(), userId);

        return convertToResponse(updatedTool);
    }

    @Caching(evict = {
            @CacheEvict(value = "tools", key = "#id"),
            @CacheEvict(value = "userTools", key = "#userId"),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    @Transactional
    public void deleteTool(Long id, Long userId) {
        logger.info("Deleting tool {}, clearing related caches", id);

        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found"));

        if (!tool.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own tools");
        }

        toolRepository.delete(tool);
        logger.info("Tool deleted with id: {} by owner: {}", id, userId);
    }

    // FIXED: Changing status to BORROWED affects search results and owner dashboards!
    @Caching(evict = {
            @CacheEvict(value = "tools", key = "#id"),
            @CacheEvict(value = "userTools", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true)
    })
    @Transactional
    public void updateToolStatus(Long id, String status) {
        logger.info("Updating tool status for {}, clearing related caches", id);

        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found"));

        try {
            tool.setStatus(Tool.ToolStatus.valueOf(status.toUpperCase()));
            toolRepository.save(tool);
            logger.info("Tool status updated: {} -> {}", id, status);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
    }

    private ToolResponse convertToResponse(Tool tool) {
        String categoryName = getCategoryName(tool.getCategoryId());

        // PRODUCTION WARNING: Microservice N+1 Problem
        // If getAllTools returns 50 tools, this triggers 50 synchronous HTTP
        // requests to the User Service. You should fetch these in bulk using an IN clause later.
        String ownerName = getOwnerName(tool.getOwnerId());

        return ToolResponse.builder()
                .id(tool.getId())
                .name(tool.getName())
                .description(tool.getDescription())
                .categoryId(tool.getCategoryId())
                .categoryName(categoryName)
                .ownerId(tool.getOwnerId())
                .ownerName(ownerName)
                .status(tool.getStatus().name())
                .dailyRate(tool.getDailyRate())
                .weeklyRate(tool.getWeeklyRate())
                .monthlyRate(tool.getMonthlyRate())
                .depositAmount(tool.getDepositAmount())
                .location(tool.getLocation())
                .viewsCount(tool.getViewsCount())
                .favoritesCount(tool.getFavoritesCount())
                .images(tool.getImages())
                .pickupLocation(tool.getPickupLocation())
                .pickupInstructions(tool.getPickupInstructions())
                .ownerContact(tool.getOwnerContact())
                .contactMethod(tool.getContactMethod())
                .createdAt(tool.getCreatedAt())
                .updatedAt(tool.getUpdatedAt())
                .build();
    }

    private String getCategoryName(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .map(Category::getName)
                .orElse(null);
    }

    private String getOwnerName(Long ownerId) {
        try {
            var user = userServiceClient.getUserById(ownerId);
            return user.getName();
        } catch (Exception e) {
            logger.warn("Could not fetch owner name for user: {}", ownerId);
            return null;
        }
    }
}