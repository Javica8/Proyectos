package com.civica.onlineStore.service;

import com.civica.onlineStore.dto.CategoryDTO;
import com.civica.onlineStore.model.Category;
import com.civica.onlineStore.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public CategoryDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDTO(category);
    }

    public CategoryDTO save(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public CategoryDTO update(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDTO.getName());
        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName());
    }
}