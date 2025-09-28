document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) {
        return;
    }

    // Cargar datos del usuario
    loadUserData();

    // Cargar estadísticas
    loadStats();

    // Configurar botones
    setupLogoutButton();
    setupSidebarToggle();
});

async function loadUserData() {
    try {
        const userData = await window.OnlineStoreAPI.getCurrentUser();
        if (userData) {
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            if (userNameElement) userNameElement.textContent = userData.firstName || 'Usuario';
            if (userEmailElement) userEmailElement.textContent = userData.email || '';
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        showError('Error cargando datos del usuario');
    }
}

async function loadStats() {
    try {
        const productosElement = document.getElementById('totalProductos');
        const categoriasElement = document.getElementById('totalCategorias');
        const clientesElement = document.getElementById('totalClientes');
        const pedidosElement = document.getElementById('totalPedidos');

        if (!productosElement || !categoriasElement || !clientesElement || !pedidosElement) {
            console.warn('Elementos de estadísticas no encontrados');
            return;
        }

        // Mostrar estado de carga
        productosElement.textContent = '...';
        categoriasElement.textContent = '...';
        clientesElement.textContent = '...';
        pedidosElement.textContent = '...';

        // Pide los totales reales a los endpoints /count
        const [
            productosCount,
            categorias,
            clientesCount,
            pedidosCount
        ] = await Promise.all([
            window.OnlineStoreAPI.apiFetch('/products/count', 'GET', null, true),
            window.OnlineStoreAPI.apiFetch('/categories', 'GET', null, true),
            window.OnlineStoreAPI.apiFetch('/customers/count', 'GET', null, true),
            window.OnlineStoreAPI.apiFetch('/orders/count', 'GET', null, true)
        ]);

        const userData = await window.OnlineStoreAPI.getCurrentUser();
        if (userData.role === 'CUSTOMER') {
            // Oculta el bloque de clientes
            document.querySelector('.stat-card:nth-child(3)').style.display = 'none';
            // Muestra el total de productos y categorías SIEMPRE
            productosElement.textContent = productosCount;
            categoriasElement.textContent = categorias.length;
            // Muestra solo el total de pedidos de este cliente
            const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET', null, true);
            const myCustomer = customers.find(c => c.userId === userData.id);
            let pedidosCount = 0;
            if (myCustomer) {
                const pedidos = await window.OnlineStoreAPI.apiFetch(`/orders/by-customer/${myCustomer.id}`, 'GET', null, true);
                pedidosCount = pedidos.length;
            }
            pedidosElement.textContent = pedidosCount;
        } else {
            productosElement.textContent = productosCount;
            categoriasElement.textContent = categorias.length;
            clientesElement.textContent = clientesCount;
            pedidosElement.textContent = pedidosCount;
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        showError('Error cargando estadísticas');
        // Restablecer valores si hay error
        const resetElement = (el) => el && (el.textContent = '0');
        resetElement(document.getElementById('totalProductos'));
        resetElement(document.getElementById('totalCategorias'));
        resetElement(document.getElementById('totalClientes'));
        resetElement(document.getElementById('totalPedidos'));
    }
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.OnlineStoreAPI.logout();
        });
    }
}

function setupSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            const isOpen = sidebar.classList.contains('open');
            sidebarToggle.innerHTML = isOpen ?
                '<i class="fas fa-times"></i>' :
                '<i class="fas fa-bars"></i>';
        });
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        console.error('Error:', message);
    }
}

// --- CARRITO GLOBAL ---
// Funciones para carrito
function getCarrito() {
    return JSON.parse(localStorage.getItem('carritoPedido')) || [];
}
function setCarrito(carrito) {
    localStorage.setItem('carritoPedido', JSON.stringify(carrito));
    updateCarritoBadge();
}
function updateCarritoBadge() {
    const carrito = getCarrito();
    const badge = document.getElementById('carritoBadge');
    if (badge) badge.textContent = carrito.length;
}

// Evento para abrir el modal del carrito
document.addEventListener('DOMContentLoaded', function () {
    const carritoBtn = document.getElementById('carritoBtn');
    if (carritoBtn) {
        carritoBtn.addEventListener('click', mostrarCarritoModal);
    }
    updateCarritoBadge();
});

