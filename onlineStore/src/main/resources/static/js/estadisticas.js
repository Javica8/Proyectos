document.addEventListener('DOMContentLoaded', async function() {
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) return;
    const role = await window.getCurrentUserRole();

    // Cambia sidebar y títulos según el rol
    if (role === 'CUSTOMER') {
        // Sidebar
        document.querySelector('a[href="/clientes.html"] span').textContent = 'Mis datos';
        document.querySelector('a[href="/pedidos.html"] span').textContent = 'Mis pedidos';

        // Cambia los textos de los totales y los títulos de las gráficas
        document.querySelector('#ventasTotalesMes').parentElement.querySelector('.stats-label').textContent = 'Gasto del mes';
        document.querySelector('#totalClientes').parentElement.querySelector('.stats-label').textContent = 'Gastos totales';
        document.querySelector('#ventasMensualesChart').parentElement.querySelector('h3').textContent = 'Gastos por mes';
        document.querySelector('#clientesPorMesChart').parentElement.querySelector('h3').textContent = 'Pedidos por mes';

        // Productos: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('productos.html')) {
            document.getElementById('btnAddProducto').style.display = 'none';
        }
        // Categorías: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('categorias.html')) {
            document.getElementById('btnAddCategoria').style.display = 'none';
        }
    }

    loadEstadisticas();
});

async function loadEstadisticas() {
    try {
        // Obtener datos del usuario autenticado
        const userData = await window.OnlineStoreAPI.getCurrentUser();

        let stats;
        let comprasMensuales = {};
        let comprasPorCategoria = {};
        let pedidosPorMes = {};

        if (userData.role === 'ADMIN') {
            stats = await window.OnlineStoreAPI.apiFetch('/estadisticas/admin', 'GET', null, true);
            comprasMensuales = stats.ventasMensuales || {};
            comprasPorCategoria = stats.ventasPorCategoria || {};
            pedidosPorMes = stats.nuevosClientesPorMes || {};
            renderBarChart('ventasMensualesChart', comprasMensuales, 'Ventas mensuales');
            renderPieChart('ventasPorCategoriaChart', comprasPorCategoria, 'Ventas por categoría');
            renderLineChart('clientesPorMesChart', pedidosPorMes, 'Nuevos clientes por mes');
        } else {
            // Si es CUSTOMER, buscar su customerId
            const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET', null, true);
            const customer = customers.find(c => c.userId === userData.id);
            if (!customer) {
                showError('No se encontró el cliente asociado a este usuario.');
                return;
            }
            const customerId = customer.id;
            stats = await window.OnlineStoreAPI.apiFetch(`/estadisticas/customer/${customerId}`, 'GET', null, true);
            comprasMensuales = stats.comprasMensuales || {};
            comprasPorCategoria = stats.comprasPorCategoria || {};
            pedidosPorMes = stats.pedidosPorMes || {};
            renderBarChart('ventasMensualesChart', comprasMensuales, 'Gastos por mes');
            renderPieChart('ventasPorCategoriaChart', comprasPorCategoria, 'Compras por categoría');
            renderLineChart('clientesPorMesChart', pedidosPorMes, 'Pedidos por mes');
        }

        // Stats-box: Venta total del mes y ventas totales acumuladas
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const totalMesActual = comprasMensuales[mesActual] || 0;
        document.getElementById('ventasTotalesMes').textContent = totalMesActual?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) || '0 €';

        const ventasTotales = Object.values(comprasMensuales).reduce((a, b) => a + b, 0);
        document.getElementById('totalClientes').textContent = ventasTotales?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) || '0 €';

    } catch (error) {
        showError('Error al cargar estadísticas');
        console.error(error);
    }
}

function ordenarFechas(labels) {
   
    if (labels.length && /^\d{4}-\d{2}$/.test(labels[0])) {
        return labels.sort();
    }
    return labels.sort();
}

function renderBarChart(canvasId, dataObj, label) {
    const labels = ordenarFechas(Object.keys(dataObj));
    const data = labels.map(key => dataObj[key]);
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [
                    '#EE880E',

                ],
                borderColor: [
                    'rgb(255, 238, 128)'      
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

let chartInstances = {};

function renderPieChart(canvasId, dataObj, label) {
    const labels = Object.keys(dataObj);
    const data = labels.map(key => dataObj[key]);
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [
                    '#EE880E',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(211, 28, 186, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(218, 52, 127, 0.5)',      
                    'rgba(255, 140, 0, 0.5)',      
                    'rgba(153, 102, 255, 0.5)',    
                    'rgba(0, 201, 167, 0.5)',      
                    'rgba(255, 193, 7, 0.5)',      
                    'rgba(63, 81, 181, 0.5)',      
                    'rgba(233, 30, 99, 0.5)'       
                ],
                borderColor: [
                    '#EE880E',
                    'rgba(75, 192, 192, 1)',
                    'rgba(211, 28, 186, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgb(255, 24, 124)',        
                    'rgba(255, 140, 0, 1)',        
                    'rgba(153, 102, 255, 1)',     
                    'rgba(0, 201, 167, 1)',        
                    'rgba(255, 193, 7, 1)',        
                    'rgba(63, 81, 181, 1)',        
                    'rgba(233, 30, 99, 1)'        
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

function renderLineChart(canvasId, dataObj, label) {
    const labels = ordenarFechas(Object.keys(dataObj));
    const data = labels.map(key => dataObj[key]);
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                fill: false,
                borderColor: '#EE880E',
                tension: 0.1
            }]
        },
        options: {
            responsive: true
        }
    });
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}