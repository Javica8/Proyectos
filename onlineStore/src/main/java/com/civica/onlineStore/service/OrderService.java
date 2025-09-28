package com.civica.onlineStore.service;

import com.civica.onlineStore.dto.OrderDTO;
import com.civica.onlineStore.dto.OrderDetailDTO;
import com.civica.onlineStore.model.*;
import com.civica.onlineStore.repository.CustomerRepository;
import com.civica.onlineStore.repository.OrderRepository;
import com.civica.onlineStore.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                      CustomerRepository customerRepository,
                      ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public List<OrderDTO> findAll() {
        return orderRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public OrderDTO findById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO save(OrderDTO orderDTO) {
        Order order = new Order();
        return saveOrUpdateOrder(order, orderDTO);
    }

    @Transactional
    public OrderDTO update(Long id, OrderDTO orderDTO) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return saveOrUpdateOrder(order, orderDTO);
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    public List<OrderDTO> findAllPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return orderRepository.findAll(pageable)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<OrderDTO> findByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private OrderDTO saveOrUpdateOrder(Order order, OrderDTO orderDTO) {
        Customer customer = customerRepository.findById(orderDTO.getCustomerId())
            .orElseThrow(() -> new RuntimeException("Customer not found"));

        order.setCustomer(customer);
        order.setOrderDate(orderDTO.getOrderDate() != null ?
            orderDTO.getOrderDate() : LocalDate.now());
        order.setStatus(orderDTO.getStatus() != null ?
            orderDTO.getStatus() : "Pendiente");

        // Limpiar detalles existentes si es una actualización
        if (order.getId() != null && order.getOrderDetails() != null) {
            order.getOrderDetails().clear();
        }

        // Guardar el pedido primero para tener el ID
        Order savedOrder = orderRepository.save(order);

        if (savedOrder.getOrderDetails() == null) {
            savedOrder.setOrderDetails(new ArrayList<>());
        }

        // Procesar y guardar los detalles
        BigDecimal total = BigDecimal.ZERO;
        if (orderDTO.getOrderDetails() != null && !orderDTO.getOrderDetails().isEmpty()) {
            for (OrderDetailDTO detailDTO : orderDTO.getOrderDetails()) {
                Product product = productRepository.findById(detailDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(product);
                detail.setQuantity(detailDTO.getQuantity());
                // Si no viene unitPrice, usa el precio del producto
                BigDecimal unitPrice = detailDTO.getUnitPrice();
                if (unitPrice == null) {
                    unitPrice = product.getPrice();
                }
                detail.setUnitPrice(unitPrice);
                detail.setId(new OrderDetailId(savedOrder.getId(), product.getId()));

            //    Actualizar el stock del producto ---
                int nuevaCantidad = product.getStock() - detailDTO.getQuantity();
                if (nuevaCantidad < 0) {
                    throw new RuntimeException("No hay suficiente stock para el producto: " + product.getName());
                }
                product.setStock(nuevaCantidad);
                productRepository.save(product);
                // --- FIN NUEVO ---

                savedOrder.getOrderDetails().add(detail);
            }
            // Guardar los detalles en cascada
            savedOrder = orderRepository.save(savedOrder);

            // Calcular el total
            for (OrderDetail detail : savedOrder.getOrderDetails()) {
                total = total.add(detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())));
            }
        }

        savedOrder.setTotal(total);
        savedOrder = orderRepository.save(savedOrder);

        return convertToDTO(savedOrder);
    }

    private OrderDTO convertToDTO(Order order) {
        return new OrderDTO(
            order.getId(),
            order.getCustomer() != null ? order.getCustomer().getId() : null,
            order.getCustomer() != null ?
                order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() : null,
            order.getOrderDate(),
            order.getStatus(),
            order.getTotal(),
            order.getOrderDetails() != null ?
                order.getOrderDetails().stream()
                    .map(this::convertToDetailDTO)
                    .collect(Collectors.toList()) : null
        );
    }

    private OrderDetailDTO convertToDetailDTO(OrderDetail orderDetail) {
        return new OrderDetailDTO(
            orderDetail.getOrder().getId(),
            orderDetail.getProduct().getId(),
            orderDetail.getProduct().getName(),
            orderDetail.getQuantity(),
            orderDetail.getUnitPrice()
        );
    }
}