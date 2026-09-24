package com.deeptech.backend.service;

import com.deeptech.backend.entity.Category;
import com.deeptech.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final auditLogService auditLogService;

    public CategoryService(
            CategoryRepository categoryRepository,
            auditLogService auditLogService) {

        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found with id: " + id
                        ));
    }

    public Category createCategory(Category category) {

        Category savedCategory =
                categoryRepository.save(category);

        auditLogService.log(
                "CREATE",
                "CATEGORY",
                savedCategory.getId(),
                "Created category: "
                        + savedCategory.getName()
        );

        return savedCategory;
    }

    public Category updateCategory(
            Long id,
            Category categoryDetails) {

        Category category =
                getCategoryById(id);

        category.setName(
                categoryDetails.getName()
        );

        category.setParent(
                categoryDetails.getParent()
        );

        Category savedCategory =
                categoryRepository.save(category);

        auditLogService.log(
                "UPDATE",
                "CATEGORY",
                savedCategory.getId(),
                "Updated category: "
                        + savedCategory.getName()
        );

        return savedCategory;
    }

    public void deleteCategory(Long id) {

        Category category =
                getCategoryById(id);

        String categoryName =
                category.getName();

        categoryRepository.delete(category);

        auditLogService.log(
                "DELETE",
                "CATEGORY",
                id,
                "Deleted category: " + categoryName
        );
    }
}