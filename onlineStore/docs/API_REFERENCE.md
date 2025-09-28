I'll update the API reference document with complete examples for all endpoints, fix the logo path, and ensure all section links work correctly. Here's the revised version:

# 📚 Cívica Sports API Reference

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
   - [Register](#register)
   - [Login](#login)
3. [Users](#users)
4. [Products](#products)
5. [Categories](#categories)
6. [Customers](#customers)
7. [Orders](#orders)
8. [Order Details](#order-details)
9. [Statistics](#statistics)
10. [Schemas](#schemas)

## Introduction
This document provides complete reference documentation for the Cívica Sports API, a RESTful service for managing an online sports store. All endpoints require authentication except for the login and register endpoints.

**Base URL**: `http://localhost:8080/api/v1`

## Authentication

### Register
`POST /auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "role": "string"
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:8080/api/v1/auth/register" \
-H "Content-Type: application/json" \
-d '{"email":"user@example.com","password":"password123","role":"CUSTOMER"}'
```

**Example Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "CUSTOMER"
}
```

### Login
`POST /auth/login`

Authenticate and receive a JWT token.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Example Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

## Users

### Get All Users
`GET /users`

**Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Example Response**:
```json
[
  {
    "id": 1,
    "email": "admin@admin.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "email": "customer1@test.com",
    "role": "CUSTOMER"
  }
]
```

### Get User by ID
`GET /users/{id}`

**Example Response**:
```json
{
  "id": 1,
  "email": "admin@admin.com",
  "role": "ADMIN"
}
```

### Create User
`POST /users`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "CUSTOMER"
}
```

**Example Response**:
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "role": "CUSTOMER"
}
```

### Update User
`PUT /users/{id}`

**Request Body**:
```json
{
  "email": "updated@example.com",
  "password": "newpassword",
  "role": "ADMIN"
}
```

**Example Response**:
```json
{
  "id": 1,
  "email": "updated@example.com",
  "role": "ADMIN"
}
```

### Delete User
`DELETE /users/{id}`

**Response**: 200 OK with no content

## Products

### Get All Products
`GET /products`

**Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 15)

**Example Response**:
```json
[
  {
    "id": 1,
    "name": "Zapatillas running Nike Air Max",
    "description": "Zapatillas de running con tecnología Air Max",
    "price": 129.99,
    "stock": 50,
    "categoryId": 1,
    "categoryName": "Zapatillas",
    "updateDate": "2025-05-25T10:30:00Z",
    "active": true
  }
]
```

### Get Product by ID
`GET /products/{id}`

**Example Response**:
```json
{
  "id": 1,
  "name": "Running Shoes",
  "description": "High-performance running shoes",
  "price": 99.99,
  "stock": 50,
  "categoryId": 3,
  "categoryName": "Footwear",
  "updateDate": "2025-05-26T10:30:00Z",
  "active": true
}
```

### Create Product
`POST /products`

**Request Body**:
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "stock": 100,
  "categoryId": 2,
  "active": true
}
```

**Example Response**:
```json
{
  "id": 51,
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "stock": 100,
  "categoryId": 2,
  "categoryName": "Ropa Deportiva",
  "updateDate": "2025-05-26T12:00:00Z",
  "active": true
}
```

### Update Product
`PUT /products/{id}`

**Request Body**:
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 59.99,
  "stock": 80,
  "categoryId": 3,
  "active": false
}
```

**Example Response**:
```json
{
  "id": 1,
  "name": "Updated Product",
  "description": "Updated description",
  "price": 59.99,
  "stock": 80,
  "categoryId": 3,
  "categoryName": "Balones",
  "updateDate": "2025-05-26T12:30:00Z",
  "active": false
}
```

### Delete Product
`DELETE /products/{id}`

**Response**: 200 OK with no content

### Get Product Count
`GET /products/count`

**Example Response**: `50`

## Categories

### Get All Categories
`GET /categories`

**Example Response**:
```json
[
  {
    "id": 1,
    "name": "Zapatillas"
  },
  {
    "id": 2,
    "name": "Ropa Deportiva"
  }
]
```

### Get Category by ID
`GET /categories/{id}`

**Example Response**:
```json
{
  "id": 1,
  "name": "Zapatillas"
}
```

### Create Category
`POST /categories`

**Request Body**:
```json
{
  "name": "New Category"
}
```

**Example Response**:
```json
{
  "id": 11,
  "name": "New Category"
}
```

### Update Category
`PUT /categories/{id}`

**Request Body**:
```json
{
  "name": "Updated Category"
}
```

**Example Response**:
```json
{
  "id": 1,
  "name": "Updated Category"
}
```

### Delete Category
`DELETE /categories/{id}`

**Response**: 200 OK with no content

## Customers

### Get All Customers
`GET /customers`

**Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Example Response**:
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "registrationDate": "2025-05-01",
    "active": true,
    "userId": 5
  }
]
```

### Get Customer by ID
`GET /customers/{id}`

**Example Response**:
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "registrationDate": "2025-05-01",
  "active": true,
  "userId": 5
}
```

### Create Customer
`POST /customers`

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+9876543210",
  "registrationDate": "2025-05-26",
  "active": true,
  "userId": 6
}
```

**Example Response**:
```json
{
  "id": 21,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+9876543210",
  "registrationDate": "2025-05-26",
  "active": true,
  "userId": 6
}
```

### Update Customer
`PUT /customers/{id}`

**Request Body**:
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "updated@example.com",
  "phone": "+1111111111",
  "registrationDate": "2025-05-01",
  "active": false,
  "userId": 5
}
```

**Example Response**:
```json
{
  "id": 1,
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "email": "updated@example.com",
  "phone": "+1111111111",
  "registrationDate": "2025-05-01",
  "active": false,
  "userId": 5
}
```

### Delete Customer
`DELETE /customers/{id}`

**Response**: 200 OK with no content

### Get Customer Count
`GET /customers/count`

**Example Response**: `20`

## Orders

### Get All Orders
`GET /orders`

**Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Example Response**:
```json
[
  {
    "id": 123,
    "customerId": 1,
    "customerName": "John Doe",
    "orderDate": "2025-05-15",
    "status": "COMPLETED",
    "total": 199.98,
    "orderDetails": [
      {
        "orderId": 123,
        "productId": 1,
        "productName": "Running Shoes",
        "quantity": 2,
        "unitPrice": 99.99
      }
    ]
  }
]
```

### Get Order by ID
`GET /orders/{id}`

**Example Response**:
```json
{
  "id": 123,
  "customerId": 1,
  "customerName": "John Doe",
  "orderDate": "2025-05-15",
  "status": "COMPLETED",
  "total": 199.98,
  "orderDetails": [
    {
      "orderId": 123,
      "productId": 1,
      "productName": "Running Shoes",
      "quantity": 2,
      "unitPrice": 99.99
    }
  ]
}
```

### Create Order
`POST /orders`

**Request Body**:
```json
{
  "customerId": 1,
  "orderDate": "2025-05-26",
  "status": "PENDING",
  "total": 149.97,
  "orderDetails": [
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 49.99
    },
    {
      "productId": 3,
      "quantity": 2,
      "unitPrice": 49.99
    }
  ]
}
```

**Example Response**:
```json
{
  "id": 124,
  "customerId": 1,
  "customerName": "John Doe",
  "orderDate": "2025-05-26",
  "status": "PENDING",
  "total": 149.97,
  "orderDetails": [
    {
      "orderId": 124,
      "productId": 2,
      "productName": "Camiseta técnica Nike Dri-FIT",
      "quantity": 1,
      "unitPrice": 49.99
    },
    {
      "orderId": 124,
      "productId": 3,
      "productName": "Pantalón corto running Adidas",
      "quantity": 2,
      "unitPrice": 49.99
    }
  ]
}
```

### Update Order
`PUT /orders/{id}`

**Request Body**:
```json
{
  "customerId": 1,
  "orderDate": "2025-05-15",
  "status": "SHIPPED",
  "total": 199.98,
  "orderDetails": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 99.99
    }
  ]
}
```

**Example Response**:
```json
{
  "id": 123,
  "customerId": 1,
  "customerName": "John Doe",
  "orderDate": "2025-05-15",
  "status": "SHIPPED",
  "total": 199.98,
  "orderDetails": [
    {
      "orderId": 123,
      "productId": 1,
      "productName": "Running Shoes",
      "quantity": 2,
      "unitPrice": 99.99
    }
  ]
}
```

### Delete Order
`DELETE /orders/{id}`

**Response**: 200 OK with no content

### Get Order Count
`GET /orders/count`

**Example Response**: `20`

### Get Orders by Customer
`GET /orders/by-customer/{customerId}`

**Example Response**:
```json
[
  {
    "id": 123,
    "customerId": 1,
    "customerName": "John Doe",
    "orderDate": "2025-05-15",
    "status": "COMPLETED",
    "total": 199.98,
    "orderDetails": [
      {
        "orderId": 123,
        "productId": 1,
        "productName": "Running Shoes",
        "quantity": 2,
        "unitPrice": 99.99
      }
    ]
  }
]
```

## Order Details

### Get Order Detail
`GET /order-details/{orderId}/{productId}`

**Example Response**:
```json
{
  "orderId": 123,
  "productId": 1,
  "productName": "Running Shoes",
  "quantity": 2,
  "unitPrice": 99.99
}
```

### Update Order Detail
`PUT /order-details/{orderId}/{productId}`

**Request Body**:
```json
{
  "quantity": 3,
  "unitPrice": 99.99
}
```

**Example Response**:
```json
{
  "orderId": 123,
  "productId": 1,
  "productName": "Running Shoes",
  "quantity": 3,
  "unitPrice": 99.99
}
```

### Delete Order Detail
`DELETE /order-details/{orderId}/{productId}`

**Response**: 200 OK with no content

### Get All Order Details
`GET /order-details`

**Example Response**:
```json
[
  {
    "orderId": 123,
    "productId": 1,
    "productName": "Running Shoes",
    "quantity": 2,
    "unitPrice": 99.99
  }
]
```

### Create Order Detail
`POST /order-details`

**Request Body**:
```json
{
  "orderId": 123,
  "productId": 2,
  "quantity": 1,
  "unitPrice": 49.99
}
```

**Example Response**:
```json
{
  "orderId": 123,
  "productId": 2,
  "productName": "Camiseta técnica Nike Dri-FIT",
  "quantity": 1,
  "unitPrice": 49.99
}
```

## Statistics

### Get Admin Statistics
`GET /estadisticas/admin`

**Example Response**:
```json
{
  "ventasMensuales": {
    "2025-01": 1500.00,
    "2025-02": 2300.50
  },
  "ventasPorCategoria": {
    "Footwear": 1200.00,
    "Equipment": 800.50
  },
  "nuevosClientesPorMes": {
    "2025-01": 15,
    "2025-02": 22
  }
}
```

### Get Customer Statistics
`GET /estadisticas/customer/{customerId}`

**Example Response**:
```json
{
  "totalPedidos": 5,
  "totalGastado": 499.95,
  "productosMasComprados": [
    {
      "productId": 1,
      "productName": "Running Shoes",
      "cantidad": 3
    }
  ]
}
```

## Schemas

### User
```json
{
  "id": 0,
  "email": "string",
  "password": "string",
  "role": "string"
}
```

### Product
```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "price": 0,
  "stock": 0,
  "categoryId": 0,
  "active": true
}
```

### Order
```json
{
  "id": 0,
  "customerId": 0,
  "orderDate": "string($date)",
  "status": "string",
  "total": 0,
  "orderDetails": [
    {
      "productId": 0,
      "quantity": 0,
      "unitPrice": 0
    }
  ]
}
```

### Complete documentation available via Swagger UI:  
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

---

<div align="center">
  <img src="../src/main/resources/static/img/logo_degradado_civica.png" alt="Cívica Software" width="150">
  <p>© 2025 Cívica Software. All rights reserved.</p>
</div>

