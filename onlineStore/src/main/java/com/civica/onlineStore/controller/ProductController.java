package com.civica.onlineStore.controller;

import com.civica.onlineStore.dto.ProductDTO;
import com.civica.onlineStore.repository.ProductRepository;
import com.civica.onlineStore.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;
    private final ProductRepository productRepository;

    public ProductController(ProductService productService, ProductRepository productRepository) {
        this.productService = productService;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDTO> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size
    ) {
        return productService.findAllActivePaged(page, size);
    }

    @GetMapping("/{id}")
    public ProductDTO getById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ProductDTO create(@RequestBody ProductDTO productDTO) {
        return productService.save(productDTO);
    }

    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        return productService.update(id, productDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    // Endpoint para contar productos totales (incluye activos e inactivos)
    @GetMapping("/count")
    public long countProducts() {
        return productRepository.count();
    }
}