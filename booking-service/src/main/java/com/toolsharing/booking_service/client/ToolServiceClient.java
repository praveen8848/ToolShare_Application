package com.toolsharing.booking_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "tool-service", url = "${tool.service.url:http://localhost:8083}")
public interface ToolServiceClient {

    @GetMapping("/api/tools/{id}")
    ToolDto getToolById(@PathVariable("id") Long id);

    @PostMapping("/api/tools/{id}/status")
    void updateToolStatus(@PathVariable("id") Long id, @RequestParam("status") String status);
}