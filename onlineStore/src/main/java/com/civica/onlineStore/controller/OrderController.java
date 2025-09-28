package com.civica.onlineStore.controller;

import com.civica.onlineStore.dto.OrderDTO;
import com.civica.onlineStore.service.OrderService;
import com.civica.onlineStore.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;
    @Autowired
    private OrderRepository orderRepository;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<OrderDTO> getAll(@RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "20") int size) {
        return orderService.findAllPaged(page, size);
    }

    @GetMapping("/{id}")
    public OrderDTO getById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping
    public OrderDTO create(@RequestBody OrderDTO orderDTO) {
        return orderService.save(orderDTO);
    }

    @PutMapping("/{id}")
    public OrderDTO update(@PathVariable Long id, @RequestBody OrderDTO orderDTO) {
        if (orderDTO.getId() == null) {
            orderDTO.setId(id);
        } else if (!id.equals(orderDTO.getId())) {
            throw new IllegalArgumentException("ID in path and body must match");
        }
        return orderService.update(id, orderDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }

    @GetMapping("/count")
    public long countOrders() {
        return orderRepository.count();
    }

    @GetMapping("/by-customer/{customerId}")
    public List<OrderDTO> getOrdersByCustomer(@PathVariable Long customerId) {
        return orderService.findByCustomerId(customerId);
    }
}