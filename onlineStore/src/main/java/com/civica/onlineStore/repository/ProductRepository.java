package com.civica.onlineStore.repository;

import com.civica.onlineStore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
    List<Product> findByActiveTrue();
    Page<Product> findByActiveTrue(Pageable pageable);
}