package com.toolsharing.tool_service.service;

import com.toolsharing.tool_service.dto.UserDto;
import com.toolsharing.tool_service.dto.request.CreateToolRequest;
import com.toolsharing.tool_service.dto.request.UpdateToolRequest;
import com.toolsharing.tool_service.dto.response.ToolResponse;
import com.toolsharing.tool_service.entity.Category;
import com.toolsharing.tool_service.entity.Tool;
import com.toolsharing.tool_service.repository.CategoryRepository;
import com.toolsharing.tool_service.repository.ToolRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ToolServiceTest {

    @Mock
    private ToolRepository toolRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserLookupService userLookupService;

    @Mock
    private GeocodingService geocodingService;

    @InjectMocks
    private ToolService toolService;

    private Tool testTool;
    private UserDto testUser;

    @BeforeEach
    void setUp() {
        testTool = new Tool();
        testTool.setId(1L);
        testTool.setName("Cordless Drill");
        testTool.setDescription("High power cordless drill");
        testTool.setOwnerId(10L);
        testTool.setCategoryId(2L);
        testTool.setStatus(Tool.ToolStatus.AVAILABLE);
        testTool.setDailyRate(new BigDecimal("150.00"));
        testTool.setCity("Mumbai");
        testTool.setPincode("400001");

        testUser = UserDto.builder()
                .userId(10L)
                .name("Alice Builder")
                .email("alice@example.com")
                .build();
    }

    @Test
    @DisplayName("getToolById should return tool response when tool exists")
    void getToolById_Success() {
        when(toolRepository.findById(1L)).thenReturn(Optional.of(testTool));
        when(userLookupService.getOwnerName(10L)).thenReturn("Alice Builder");

        ToolResponse response = toolService.getToolById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Cordless Drill", response.getName());
        assertEquals("Alice Builder", response.getOwnerName());
    }

    @Test
    @DisplayName("getToolById should throw 404 when tool does not exist")
    void getToolById_NotFound() {
        when(toolRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> toolService.getToolById(99L));
    }

    @Test
    @DisplayName("createTool should create and return tool when valid")
    void createTool_Success() {
        CreateToolRequest request = new CreateToolRequest();
        request.setName("Cordless Drill");
        request.setDescription("High power cordless drill");
        request.setCategoryId(2L);
        request.setDailyRate(new BigDecimal("150.00"));
        request.setPincode("400001");
        request.setCity("Mumbai");
        request.setState("Maharashtra");

        when(userLookupService.getUser(10L)).thenReturn(testUser);
        Category category = new Category();
        category.setId(2L);
        category.setName("Power Tools");
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(toolRepository.save(any(Tool.class))).thenReturn(testTool);

        ToolResponse response = toolService.createTool(10L, request);

        assertNotNull(response);
        assertEquals("Cordless Drill", response.getName());
        verify(toolRepository).save(any(Tool.class));
    }

    @Test
    @DisplayName("createTool should throw 400 when owner is invalid")
    void createTool_InvalidOwner() {
        CreateToolRequest request = new CreateToolRequest();
        request.setName("Hammer");
        when(userLookupService.getUser(99L)).thenReturn(null);

        assertThrows(ResponseStatusException.class, () -> toolService.createTool(99L, request));
        verify(toolRepository, never()).save(any(Tool.class));
    }

    @Test
    @DisplayName("updateTool should update fields when caller is owner")
    void updateTool_Success() {
        UpdateToolRequest request = new UpdateToolRequest();
        request.setName("Updated Drill");
        request.setDailyRate(new BigDecimal("200.00"));

        when(toolRepository.findById(1L)).thenReturn(Optional.of(testTool));
        when(toolRepository.save(any(Tool.class))).thenReturn(testTool);

        ToolResponse response = toolService.updateTool(1L, 10L, request);

        assertNotNull(response);
        verify(toolRepository).save(any(Tool.class));
    }

    @Test
    @DisplayName("updateTool should throw 403 when caller is not owner")
    void updateTool_Forbidden() {
        UpdateToolRequest request = new UpdateToolRequest();
        request.setName("Updated Drill");

        when(toolRepository.findById(1L)).thenReturn(Optional.of(testTool));

        assertThrows(ResponseStatusException.class, () -> toolService.updateTool(1L, 999L, request));
        verify(toolRepository, never()).save(any(Tool.class));
    }

    @Test
    @DisplayName("deleteTool should delete when caller is owner")
    void deleteTool_Success() {
        when(toolRepository.findById(1L)).thenReturn(Optional.of(testTool));

        assertDoesNotThrow(() -> toolService.deleteTool(1L, 10L));
        verify(toolRepository).delete(testTool);
    }

    @Test
    @DisplayName("deleteTool should throw 403 when caller is not owner")
    void deleteTool_Forbidden() {
        when(toolRepository.findById(1L)).thenReturn(Optional.of(testTool));

        assertThrows(ResponseStatusException.class, () -> toolService.deleteTool(1L, 999L));
        verify(toolRepository, never()).delete(any(Tool.class));
    }

    @Test
    @DisplayName("incrementViews should delegate to repository")
    void incrementViews_Success() {
        doNothing().when(toolRepository).incrementViewsCount(1L);

        toolService.incrementViews(1L);

        verify(toolRepository).incrementViewsCount(1L);
    }
}
