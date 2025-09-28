# Cívica Sports - Online Store Management System

<img src="./src/main/resources/static/img/logo_degradado_civica.png" alt="Cívica Sports Logo" width="300">

Cívica Sports is a comprehensive online store management system for sports retailers, featuring a complete backend API with MySQL database and modern web interface with role-based access control.

## Enlace Youtube

https://youtu.be/WOhSgMxj1uk

## 🌟 Key Features

### 🛍️ Core Functionality
- **Complete Product Management** - CRUD operations with categories and stock control
- **Customer Management** - Track customer data, orders, and purchase history
- **Order Processing** - Full shopping cart functionality and order tracking
- **Role-based Access Control** - Admin (full access) and Customer (limited access) roles

### 📊 Analytics & Reporting
- **Sales Statistics** - Monthly sales reports and trends
- **Category Performance** - Product category sales analysis
- **Customer Insights** - Purchase history and behavior

### 🛠️ Technical Features
- **JWT Authentication** - Secure login with token-based authentication
- **Responsive Design** - Mobile-friendly interface
- **Light/Dark Mode** - User preference and system adaptive theme
- **Pagination & Sorting** - Efficient data handling for large datasets

## 🏗️ Technology Stack

### Backend
<img src="./src/main/resources/static/img/img_readme/spring_logo.png" alt="Spring Boot" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="./src/main/resources/static/img/img_readme/java_logo_vector.png" alt="Java" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="https://www.mysql.com/common/logos/logo-mysql-170x115.png" alt="MySQL" style="height:28px;vertical-align:middle;margin-right:10px;">

### Frontend
<img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JavaScript" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="https://www.w3.org/html/logo/downloads/HTML5_Logo_512.png" alt="HTML5" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg" alt="CSS3" style="height:28px;vertical-align:middle;margin-right:10px;">

### Tools & Libraries
<img src="./src/main/resources/static/img/img_readme/Apache_Maven_logo.svg.png" alt="Maven" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="./src/main/resources/static/img/img_readme/swagger_logo.png" alt="Swagger" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="./src/main/resources/static/img/img_readme/chart_js.png" alt="Chart.js" style="height:28px;vertical-align:middle;margin-right:10px;">
<img src="https://jwt.io/img/pic_logo.svg" alt="JWT" style="height:28px;vertical-align:middle;margin-right:10px;">

## 🚀 Getting Started

### Prerequisites

| Component       | Minimum Version | Recommended Version |
|----------------|----------------|---------------------|
| Java JDK       | 17             | 21                  |
| Maven          | 3.8.1          | 3.9.6               |
| MySQL          | 8.0            | 8.0                 |
| Node.js        | 16.x           | 18.x                |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://javiercasado1@bitbucket.org/civicasoft/civica-formacion-javier-casado.git
   cd civica-formacion-javier-casado/Primer%20Anio/11_tienda_online_APP/onlineStore
   ```

2. **Database Setup**
   - Create MySQL database:
     ```sql
     CREATE DATABASE online_store;
     ```
   - Update credentials in `application.properties`:
     ```properties
     spring.datasource.username=usuario
     spring.datasource.password=clave1234
     ```

3. **Build and Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

The application will be available at: [http://localhost:8080](http://localhost:8080)

## 🔐 Authentication

The system uses JWT for authentication. Default credentials:

- **Admin**: admin@admin.com / 1234
- **Customer**: customer0@test.com / 1234

## 🌐 API Documentation

### Swagger UI
Access the interactive API documentation at:  
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### Key Endpoints

| Resource       | Endpoint                     | Methods       |
|----------------|------------------------------|---------------|
| Authentication | `/api/v1/auth/register`      | POST          |
|                | `/api/v1/auth/login`         | POST          |
| Products       | `/api/v1/products`           | GET, POST     |
|                | `/api/v1/products/{id}`      | GET, PUT, DELETE |
| Categories     | `/api/v1/categories`         | GET, POST     |
| Orders         | `/api/v1/orders`             | GET, POST     |
| Customers      | `/api/v1/customers`          | GET, POST     |
| Statistics     | `/api/v1/estadisticas/admin` | GET           |

For complete API documentation, see: [API Reference](./docs/API_REFERENCE.md)

## 🗃️ Database Configuration

- **Database**: MySQL
- **Host**: `localhost:3306`
- **Name**: `online_store`
- **Username**: `usuario` (configure in application.properties)
- **Password**: `clave1234` (configure in application.properties)

Hibernate is configured with `spring.jpa.hibernate.ddl-auto=create` for development.

## 📂 Project Structure

```
onlineStore/
├── src/
│   ├── main/
│   │   ├── java/com/civica/onlineStore/
│   │   │   ├── config/       # Configuration classes
│   │   │   ├── controller/   # REST Controllers
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── model/        # JPA Entities
│   │   │   ├── repository/   # Data repositories
│   │   │   ├── service/      # Business logic
│   │   │   └── impl/         # Service implementations
│   │   └── resources/
│   │       ├── static/       # Frontend files
│   │       │   ├── auth/     # Authentication pages
│   │       │   ├── css/      # Stylesheets
│   │       │   ├── img/      # Images and logos
│   │       │   └── js/       # JavaScript files
│   │       └── application.properties
├── docs/
│   ├── API_REFERENCE.md      # Complete API documentation
│   └── USER_GUIDE.md         # User manual for the web interface
└── pom.xml                   # Maven configuration
```

## 📚 Documentation

- [API Reference](./docs/API_REFERENCE.md) - Complete technical documentation of all endpoints
- [User Guide](./docs/USER_GUIDE.md) - Comprehensive guide for using the web interface

## 🛠️ Development

### Running in Development Mode
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Building for Production
```bash
mvn clean package -Pprod
```

### Testing
```bash
mvn test
```

## 📬 Support

For issues or assistance:

- 📧 Email: support@civicasports.com
- 🌐 Website: [https://civicasports.com/support](https://civicasports.com/support)
- 📞 Phone: +34 123 456 789

---

<div align="center">
  <img src="./src/main/resources/static/img/logo_degradado_civica.png" alt="Cívica Software" width="150">
  <p>© 2025 Cívica Software. All rights reserved.</p>
</div>


