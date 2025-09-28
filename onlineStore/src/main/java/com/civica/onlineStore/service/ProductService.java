package com.civica.onlineStore.service;

import com.civica.onlineStore.dto.ProductDTO;
import com.civica.onlineStore.model.Category;
import com.civica.onlineStore.model.Product;
import com.civica.onlineStore.repository.CategoryRepository;
import com.civica.onlineStore.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public ProductDTO findById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    public ProductDTO save(ProductDTO productDTO) {
        Product product = new Product();
        return saveOrUpdateProduct(product, productDTO);
    }

    public ProductDTO update(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return saveOrUpdateProduct(product, productDTO);
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    public List<ProductDTO> findAllActive() {
        return productRepository.findByActiveTrue().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<ProductDTO> findAllActivePaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByActiveTrue(pageable)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private ProductDTO saveOrUpdateProduct(Product product, ProductDTO productDTO) {
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        product.setUpdateDate(LocalDateTime.now());
        product.setActive(productDTO.getActive() != null ? productDTO.getActive() : true);

        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getStock(),
            product.getCategory() != null ? product.getCategory().getId() : null,
            product.getCategory() != null ? product.getCategory().getName() : null,
            product.getUpdateDate()
        );
        dto.setActive(product.getActive());
        return dto;
    }
}