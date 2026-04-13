package com.toolsharing.tool_service.controller;

import com.toolsharing.tool_service.dto.request.CreateToolRequest;
import com.toolsharing.tool_service.dto.request.UpdateToolRequest;
import com.toolsharing.tool_service.dto.response.ToolResponse;
import com.toolsharing.tool_service.service.ToolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class ToolController {

    private static final Logger logger = LoggerFactory.getLogger(ToolController.class);
    private final ToolService toolService;

    @GetMapping
    public ResponseEntity<List<ToolResponse>> getAllTools(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        logger.info("Fetching tools - category: {}, status: {}, search: {}", categoryId, status, search);
        List<ToolResponse> tools = toolService.getAllTools(categoryId, status, search);
        return ResponseEntity.ok(tools);
    }

    // --- NEW: "Tools Near Me" Spatial Search Endpoint ---
    @GetMapping("/search/nearby")
    public ResponseEntity<List<ToolResponse>> getNearbyTools(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10.0") double radius) { // Radius defaults to 10km

        logger.info("Fetching tools within {} km of lat: {}, lng: {}", radius, lat, lng);
        List<ToolResponse> tools = toolService.getNearbyTools(lat, lng, radius);
        return ResponseEntity.ok(tools);
    }
    // ----------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ToolResponse> getToolById(@PathVariable Long id) {
        logger.info("Fetching tool with id: {}", id);
        ToolResponse tool = toolService.getToolById(id);
        return ResponseEntity.ok(tool);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ToolResponse>> getToolsByOwner(@PathVariable Long userId) {
        logger.info("Fetching tools for owner: {}", userId);
        List<ToolResponse> tools = toolService.getToolsByOwner(userId);
        return ResponseEntity.ok(tools);
    }

    // Get current user's tools (uses X-User-Id header)
    @GetMapping("/my-tools")
    public ResponseEntity<List<ToolResponse>> getMyTools(
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Fetching my tools for user: {}", userId);
        List<ToolResponse> tools = toolService.getToolsByOwner(userId);
        return ResponseEntity.ok(tools);
    }

    @PostMapping
    public ResponseEntity<ToolResponse> createTool(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateToolRequest request) {

        logger.info("Creating tool for user: {}", userId);
        ToolResponse tool = toolService.createTool(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tool);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ToolResponse> updateTool(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody UpdateToolRequest request) {

        logger.info("Updating tool {} for user: {}", id, userId);
        ToolResponse tool = toolService.updateTool(id, userId, request);
        return ResponseEntity.ok(tool);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTool(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {

        logger.info("Deleting tool {} by user: {}", id, userId);
        toolService.deleteTool(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateToolStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        logger.info("Updating tool status: {} -> {}", id, status);
        toolService.updateToolStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<Void> updateToolStatusPost(
            @PathVariable Long id,
            @RequestParam String status) {
        logger.info("Updating tool status (POST): {} -> {}", id, status);
        toolService.updateToolStatus(id, status);
        return ResponseEntity.ok().build();
    }
}