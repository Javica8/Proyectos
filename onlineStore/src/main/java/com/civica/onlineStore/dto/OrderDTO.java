package com.civica.onlineStore.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class OrderDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private LocalDate orderDate;
    private String status;
    private BigDecimal total;
    private List<OrderDetailDTO> orderDetails;

    // Constructores
    public OrderDTO() {}
    
    public OrderDTO(Long id, Long customerId, String customerName, LocalDate orderDate, 
                   String status, BigDecimal total, List<OrderDetailDTO> orderDetails) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.orderDate = orderDate;
        this.status = status;
        this.total = total;
        this.orderDetails = orderDetails;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public List<OrderDetailDTO> getOrderDetails() { return orderDetails; }
    public void setOrderDetails(List<OrderDetailDTO> orderDetails) { this.orderDetails = orderDetails; }
}