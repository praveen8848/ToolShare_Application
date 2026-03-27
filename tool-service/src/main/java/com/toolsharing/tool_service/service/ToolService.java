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

    public List<ToolResponse> getAllTools(Long categoryId, String status, String search) {
        String toolStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                // Validate status exists (optional)
                Tool.ToolStatus.valueOf(status.toUpperCase());
                toolStatus = status.toUpperCase();
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore and return empty
                return List.of();
            }
        }

        List<Tool> tools = toolRepository.searchTools(categoryId, toolStatus, search);

        return tools.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ToolResponse getToolById(Long id) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found with id: " + id));

        // Increment view count
        toolRepository.incrementViewsCount(id);

        return convertToResponse(tool);
    }

    public List<ToolResponse> getToolsByOwner(Long ownerId) {
        List<Tool> tools = toolRepository.findByOwnerId(ownerId);
        return tools.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ToolResponse createTool(Long ownerId, CreateToolRequest request) {
        // Validate owner exists in User Service
        try {
            userServiceClient.getUserById(ownerId);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid owner ID: " + ownerId);
        }

        // Validate category if provided
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

        Tool savedTool = toolRepository.save(tool);
        logger.info("Tool created with id: {} by owner: {}", savedTool.getId(), ownerId);

        return convertToResponse(savedTool);
    }

    @Transactional
    public ToolResponse updateTool(Long id, Long userId, UpdateToolRequest request) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found"));

        // Check if user is the owner
        if (!tool.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own tools");
        }

        if (request.getName() != null) {
            tool.setName(request.getName());
        }
        if (request.getDescription() != null) {
            tool.setDescription(request.getDescription());
        }
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
            tool.setCategoryId(request.getCategoryId());
        }
        if (request.getDailyRate() != null) {
            tool.setDailyRate(request.getDailyRate());
        }
        if (request.getWeeklyRate() != null) {
            tool.setWeeklyRate(request.getWeeklyRate());
        }
        if (request.getMonthlyRate() != null) {
            tool.setMonthlyRate(request.getMonthlyRate());
        }
        if (request.getDepositAmount() != null) {
            tool.setDepositAmount(request.getDepositAmount());
        }
        if (request.getLocation() != null) {
            tool.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            try {
                tool.setStatus(Tool.ToolStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }

        Tool updatedTool = toolRepository.save(tool);
        logger.info("Tool updated with id: {} by owner: {}", updatedTool.getId(), userId);

        return convertToResponse(updatedTool);
    }

    @Transactional
    public void deleteTool(Long id, Long userId) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool not found"));

        // Check if user is the owner
        if (!tool.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own tools");
        }

        toolRepository.delete(tool);
        logger.info("Tool deleted with id: {} by owner: {}", id, userId);
    }

    @Transactional
    public void updateToolStatus(Long id, String status) {
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
        // Get category name (using separate method to avoid lambda issues)
        String categoryName = getCategoryName(tool.getCategoryId());

        // Get owner name
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
            return user.getName();  // ✅ Using getter method
        } catch (Exception e) {
            logger.warn("Could not fetch owner name for user: {}", ownerId);
            return null;
        }
    }
}