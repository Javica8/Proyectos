package com.civica.onlineStore.service;

import java.util.Map;

/**
 * Interfaz que define los métodos para generar estadísticas relacionadas con las operaciones del sistema.
 */
public interface EstadisticasService {
    /**
     * Obtiene las estadísticas para el administrador.
     *
     * @return Un mapa con las estadísticas para el administrador.
     */
    Map<String, Object> getEstadisticasAdmin();

    /**
     * Obtiene las estadísticas para un cliente específico.
     *
     * @param customerId El ID del cliente para el cual se generarán las estadísticas.
     * @return Un mapa con las estadísticas del cliente.
     */
    Map<String, Object> getEstadisticasCustomer(Long customerId);
}