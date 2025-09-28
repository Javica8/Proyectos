package com.civica.onlineStore.controller;

import com.civica.onlineStore.model.OrderDetail;
import com.civica.onlineStore.model.OrderDetailId;
import com.civica.onlineStore.service.OrderDetailService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-details")
public class OrderDetailController {
    private final OrderDetailService orderDetailService;

    public OrderDetailController(OrderDetailService orderDetailService) {
        this.orderDetailService = orderDetailService;
    }

    @GetMapping
    public List<OrderDetail> getAll() {
        return orderDetailService.findAll();
    }

    @GetMapping("/{orderId}/{productId}")
    public OrderDetail getById(@PathVariable Long orderId, @PathVariable Long productId) {
        return orderDetailService.findById(new OrderDetailId(orderId, productId));
    }

    @PostMapping
    public OrderDetail create(@RequestBody OrderDetail orderDetail) {
        return orderDetailService.save(orderDetail);
    }

    @PutMapping("/{orderId}/{productId}")
    public OrderDetail update(@PathVariable Long orderId, @PathVariable Long productId, @RequestBody OrderDetail orderDetail) {
        return orderDetailService.update(new OrderDetailId(orderId, productId), orderDetail);
    }

    @DeleteMapping("/{orderId}/{productId}")
    public void delete(@PathVariable Long orderId, @PathVariable Long productId) {
        orderDetailService.delete(new OrderDetailId(orderId, productId));
    }
}