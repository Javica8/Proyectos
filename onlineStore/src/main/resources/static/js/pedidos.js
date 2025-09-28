let pedidos = [];
let pedidosPage = 0;
const pedidosPageSize = 15;
let pedidosLastPage = false;
let sortField = 'id';
let sortDirection = 'asc';
let todosLosPedidos = [];

document.addEventListener('DOMContentLoaded', async function() {
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) return;
    const role = await window.getCurrentUserRole();

    // Cambia sidebar y títulos según el rol
    if (role === 'CUSTOMER') {
        document.querySelector('.card-title').textContent = 'Mis pedidos';
        document.getElementById('busquedaPedidoCliente').parentElement.style.display = 'none';

        // Carga solo tus pedidos
        const user = await window.OnlineStoreAPI.getCurrentUser();
        const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
        const myCustomer = customers.find(c => c.userId === user.id);
        if (myCustomer) {
            todosLosPedidos = await window.OnlineStoreAPI.apiFetch(`/orders/by-customer/${myCustomer.id}`, 'GET') || [];
            renderPedidos(todosLosPedidos);
            document.getElementById('verMasPedidosBtn').style.display = 'none';
        }
        // NO llames a loadPedidos ni cargues todos los pedidos
        return;
    }

    todosLosPedidos = await window.OnlineStoreAPI.apiFetch('/orders?page=0&size=9999', 'GET') || [];
    loadPedidos(true);
    loadClientesPedido();
    setupPedidoModal();

    // Buscador por nombre de cliente
    document.getElementById('busquedaPedidoCliente').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();
        if (texto === '') {
            renderPedidos(todosLosPedidos);
        } else {
            const filtrados = todosLosPedidos.filter(p =>
                (p.customerName || '').toLowerCase().includes(texto)
            );
            renderPedidos(filtrados);
        }
        document.getElementById('verMasPedidosBtn').style.display = 'none';
    });

    // Filtro por fechas
    document.getElementById('btnFiltrarFechas').addEventListener('click', function () {
        const inicio = document.getElementById('filtroFechaInicio').value;
        const fin = document.getElementById('filtroFechaFin').value;
        let filtrados = todosLosPedidos;
        if (inicio) {
            filtrados = filtrados.filter(p => p.orderDate >= inicio);
        }
        if (fin) {
            filtrados = filtrados.filter(p => p.orderDate <= fin);
        }
        renderPedidos(filtrados);
        document.getElementById('verMasPedidosBtn').style.display = 'none';
    });

    document.getElementById('btnLimpiarFiltros').addEventListener('click', function () {
        document.getElementById('busquedaPedidoCliente').value = '';
        document.getElementById('filtroFechaInicio').value = '';
        document.getElementById('filtroFechaFin').value = '';
        renderPedidos(todosLosPedidos);
        document.getElementById('verMasPedidosBtn').style.display = 'block';
    });

    // Ordenación al hacer click en los th
    document.querySelectorAll('#pedidosTable th.sortable').forEach(th => {
        th.addEventListener('click', function () {
            const field = th.getAttribute('data-sort');
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            renderPedidos();
            // Quita la clase de todos
            document.querySelectorAll('#pedidosTable th.sortable').forEach(th2 => th2.classList.remove('sorted-asc', 'sorted-desc'));
            // Añade la clase al th activo
            th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            // Cambia las flechas visualmente
            th.querySelector('.sort-icons').textContent = sortDirection === 'asc' ? '▲▼' : '▼▲';
        });
    });

    // Al cargar la tabla, marca la columna activa
    document.querySelectorAll('#pedidosTable th.sortable').forEach(th => {
        const field = th.getAttribute('data-sort');
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (field === sortField) {
            th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            th.querySelector('.sort-icons').textContent = sortDirection === 'asc' ? '▲▼' : '▼▲';
        } else {
            th.querySelector('.sort-icons').textContent = '▲▼';
        }
    });
});