// Mostrar modal del carrito
async function mostrarCarritoModal() {
    const carrito = getCarrito();
    let html = '';
    if (carrito.length === 0) {
        html = '<p>El carrito está vacío.</p>';
    } else {
        // Obtener todos los productos del backend
        const productos = await window.OnlineStoreAPI.apiFetch('/products', 'GET');
        let totalGeneral = 0;
        html = `<table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${carrito.map(item => {
            const producto = productos.find(p => p.id === item.productId);
            const nombre = producto ? producto.name : 'Desconocido';
            const precio = producto ? producto.price : 0;
            const subtotal = precio * item.quantity;
            totalGeneral += subtotal;
            return `
                        <tr>
                            <td>${item.productId}</td>
                            <td>${nombre}</td>
                            <td>${item.quantity}</td>
                            <td>${precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                            <td>${subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                        </tr>
                    `;
        }).join('')}
                <tr>
                    <td colspan="4" style="text-align:right;font-weight:bold;">Total:</td>
                    <td style="font-weight:bold;">${totalGeneral.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                </tr>
            </tbody>
        </table>`;
    }
    document.getElementById('carritoResumen').innerHTML = html;
    cargarClientesCarrito();
    document.getElementById('carritoModal').style.display = 'block';
    document.getElementById('carritoFecha').value = new Date().toISOString().slice(0, 10);
}

// Cerrar modal
document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.getElementById('closeCarritoModal');
    if (closeBtn) {
        closeBtn.onclick = function () {
            document.getElementById('carritoModal').style.display = 'none';
        };
    }
    window.onclick = function (event) {
        if (event.target == document.getElementById('carritoModal')) {
            document.getElementById('carritoModal').style.display = 'none';
        }
    };
});

// Cargar clientes en el modal
async function cargarClientesCarrito() {
    try {
        const userData = await window.OnlineStoreAPI.getCurrentUser();
        const select = document.getElementById('carritoCliente');
        select.innerHTML = '';
        if (userData.role === 'CUSTOMER') {
            // Solo su propio cliente
            const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
            const myCustomer = customers.find(c => c.userId === userData.id);
            if (myCustomer) {
                const option = document.createElement('option');
                option.value = myCustomer.id;
                option.textContent = `${myCustomer.firstName} ${myCustomer.lastName || ''}`.trim();
                select.appendChild(option);
                select.value = myCustomer.id;
                select.disabled = true; // No editable
            }
        } else {
            // Admin: lista completa
            const clientes = await window.OnlineStoreAPI.apiFetch('/customers?page=0&size=9999', 'GET');
            if (clientes && clientes.length > 0) {
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = `${cliente.firstName} ${cliente.lastName || ''}`.trim();
                    select.appendChild(option);
                });
                select.disabled = false;
            }
        }
    } catch (error) {
        // Puedes mostrar un error si quieres
    }
}

// Guardar pedido desde el carrito
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formConfirmarPedido');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const clienteId = document.getElementById('carritoCliente').value;
            const fecha = document.getElementById('carritoFecha').value;
            const carrito = getCarrito();
            if (!carrito.length) return;
            const orderDetails = carrito.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }));
            try {
                await window.OnlineStoreAPI.apiFetch('/orders', 'POST', {
                    customerId: clienteId,
                    orderDate: fecha,
                    orderDetails
                });
                setCarrito([]);
                document.getElementById('carritoModal').style.display = 'none';
                window.location.href = '/pedidos.html';
            } catch (error) {
                // Puedes mostrar un error si quieres
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) return;
    const role = await window.getCurrentUserRole();

    // Cambia sidebar y títulos según el rol
    if (role === 'CUSTOMER') {
        // Sidebar
        document.querySelector('a[href="/clientes.html"] span').textContent = 'Mis datos';
        document.querySelector('a[href="/pedidos.html"] span').textContent = 'Mis pedidos';

        // Productos: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('productos.html')) {
            document.getElementById('btnAddProducto').style.display = 'none';
        }
        // Categorías: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('categorias.html')) {
            document.getElementById('btnAddCategoria').style.display = 'none';
        }
    }
});