package com.toolsharing.tool_service.repository;

import com.toolsharing.tool_service.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {

    List<Tool> findByOwnerId(Long ownerId);

    List<Tool> findByCategoryId(Long categoryId);

    List<Tool> findByStatus(Tool.ToolStatus status);

    // Use native SQL query to avoid PostgreSQL type issues
    @Query(value = "SELECT * FROM tools t WHERE " +
            "(:categoryId IS NULL OR t.category_id = CAST(:categoryId AS bigint)) AND " +
            "(:status IS NULL OR t.status = CAST(:status AS varchar)) AND " +
            "(:searchTerm IS NULL OR " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS varchar), '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS varchar), '%')))",
            nativeQuery = true)
    List<Tool> searchTools(@Param("categoryId") Long categoryId,
                           @Param("status") String status,
                           @Param("searchTerm") String searchTerm);

    @Modifying
    @Transactional
    @Query("UPDATE Tool t SET t.viewsCount = t.viewsCount + 1 WHERE t.id = :toolId")
    void incrementViewsCount(@Param("toolId") Long toolId);

    @Modifying
    @Transactional
    @Query("UPDATE Tool t SET t.favoritesCount = t.favoritesCount + 1 WHERE t.id = :toolId")
    void incrementFavoritesCount(@Param("toolId") Long toolId);

    @Modifying
    @Transactional
    @Query("UPDATE Tool t SET t.favoritesCount = t.favoritesCount - 1 WHERE t.id = :toolId AND t.favoritesCount > 0")
    void decrementFavoritesCount(@Param("toolId") Long toolId);

    @Query(value = "SELECT * FROM tools t WHERE t.location IS NOT NULL AND ST_DWithin(CAST(t.location AS geography), CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography), :radiusInMeters)", nativeQuery = true)
    List<Tool> findToolsWithinRadius(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusInMeters") double radiusInMeters
    );
}