package com.toolsharing.tool_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toolsharing.tool_service.dto.request.CreateToolRequest;
import com.toolsharing.tool_service.dto.response.ToolResponse;
import com.toolsharing.tool_service.service.ToolService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ToolControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ToolService toolService;

    @InjectMocks
    private ToolController toolController;

    private ObjectMapper objectMapper = new ObjectMapper();

    private ToolResponse sampleResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(toolController).build();

        sampleResponse = ToolResponse.builder()
                .id(1L)
                .name("Cordless Drill")
                .description("Powerful drill")
                .ownerId(10L)
                .ownerName("Alice")
                .status("AVAILABLE")
                .dailyRate(new BigDecimal("150.00"))
                .build();
    }

    @Test
    @DisplayName("GET /api/tools should return list of tools")
    void getAllTools_Success() throws Exception {
        when(toolService.getAllTools(null, null, null)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/tools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("Cordless Drill"));
    }

    @Test
    @DisplayName("GET /api/tools/{id} should increment views and return tool")
    void getToolById_Success() throws Exception {
        when(toolService.getToolById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/tools/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Cordless Drill"));

        verify(toolService).incrementViews(1L);
    }

    @Test
    @DisplayName("POST /api/tools should create and return 201")
    void createTool_Success() throws Exception {
        CreateToolRequest request = new CreateToolRequest();
        request.setName("Cordless Drill");
        request.setDescription("Powerful drill");
        request.setDailyRate(new BigDecimal("150.00"));
        request.setPincode("400001");
        request.setCity("Mumbai");
        request.setState("Maharashtra");

        when(toolService.createTool(eq(10L), any(CreateToolRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/tools")
                        .header("X-User-Id", "10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("DELETE /api/tools/{id} should return 204")
    void deleteTool_Success() throws Exception {
        mockMvc.perform(delete("/api/tools/1")
                        .header("X-User-Id", "10"))
                .andExpect(status().isNoContent());

        verify(toolService).deleteTool(1L, 10L);
    }
}
