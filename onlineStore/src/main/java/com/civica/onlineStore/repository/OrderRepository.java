package com.civica.onlineStore.repository;

import com.civica.onlineStore.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Ventas mensuales (admin)
    @Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') AS mes, SUM(o.total) " +
           "FROM Order o GROUP BY mes ORDER BY mes")
    List<Object[]> sumTotalByMonth();

    // Ventas mensuales (customer)
    @Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') AS mes, SUM(o.total) " +
           "FROM Order o WHERE o.customer.id = :customerId GROUP BY mes ORDER BY mes")
    List<Object[]> sumTotalByMonthForCustomer(Long customerId);

    @Query("SELECT FUNCTION('DATE_FORMAT', o.orderDate, '%Y-%m') AS mes, COUNT(o) " +
           "FROM Order o WHERE o.customer.id = :customerId GROUP BY mes ORDER BY mes")
    List<Object[]> countOrdersByMonthForCustomer(Long customerId);

    List<Order> findByCustomerId(Long customerId);
}