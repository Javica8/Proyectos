package com.civica.onlineStore.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
public class OrderDetail {
    @EmbeddedId
    private OrderDetailId id = new OrderDetailId();

    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @Column
    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    public OrderDetail() {}

    public OrderDetail(Order order, Product product, Integer quantity, BigDecimal unitPrice) {
        setOrderAndProduct(order, product);
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    // Método de conveniencia para establecer ambas relaciones y el ID
    public void setOrderAndProduct(Order order, Product product) {
        this.order = order;
        this.product = product;
        if (order != null && order.getId() != null && product != null && product.getId() != null) {
            this.id = new OrderDetailId(order.getId(), product.getId());
        }
    }

    public OrderDetailId getId() { return id; }
    public void setId(OrderDetailId id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { 
        this.order = order;
        if (order != null && order.getId() != null && this.product != null && this.product.getId() != null) {
            this.id.setOrderId(order.getId());
        }
    }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { 
        this.product = product;
        if (product != null && product.getId() != null && this.order != null && this.order.getId() != null) {
            this.id.setProductId(product.getId());
        }
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}