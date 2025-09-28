package com.civica.onlineStore.repository;

import com.civica.onlineStore.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Nuevos clientes por mes
    @Query("SELECT FUNCTION('DATE_FORMAT', c.registrationDate, '%Y-%m') AS mes, COUNT(c) " +
           "FROM Customer c GROUP BY mes ORDER BY mes")
    List<Object[]> countNewCustomersByMonth();
}