package com.toolsharing.tool_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tools")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ToolStatus status = ToolStatus.AVAILABLE;

    @Column(name = "daily_rate", precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(name = "weekly_rate", precision = 10, scale = 2)
    private BigDecimal weeklyRate;

    @Column(name = "monthly_rate", precision = 10, scale = 2)
    private BigDecimal monthlyRate;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column(length = 500)
    private String location;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(name = "favorites_count")
    private Integer favoritesCount = 0;

    // NEW: Add images support
    @ElementCollection
    @CollectionTable(name = "tool_images", joinColumns = @JoinColumn(name = "tool_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (viewsCount == null) viewsCount = 0;
        if (favoritesCount == null) favoritesCount = 0;
        if (status == null) status = ToolStatus.AVAILABLE;
        if (images == null) images = new ArrayList<>();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ToolStatus {
        AVAILABLE, BORROWED, PENDING, MAINTENANCE
    }

    // NEW: Pickup details fields (stored as defaults for this tool)
    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;

    @Column(name = "pickup_instructions", length = 1000)
    private String pickupInstructions;

    @Column(name = "owner_contact", length = 50)
    private String ownerContact;

    @Column(name = "contact_method", length = 20)
    private String contactMethod;
}