package com.civica.onlineStore.service;

import com.civica.onlineStore.model.OrderDetail;
import com.civica.onlineStore.model.OrderDetailId;
import com.civica.onlineStore.repository.OrderDetailRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;

    public OrderDetailService(OrderDetailRepository orderDetailRepository) {
        this.orderDetailRepository = orderDetailRepository;
    }

    public List<OrderDetail> findAll() {
        return orderDetailRepository.findAll();
    }

    public OrderDetail findById(OrderDetailId id) {
        return orderDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderDetail not found"));
    }

    public OrderDetail save(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }

    public OrderDetail update(OrderDetailId id, OrderDetail updatedOrderDetail) {
        OrderDetail orderDetail = findById(id);
        orderDetail.setOrder(updatedOrderDetail.getOrder());
        orderDetail.setProduct(updatedOrderDetail.getProduct());
        orderDetail.setQuantity(updatedOrderDetail.getQuantity());
        orderDetail.setUnitPrice(updatedOrderDetail.getUnitPrice());
        return orderDetailRepository.save(orderDetail);
    }

    public void delete(OrderDetailId id) {
        orderDetailRepository.deleteById(id);
    }
}