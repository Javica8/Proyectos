package com.civica.onlineStore.config;

import com.civica.onlineStore.model.*;
import com.civica.onlineStore.repository.*;
import com.github.javafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
public class DataLoader {

    private static final int NUM_CUSTOMERS = 20;
    private static final int NUM_ORDERS = 20;

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderDetailRepository orderDetailRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            Faker faker = new Faker(new Locale("es"));
            Random random = new Random();

            System.out.println("INICIO DataLoader");

            // 1. Crear usuario administrador
            if (userRepository.findByEmail("admin@admin.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@admin.com");
                admin.setPassword(passwordEncoder.encode("1234"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                System.out.println("Usuario admin creado con contraseña: 1234");
            }

            // 2. Crear 20 usuarios tipo CUSTOMER y sus clientes asociados
            List<User> users = new ArrayList<>();
            List<Customer> customers = new ArrayList<>();
            for (int i = 0; i < NUM_CUSTOMERS; i++) {
                String email = "customer" + i + "@test.com";
                if (userRepository.findByEmail(email).isEmpty()) {
                    User user = new User();
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode("1234"));
                    user.setRole("CUSTOMER");
                    users.add(userRepository.save(user));

                    Customer customer = new Customer();
                    customer.setFirstName(faker.name().firstName());
                    customer.setLastName(faker.name().lastName());
                    customer.setEmail(email);
                    customer.setPhone(faker.phoneNumber().cellPhone());
                    customer.setRegistrationDate(LocalDate.now().minusDays(random.nextInt(365)));
                    customer.setActive(true);
                    customer.setUser(user);
                    customers.add(customerRepository.save(customer));
                }
            }

            // 3. Crear 10 categorías deportivas realistas
            String[] categoriasDeporte = {
                    "Zapatillas", "Ropa Deportiva", "Balones", "Raquetas", "Accesorios Fitness",
                    "Bicicletas", "Natación", "Montañismo", "Patines", "Suplementos"
            };
            List<Category> categories = new ArrayList<>();
            for (String nombreCategoria : categoriasDeporte) {
                Category category = categoryRepository.findByName(nombreCategoria)
                        .orElseGet(() -> {
                            Category newCategory = new Category(nombreCategoria);
                            return categoryRepository.save(newCategory);
                        });
                if (!categories.contains(category)) {
                    categories.add(category);
                }
            }

            // 4. Crear 5 productos por categoría (50 productos en total)
            Map<String, List<String>> productosPorCategoria = new HashMap<>();
            productosPorCategoria.put("Zapatillas", Arrays.asList(
                    "Zapatillas running Nike Air Max", "Zapatillas trail Salomon XA Pro",
                    "Zapatillas fútbol Adidas Predator", "Zapatillas baloncesto Puma Clyde",
                    "Zapatillas tenis Asics Gel Resolution"));
            productosPorCategoria.put("Ropa Deportiva", Arrays.asList(
                    "Camiseta técnica Nike Dri-FIT", "Pantalón corto running Adidas",
                    "Sudadera deportiva Under Armour", "Mallas compresión Gymshark",
                    "Chaqueta cortavientos The North Face"));
            productosPorCategoria.put("Balones", Arrays.asList(
                    "Balón fútbol Adidas Champions League", "Balón baloncesto Spalding NBA",
                    "Balón voleibol Mikasa V200W", "Balón rugby Gilbert World Cup",
                    "Balón balonmano Hummel H3"));
            productosPorCategoria.put("Raquetas", Arrays.asList(
                    "Raqueta tenis Babolat Pure Drive", "Raqueta pádel Bullpadel Hack",
                    "Raqueta squash Dunlop Hyperfibre", "Raqueta bádminton Yonex Astrox",
                    "Raqueta ping pong Stiga Carbon"));
            productosPorCategoria.put("Accesorios Fitness", Arrays.asList(
                    "Esterilla yoga Liforme", "Mancuernas ajustables 5-25kg",
                    "Comba crossfit Rogue", "Cinturón lumbar Harbinger",
                    "Bandas elásticas Serious Steel"));
            productosPorCategoria.put("Bicicletas", Arrays.asList(
                    "Bicicleta montaña Orbea Alma", "Bicicleta carretera BH Ultralight",
                    "Bicicleta spinning Keiser M3i", "Bicicleta infantil Woom 4",
                    "Bicicleta eléctrica Specialized Turbo Vado"));
            productosPorCategoria.put("Natación", Arrays.asList(
                    "Gafas natación Speedo Fastskin", "Bañador competición Arena Carbon",
                    "Gorro silicona TYR", "Palas entrenamiento Finis",
                    "Aletas cortas Cressi"));
            productosPorCategoria.put("Montañismo", Arrays.asList(
                    "Mochila trekking Osprey Atmos 65", "Botas montaña Salomon Quest",
                    "Bastones senderismo Black Diamond", "Saco dormir The North Face -10°C",
                    "Linterna frontal Petzl Actik Core"));
            productosPorCategoria.put("Patines", Arrays.asList(
                    "Patines en línea Rollerblade Twister", "Patines quad Riedell R3",
                    "Protecciones patinaje Triple Eight", "Casco patinaje K2",
                    "Bolsa transporte patines Powerslide"));
            productosPorCategoria.put("Suplementos", Arrays.asList(
                    "Proteína whey Gold Standard", "Barritas energéticas Clif",
                    "Bebida isotónica Powerade Zero", "Creatina monohidrato MyProtein",
                    "Multivitamínico Centrum Performance"));

            List<Product> products = new ArrayList<>();
            for (Category category : categories) {
                List<String> nombresProductos = productosPorCategoria.get(category.getName());
                for (String nombreProducto : nombresProductos) {
                    Product product = productRepository.findByName(nombreProducto)
                            .orElseGet(() -> {
                                Product newProduct = new Product();
                                newProduct.setName(nombreProducto);
                                newProduct.setDescription(faker.lorem().sentence(10));
                                newProduct.setPrice(BigDecimal.valueOf(faker.number().randomDouble(2, 10, 300)));
                                newProduct.setStock(random.nextInt(100) + 1);
                                newProduct.setCategory(category);
                                newProduct.setUpdateDate(LocalDateTime.now().minusDays(random.nextInt(100)));
                                return productRepository.save(newProduct);
                            });
                    if (!products.contains(product)) {
                        products.add(product);
                    }
                }
            }

            // 5. Crear 20 pedidos, cada uno de un cliente aleatorio
            List<Order> orders = new ArrayList<>();
            if (!customers.isEmpty() && !products.isEmpty()) {
                for (int i = 0; i < NUM_ORDERS; i++) {
                    Order order = new Order();
                    Customer customer = customers.get(random.nextInt(customers.size()));
                    order.setCustomer(customer);
                    order.setOrderDate(LocalDate.now().minusDays(random.nextInt(365)));
                    order.setStatus(random.nextBoolean() ? "PENDIENTE" : "ENVIADO");
                    order.setTotal(BigDecimal.ZERO); // Se actualizará después con los detalles
                    order = orderRepository.save(order); 
                    orders.add(order);
                }
            }

            // 6. Para cada pedido, añadir un producto de cada categoría (10 detalles por
            // pedido)
            if (!orders.isEmpty() && !categories.isEmpty() && !products.isEmpty()) {
                for (Order order : orders) {
                    BigDecimal orderTotal = BigDecimal.ZERO;
                    List<OrderDetail> detalles = new ArrayList<>();
                    for (Category category : categories) {
                        List<Product> productosCategoria = products.stream()
                                .filter(p -> p.getCategory().getId().equals(category.getId()))
                                .toList();
                        if (!productosCategoria.isEmpty()) {
                            Product selectedProduct = productosCategoria.get(random.nextInt(productosCategoria.size()));
                            int quantity = random.nextInt(3) + 1;
                            OrderDetail detail = new OrderDetail();
                            detail.setOrder(order);
                            detail.setProduct(selectedProduct);
                            detail.setQuantity(quantity);
                            detail.setUnitPrice(selectedProduct.getPrice());
                            detail.setId(new OrderDetailId(order.getId(), selectedProduct.getId()));
                            orderDetailRepository.save(detail);
                            detalles.add(detail);
                            orderTotal = orderTotal
                                    .add(selectedProduct.getPrice().multiply(BigDecimal.valueOf(quantity)));
                        }
                    }
                    order.setTotal(orderTotal);
                    order.setOrderDetails(detalles); 
                    orderRepository.save(order); 
                }
            }

            System.out.println("Resumen de carga de datos:");
            System.out.println("- Usuarios creados: " + (users.size() + 1)); // +1 por el admin
            System.out.println("- Clientes creados: " + customers.size());
            System.out.println("- Categorías creadas: " + categories.size());
            System.out.println("- Productos creados: " + products.size());
            System.out.println("- Pedidos creados: " + orders.size());

            // Verificar detalles de pedidos
            long totalOrderDetails = orderDetailRepository.count();
            System.out.println("- Detalles de pedidos creados: " + totalOrderDetails);
            System.out.println("FIN DataLoader");
        };
    }
}