async function loadPedidos(reset = false) {
    try {
        if (reset) {
            pedidosPage = 0;
            pedidosLastPage = false;
            pedidos = [];
            document.querySelector('#pedidosTable tbody').innerHTML = '';
        }
        if (pedidosLastPage) return;

        const nuevos = await window.OnlineStoreAPI.apiFetch(`/orders?page=${pedidosPage}&size=${pedidosPageSize}`, 'GET');
        if (nuevos && nuevos.length > 0) {
            pedidos = pedidos.concat(nuevos);
            if (nuevos.length < pedidosPageSize) pedidosLastPage = true;
        } else {
            pedidosLastPage = true;
        }
        renderPedidos();
        document.getElementById('verMasPedidosBtn').style.display = pedidosLastPage ? 'none' : 'block';
    } catch (error) {
        showError('Error al cargar pedidos');
        console.error(error);
    }
}

function renderPedidos(lista = pedidos) {
    const tbody = document.querySelector('#pedidosTable tbody');
    tbody.innerHTML = '';
    let pedidosOrdenados = lista.slice();

    pedidosOrdenados.sort((a, b) => {
        let valA, valB;
        if (sortField === 'cliente') {
            valA = (a.customerName || '').toLowerCase();
            valB = (b.customerName || '').toLowerCase();
        }
        if (sortField === 'fecha') {
            valA = a.orderDate || '';
            valB = b.orderDate || '';
        }
        if (sortField === 'total') {
            valA = a.total || 0;
            valB = b.total || 0;
        }
        if (sortField === 'estado') {
            valA = (a.status || '').toLowerCase();
            valB = (b.status || '').toLowerCase();
        }
        if (sortField === 'id') {
            valA = a.id;
            valB = b.id;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    if (pedidosOrdenados.length > 0) {
        pedidosOrdenados.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.customerName || ''}</td>
                <td>${pedido.orderDate || ''}</td>
                <td>${(pedido.total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td><span class="pedido-status ${pedido.status}">${pedido.status ? pedido.status.toLowerCase() : ''}</span></td>
                <td>
                    <div class="pedido-actions">
                        <button class="btn-action btn-details" title="Ver detalles" data-id="${pedido.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" title="Editar" data-id="${pedido.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" data-id="${pedido.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        setupPedidoActions();
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center;">No hay pedidos registrados.</td>`;
        tbody.appendChild(tr);
    }
}

async function loadClientesPedido() {
    try {
        const clientes = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
        const select = document.getElementById('pedidoCliente');
        select.innerHTML = '';
        if (clientes && clientes.length > 0) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                // Mostrar nombre y apellidos
                option.textContent = `${cliente.firstName} ${cliente.lastName || ''}`.trim();
                select.appendChild(option);
            });
        }
    } catch (error) {
        showError('Error al cargar clientes');
        console.error(error);
    }
}

function setupPedidoModal() {
    const modal = document.getElementById('pedidoModal');
    const btnAdd = document.getElementById('btnAddPedido');
    const closeBtn = document.getElementById('closePedidoModal');
    const form = document.getElementById('pedidoForm');
    const modalTitle = document.getElementById('modalTitle');
    btnAdd.addEventListener('click', async () => {
        modalTitle.textContent = 'Nuevo Pedido';
        form.reset();
        document.getElementById('pedidoId').value = '';
        // Si es CUSTOMER, selecciona y deshabilita su cliente
        const user = await window.OnlineStoreAPI.getCurrentUser();
        const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
        const myCustomer = customers.find(c => c.userId === user.id);
        if (myCustomer) {
            document.getElementById('pedidoCliente').value = myCustomer.id;
            document.getElementById('pedidoCliente').disabled = true;
        }
        // Solo permite editar fecha y estado
        document.getElementById('pedidoFecha').disabled = false;
        document.getElementById('pedidoEstado').disabled = false;
        modal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.onclick = function(event) {
        if (event.target == modal) modal.style.display = 'none';
    };
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('pedidoId').value;
        const customerId = document.getElementById('pedidoCliente').value;
        const date = document.getElementById('pedidoFecha').value;
        const total = parseFloat(document.getElementById('pedidoTotal').value);
        const status = document.getElementById('pedidoEstado').value;
        const orderDetails = window.pedidoDetallesActuales || [];
        const pedido = { customerId, orderDate: date, total, status, orderDetails };
        try {
            if (id) {
                await window.OnlineStoreAPI.apiFetch(`/orders/${id}`, 'PUT', pedido);
            } else {
                await window.OnlineStoreAPI.apiFetch('/orders', 'POST', pedido);
            }
            modal.style.display = 'none';

            // Si es CUSTOMER, recarga solo sus pedidos
            const role = await window.getCurrentUserRole();
            if (role === 'CUSTOMER') {
                const user = await window.OnlineStoreAPI.getCurrentUser();
                const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
                const myCustomer = customers.find(c => c.userId === user.id);
                if (myCustomer) {
                    todosLosPedidos = await window.OnlineStoreAPI.apiFetch(`/orders/by-customer/${myCustomer.id}`, 'GET') || [];
                    renderPedidos(todosLosPedidos);
                }
            } else {
                loadPedidos(true);
            }
        } catch (error) {
            showError('Error al guardar pedido');
            console.error(error);
        }
    });
}

// Al editar un pedido, también deshabilita el select de cliente si es CUSTOMER
function setupPedidoActions() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const pedido = await window.OnlineStoreAPI.apiFetch(`/orders/${id}`, 'GET');
                if (pedido) {
                    document.getElementById('pedidoId').value = pedido.id;
                    document.getElementById('pedidoCliente').value = pedido.customerId || '';
                    document.getElementById('pedidoCliente').disabled = true; // Solo su cliente
                    document.getElementById('pedidoFecha').value = pedido.orderDate || '';
                    document.getElementById('pedidoTotal').value = pedido.total || '';
                    document.getElementById('pedidoEstado').value = pedido.status || 'PENDIENTE';
                    document.getElementById('modalTitle').textContent = 'Editar Pedido';
                    document.getElementById('pedidoModal').style.display = 'block';
                    window.pedidoDetallesActuales = pedido.orderDetails || [];
                    // Solo permite editar fecha y estado
                    document.getElementById('pedidoFecha').disabled = false;
                    document.getElementById('pedidoEstado').disabled = false;
                }
            } catch (error) {
                showError('Error al cargar pedido');
                console.error(error);
            }
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Seguro que deseas eliminar este pedido?')) {
                try {
                    await window.OnlineStoreAPI.apiFetch(`/orders/${id}`, 'DELETE');
                    loadPedidos(true);
                } catch (error) {
                    showError('Error al eliminar pedido');
                    console.error(error);
                }
            }
        });
    });
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const pedido = await window.OnlineStoreAPI.apiFetch(`/orders/${id}`, 'GET');
                if (pedido && pedido.orderDetails && pedido.orderDetails.length > 0) {
                    let html = `
                        <p><strong>Cliente:</strong> ${pedido.customerName || ''}</p>
                        <p><strong>Fecha:</strong> ${pedido.orderDate || ''}</p>
                        <p><strong>Total:</strong> ${(pedido.total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                        <p><strong>Estado:</strong> <span class="pedido-status ${pedido.status}">${pedido.status}</span></p>
                        <h4>Productos:</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pedido.orderDetails.map(det => `
                                    <tr>
                                        <td>${det.productName}</td>
                                        <td>${det.quantity}</td>
                                        <td>${(det.unitPrice ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                        <td>${((det.unitPrice ?? 0) * det.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                    document.getElementById('pedidoDetallesBody').innerHTML = html;
                } else {
                    document.getElementById('pedidoDetallesBody').innerHTML = '<p>No hay detalles para este pedido.</p>';
                }
                document.getElementById('pedidoDetallesModal').style.display = 'block';
            } catch (error) {
                showError('Error al cargar detalles del pedido');
                console.error(error);
            }
        });
    });
}

// Cerrar modal de detalles
document.getElementById('closePedidoDetallesModal').onclick = function() {
    document.getElementById('pedidoDetallesModal').style.display = 'none';
};
window.onclick = function(event) {
    if (event.target == document.getElementById('pedidoDetallesModal')) {
        document.getElementById('pedidoDetallesModal').style.display = 'none';
    }
};

document.getElementById('verMasPedidosBtn').addEventListener('click', function() {
    pedidosPage++;
    loadPedidos();
});
document.getElementById('btnAddPedido').addEventListener('click', function() {
    window.location.href = '/productos.html?nuevoPedido=1';
});