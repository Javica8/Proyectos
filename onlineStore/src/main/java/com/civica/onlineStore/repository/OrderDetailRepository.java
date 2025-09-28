package com.civica.onlineStore.repository;

import com.civica.onlineStore.model.Order;
import com.civica.onlineStore.model.OrderDetail;
import com.civica.onlineStore.model.OrderDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, OrderDetailId> {
    // Ventas por categoría (admin)
    @Query("SELECT od.product.category.name, SUM(od.quantity * od.unitPrice) " +
           "FROM OrderDetail od GROUP BY od.product.category.name")
    List<Object[]> sumSalesByCategory();

    // Ventas por categoría (customer)
    @Query("SELECT od.product.category.name, SUM(od.quantity * od.unitPrice) " +
           "FROM OrderDetail od WHERE od.order.customer.id = :customerId GROUP BY od.product.category.name")
    List<Object[]> sumSalesByCategoryForCustomer(Long customerId);

    List<OrderDetail> findByOrder(Order order);
}