package com.toolsharing.tool_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
public class CategoryResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String icon;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
}