package com.civica.onlineStore.service.impl;

import com.civica.onlineStore.repository.*;
import com.civica.onlineStore.service.EstadisticasService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EstadisticasServiceImpl implements EstadisticasService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CustomerRepository customerRepository;

    public EstadisticasServiceImpl(OrderRepository orderRepository,
                                  OrderDetailRepository orderDetailRepository,
                                  CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public Map<String, Object> getEstadisticasAdmin() {
        Map<String, Object> result = new HashMap<>();

        // 1. Ventas mensuales
        List<Object[]> ventasMensuales = orderRepository.sumTotalByMonth();
        result.put("ventasMensuales", mapToSimpleMap(ventasMensuales));

        // 2. Ventas por categoría
        List<Object[]> ventasPorCategoria = orderDetailRepository.sumSalesByCategory();
        result.put("ventasPorCategoria", mapToSimpleMap(ventasPorCategoria));

        // 3. Nuevos clientes por mes
        List<Object[]> nuevosClientes = customerRepository.countNewCustomersByMonth();
        result.put("nuevosClientesPorMes", mapToSimpleMap(nuevosClientes));

        return result;
    }

    @Override
    public Map<String, Object> getEstadisticasCustomer(Long customerId) {
        Map<String, Object> result = new HashMap<>();

        // 1. Compras mensuales
        List<Object[]> comprasMensuales = orderRepository.sumTotalByMonthForCustomer(customerId);
        result.put("comprasMensuales", mapToSimpleMap(comprasMensuales));

        // 2. Compras por categoría
        List<Object[]> comprasPorCategoria = orderDetailRepository.sumSalesByCategoryForCustomer(customerId);
        result.put("comprasPorCategoria", mapToSimpleMap(comprasPorCategoria));

        // 3. Pedidos por mes
        List<Object[]> pedidosPorMes = orderRepository.countOrdersByMonthForCustomer(customerId);
        result.put("pedidosPorMes", mapToSimpleMap(pedidosPorMes));

        return result;
    }

    private Map<String, Number> mapToSimpleMap(List<Object[]> list) {
        Map<String, Number> map = new HashMap<>();
        for (Object[] row : list) {
            map.put((String) row[0], (Number) row[1]);
        }
        return map;
    }
}