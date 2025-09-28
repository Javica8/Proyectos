class ClientesUI {
    constructor(api) {
        this.api = api;
        this.clientes = [];
        this.todosLosClientes = [];
        this.page = 0;
        this.pageSize = 15;
        this.lastPage = false;
        this.sortField = 'id';
        this.sortDirection = 'asc';
        this.role = null;
        this.tbody = document.querySelector('#clientesTable tbody');
        this.verMasBtn = document.getElementById('verMasClientesBtn');
        this.busquedaInput = document.getElementById('busquedaCliente');
        this.errorElement = document.getElementById('error-message');
    }

    async init() {
        if (!this.api || !this.api.checkAuth()) return;
        this.role = await window.getCurrentUserRole();
        this.setupSidebar();
        if (this.role === 'CUSTOMER') {
            await this.renderSoloCliente();
        } else {
            this.todosLosClientes = await this.api.apiFetch('/customers?page=0&size=9999', 'GET') || [];
            this.loadClientes(true);
            this.setupBusqueda();
            this.setupOrdenacion();
            this.setupVerMas();
            this.setupClienteModal();
        }
    }

    setupSidebar() {
        if (this.role === 'CUSTOMER') {
            this.setText('.card-title', 'Mis datos');
            this.hide('btnAddCliente');
            this.hideParent('busquedaCliente');
            this.hide('verMasClientesBtn');
        } else {
            if (window.location.pathname.endsWith('productos.html')) this.hide('btnAddProducto');
            if (window.location.pathname.endsWith('categorias.html')) this.hide('btnAddCategoria');
        }
    }

    setText(selector, text) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    hide(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    }

    hideParent(id) {
        const el = document.getElementById(id);
        if (el && el.parentElement) el.parentElement.style.display = 'none';
    }

    async renderSoloCliente() {
        const user = await this.api.getCurrentUser();
        const customers = await this.api.apiFetch('/customers', 'GET');
        const myCustomer = customers.find(c => c.userId === user.id);
        if (myCustomer) {
            this.renderClientes([myCustomer]);
            setTimeout(() => this.setupSoloClienteEdicion(myCustomer), 100);
        }
    }

    setupSoloClienteEdicion(myCustomer) {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = () => this.openClienteModal(myCustomer, true);
        });
        const form = document.getElementById('clienteForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const cliente = this.getClienteFormData();
            try {
                await this.api.apiFetch(`/customers/${cliente.id}`, 'PUT', cliente);
                this.closeModal('clienteModal');
                await this.renderSoloCliente();
            } catch (error) {
                this.showError('Error al guardar cliente');
            }
        };
    }

    setupBusqueda() {
        this.busquedaInput.addEventListener('input', () => {
            const texto = this.busquedaInput.value.trim().toLowerCase();
            if (texto === '') {
                this.loadClientes(true);
            } else {
                const filtrados = this.todosLosClientes.filter(c =>
                    (`${c.firstName} ${c.lastName || ''}`.toLowerCase().includes(texto))
                );
                this.renderClientes(filtrados);
                this.hide('verMasClientesBtn');
            }
        });
    }

    setupOrdenacion() {
        document.querySelectorAll('#clientesTable th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.getAttribute('data-sort');
                if (this.sortField === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = 'asc';
                }
                this.renderClientes();
                this.updateSortIcons();
            });
        });
        this.updateSortIcons();
    }

    updateSortIcons() {
        document.querySelectorAll('#clientesTable th.sortable').forEach(th => {
            const field = th.getAttribute('data-sort');
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (field === this.sortField) {
                th.classList.add(this.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                th.querySelector('.sort-icons').textContent = this.sortDirection === 'asc' ? '▲▼' : '▼▲';
            } else {
                th.querySelector('.sort-icons').textContent = '▲▼';
            }
        });
    }

    setupVerMas() {
        this.verMasBtn.addEventListener('click', () => {
            this.page++;
            this.loadClientes();
        });
    }

    async loadClientes(reset = false) {
        try {
            if (reset) {
                this.page = 0;
                this.lastPage = false;
                this.clientes = [];
                this.tbody.innerHTML = '';
            }
            if (this.lastPage) return;
            const nuevos = await this.api.apiFetch(`/customers?page=${this.page}&size=${this.pageSize}`, 'GET');
            if (reset) {
                this.clientes = nuevos || [];
            } else {
                this.clientes = this.clientes.concat(nuevos || []);
            }
            if (!nuevos || nuevos.length < this.pageSize) this.lastPage = true;
            this.renderClientes();
            this.verMasBtn.style.display = this.lastPage ? 'none' : 'block';
        } catch (error) {
            this.showError('Error al cargar clientes');
        }
    }

    renderClientes(lista = this.clientes) {
        this.tbody.innerHTML = '';
        const clientesOrdenados = this.sortClientes(lista);
        if (clientesOrdenados.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay clientes registrados.</td></tr>`;
            return;
        }
        clientesOrdenados.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>
                    <span class="cliente-estado" title="${cliente.active ? 'Activo' : 'Baja'}"
                        style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${cliente.active ? '#27ae60' : '#e74c3c'};margin-right:8px;vertical-align:middle;cursor:pointer;"
                        data-id="${cliente.id}" data-active="${cliente.active}"></span>
                    ${cliente.firstName} ${cliente.lastName || ''}
                </td>
                <td>${cliente.email}</td>
                <td>${cliente.phone || ''}</td>
                <td>
                    <div class="pedido-actions">
                        <button class="btn-action btn-details" title="Ver detalles" data-id="${cliente.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" title="Editar" data-id="${cliente.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Eliminar" data-id="${cliente.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            this.tbody.appendChild(tr);
        });
        this.setupClienteActions();
        this.setupEstadoToggle();
    }

    sortClientes(lista) {
        const fieldGetters = {
            nombre: c => (`${c.firstName} ${c.lastName || ''}`).toLowerCase(),
            email: c => (c.email || '').toLowerCase(),
            telefono: c => (c.phone || '').toLowerCase(),
            id: c => c.id
        };
        const getValue = fieldGetters[this.sortField] || fieldGetters.id;

        return lista.slice().sort((a, b) => {
            const valA = getValue(a);
            const valB = getValue(b);
            let result = 0;
            if (valA < valB) {
                result = -1;
            } else if (valA > valB) {
                result = 1;
            }
            if (this.sortDirection !== 'asc') {
                result = -result;
            }
            return result;
        });
    }

    setupClienteModal() {
        const modal = document.getElementById('clienteModal');
        const btnAdd = document.getElementById('btnAddCliente');
        const closeBtn = document.getElementById('closeClienteModal');
        const form = document.getElementById('clienteForm');
        const modalTitle = document.getElementById('modalTitle');
        btnAdd.addEventListener('click', () => this.openClienteModal());
        closeBtn.addEventListener('click', () => this.closeModal('clienteModal'));
        window.onclick = (event) => {
            if (event.target == modal) this.closeModal('clienteModal');
        };
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cliente = this.getClienteFormData();
            try {
                if (cliente.id) {
                    await this.api.apiFetch(`/customers/${cliente.id}`, 'PUT', cliente);
                } else {
                    await this.api.apiFetch('/customers', 'POST', cliente);
                }
                this.closeModal('clienteModal');
                const role = await window.getCurrentUserRole();
                if (role === 'CUSTOMER') {
                    await this.renderSoloCliente();
                } else {
                    this.loadClientes(true);
                }
            } catch (error) {
                this.showError('Error al guardar cliente');
            }
        });
    }

    openClienteModal(cliente = {}, soloEdicion = false) {
        document.getElementById('modalTitle').textContent = cliente.id ? (soloEdicion ? 'Editar Mis Datos' : 'Editar Cliente') : 'Nuevo Cliente';
        document.getElementById('clienteId').value = cliente.id || '';
        document.getElementById('clienteNombre').value = cliente.firstName ? `${cliente.firstName}${cliente.lastName ? ' ' + cliente.lastName : ''}` : '';
        document.getElementById('clienteEmail').value = cliente.email || '';
        document.getElementById('clienteTelefono').value = cliente.phone || '';
        document.getElementById('clienteModal').style.display = 'block';
        // Habilita los campos para edición
        ['clienteNombre', 'clienteEmail', 'clienteTelefono'].forEach(id => {
            document.getElementById(id).disabled = false;
        });
    }

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }

    getClienteFormData() {
        const id = document.getElementById('clienteId').value;
        const nombreCompleto = document.getElementById('clienteNombre').value.trim();
        const email = document.getElementById('clienteEmail').value;
        const phone = document.getElementById('clienteTelefono').value;
        let firstName = nombreCompleto, lastName = '';
        if (nombreCompleto.includes(' ')) {
            const partes = nombreCompleto.split(' ');
            firstName = partes.shift();
            lastName = partes.join(' ');
        }
        return { id, firstName, lastName, email, phone };
    }

    setupClienteActions() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                const cliente = await this.api.apiFetch(`/customers/${id}`, 'GET');
                if (cliente) this.openClienteModal(cliente);
            };
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
                try {
                    await this.api.apiFetch(`/customers/${id}`, 'DELETE');
                    this.loadClientes(true);
                } catch (error) {
                    if (error && error.message && error.message.includes('foreign key constraint fails')) {
                        this.showError('No se puede eliminar el cliente porque tiene pedidos asociados.<br>Primero elimina sus pedidos o, si lo prefieres, puedes darlo de baja haciendo clic en el círculo de estado.');
                    } else {
                        this.showError('Error al eliminar cliente');
                    }
                }
            };
        });
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.onclick = () => this.mostrarPedidosCliente(btn.getAttribute('data-id'));
        });
    }

    async mostrarPedidosCliente(clienteId) {
        try {
            const pedidos = await this.api.apiFetch(`/orders/by-customer/${clienteId}`, 'GET');
            let html = '';
            if (pedidos && pedidos.length > 0) {
                html = `<table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.map(pedido => `
                            <tr>
                                <td>${pedido.id}</td>
                                <td>${pedido.orderDate || ''}</td>
                                <td>${(pedido.total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                <td>${pedido.status || ''}</td>
                                <td>
                                    <button class="btn-action btn-pedido-details" data-id="${pedido.id}">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
            } else {
                html = '<p>No hay pedidos para este cliente.</p>';
            }
            document.getElementById('clientePedidosBody').innerHTML = html;
            document.getElementById('clientePedidosModal').style.display = 'block';
            this.setupPedidoDetails(pedidos);
        } catch (error) {
            this.showError('Error al cargar pedidos del cliente');
        }
    }

    setupPedidoDetails(pedidos) {
        document.querySelectorAll('.btn-pedido-details').forEach(btn2 => {
            btn2.onclick = () => {
                const pedidoId = btn2.getAttribute('data-id');
                const pedido = pedidos.find(p => p.id == pedidoId);
                if (pedido && pedido.orderDetails && pedido.orderDetails.length > 0) {
                    let detallesHtml = `
                        <h4>Detalles del Pedido #${pedido.id}</h4>
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
                        <button class="btn btn-outline" id="volverPedidosCliente">Volver a pedidos</button>
                    `;
                    document.getElementById('clientePedidosBody').innerHTML = detallesHtml;
                    document.getElementById('volverPedidosCliente').onclick = () => this.mostrarPedidosCliente(pedido.customerId);
                }
            };
        });
        document.getElementById('closeClientePedidosModal').onclick = () => {
            document.getElementById('clientePedidosModal').style.display = 'none';
        };
        window.onclick = (event) => {
            if (event.target == document.getElementById('clientePedidosModal')) {
                document.getElementById('clientePedidosModal').style.display = 'none';
            }
        };
    }

    setupEstadoToggle() {
        document.querySelectorAll('.cliente-estado').forEach(span => {
            span.onclick = async () => {
                const id = span.getAttribute('data-id');
                const active = span.getAttribute('data-active') === 'true';
                try {
                    const cliente = await this.api.apiFetch(`/customers/${id}`, 'GET');
                    cliente.active = !active;
                    await this.api.apiFetch(`/customers/${id}`, 'PUT', cliente);
                    span.setAttribute('data-active', (!active).toString());
                    span.style.background = !active ? '#27ae60' : '#e74c3c';
                    span.title = !active ? 'Activo' : 'Baja';
                } catch (error) {
                    alert('Error al cambiar el estado del cliente');
                }
            };
        });
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right:8px;"></i>${message}`;
            this.errorElement.style.display = 'block';
            this.errorElement.style.color = '#c62828';
            setTimeout(() => {
                this.errorElement.style.display = 'none';
            }, 7000);
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    if (!window.OnlineStoreAPI) return;
    const clientesUI = new ClientesUI(window.OnlineStoreAPI);
    clientesUI.init();
});