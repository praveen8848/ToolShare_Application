package com.toolsharing.tool_service.service;

import com.toolsharing.tool_service.dto.response.CategoryResponse;
import com.toolsharing.tool_service.entity.Category;
import com.toolsharing.tool_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    // FIX: Removed .isEmpty() check to cache empty lists and prevent DB spam on empty state
    @Cacheable(value = "categories", key = "'all'", unless = "#result == null")
    public List<CategoryResponse> getAllCategories() {
        logger.info("Fetching all categories from DATABASE (cache miss)");
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return categories.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // FIX: Added .toString() to explicitly match StringRedisSerializer expectations
    @Cacheable(value = "categories", key = "#id.toString()", unless = "#result == null")
    public CategoryResponse getCategoryById(Long id) {
        logger.info("Fetching category by id {} from DATABASE (cache miss)", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        return convertToResponse(category);
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse createCategory(Category category) {
        logger.info("Creating new category, clearing categories cache");

        if (categoryRepository.existsByName(category.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name already exists");
        }

        // Ensure the parent category actually exists before saving
        if (category.getParentId() != null && !categoryRepository.existsById(category.getParentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specified parent category does not exist");
        }

        Category savedCategory = categoryRepository.save(category);
        logger.info("Category created: {}", savedCategory.getName());
        return convertToResponse(savedCategory);
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public CategoryResponse updateCategory(Long id, Category categoryDetails) {
        logger.info("Updating category {}, clearing categories cache", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (categoryDetails.getName() != null && !categoryDetails.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(categoryDetails.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name already exists");
            }
            category.setName(categoryDetails.getName());
        }

        if (categoryDetails.getParentId() != null) {
            // Prevent a category from being its own parent (Circular Reference)
            if (categoryDetails.getParentId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A category cannot be its own parent");
            }
            // Ensure the new parent category actually exists
            if (!categoryRepository.existsById(categoryDetails.getParentId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specified parent category does not exist");
            }
            category.setParentId(categoryDetails.getParentId());
        }

        if (categoryDetails.getDescription() != null) {
            category.setDescription(categoryDetails.getDescription());
        }
        if (categoryDetails.getIcon() != null) {
            category.setIcon(categoryDetails.getIcon());
        }
        if (categoryDetails.getDisplayOrder() != null) {
            category.setDisplayOrder(categoryDetails.getDisplayOrder());
        }
        if (categoryDetails.getIsActive() != null) {
            category.setIsActive(categoryDetails.getIsActive());
        }

        Category updatedCategory = categoryRepository.save(category);
        logger.info("Category updated: {}", updatedCategory.getName());
        return convertToResponse(updatedCategory);
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public void deleteCategory(Long id) {
        logger.info("Deleting category {}, clearing categories cache", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        categoryRepository.delete(category);
        logger.info("Category deleted: {}", category.getName());
    }

    private CategoryResponse convertToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParentId())
                .icon(category.getIcon())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}