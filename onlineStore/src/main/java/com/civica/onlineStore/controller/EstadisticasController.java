package com.civica.onlineStore.controller;

import com.civica.onlineStore.service.EstadisticasService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para gestionar estadísticas y datos analíticos.
 * Proporciona endpoints para obtener datos destinados a visualizaciones y reportes.
 */
@RestController
@RequestMapping("/api/v1/estadisticas")
public class EstadisticasController {
    private final EstadisticasService estadisticasService;

    /**
     * Constructor para inyección de dependencias del servicio de estadísticas.
     * @param estadisticasService Servicio de estadísticas
     */
    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    // Estadísticas para el administrador
    @GetMapping("/admin")
    public Map<String, Object> getEstadisticasAdmin() {
        return estadisticasService.getEstadisticasAdmin();
    }

    // Estadísticas para un cliente concreto
    @GetMapping("/customer/{customerId}")
    public Map<String, Object> getEstadisticasCustomer(@PathVariable Long customerId) {
        return estadisticasService.getEstadisticasCustomer(customerId);
    }
}
