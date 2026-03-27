package com.toolsharing.tool_service.repository;

import com.toolsharing.tool_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    List<Category> findByParentId(Long parentId);

    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    boolean existsByName(String name);
}