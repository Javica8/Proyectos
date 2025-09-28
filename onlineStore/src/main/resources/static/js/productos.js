let productos = [];
let productosPage = 0;
const productosPageSize = 15;
let productosLastPage = false;
let sortField = 'id';
let sortDirection = 'asc';
let todosLosProductos = [];
let role; 

document.addEventListener('DOMContentLoaded', async function () {
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) return;

    role = await window.getCurrentUserRole(); // <-- ASIGNA role AQUÍ

    // Carga productos y categorías SIEMPRE
    todosLosProductos = await window.OnlineStoreAPI.apiFetch('/products?page=0&size=9999', 'GET') || [];
    loadProductos(true);
    loadCategorias(true);
    setupProductoModal(true);

    // Ordenación al hacer click en los th
    document.querySelectorAll('#productosTable th.sortable').forEach(th => {
        th.addEventListener('click', function () {
            const field = th.getAttribute('data-sort');
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            renderProductos();
            document.querySelectorAll('#productosTable th.sortable').forEach(th2 => th2.classList.remove('sorted-asc', 'sorted-desc'));
            th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            th.querySelector('.sort-icons').textContent = sortDirection === 'asc' ? '▲▼' : '▼▲';
        });
    });

    // Al cargar la tabla, marca la columna activa
    document.querySelectorAll('#productosTable th.sortable').forEach(th => {
        const field = th.getAttribute('data-sort');
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (field === sortField) {
            th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            th.querySelector('.sort-icons').textContent = sortDirection === 'asc' ? '▲▼' : '▼▲';
        } else {
            th.querySelector('.sort-icons').textContent = '▲▼';
        }
    });

    document.getElementById('verMasProductosBtn').addEventListener('click', function () {
        productosPage++;
        productosLastPage = false;
        loadProductos();
    });

    // Buscador de productos
    document.getElementById('busquedaProducto').addEventListener('input', function () {
        const texto = this.value.trim().toLowerCase();
        if (texto === '') {
            // Si está vacío, muestra la paginación normal
            loadProductos(true);
        } else {
            // Filtra sobre todosLosProductos
            const filtrados = todosLosProductos.filter(p =>
                p.name && p.name.toLowerCase().includes(texto)
            );
            renderProductos(filtrados);
            document.getElementById('verMasProductosBtn').style.display = 'none';
        }
    });

    // Cambia sidebar y títulos según el rol
    if (role === 'CUSTOMER') {
        // Sidebar
        document.querySelector('a[href="/clientes.html"] span').textContent = 'Mis datos';
        document.querySelector('a[href="/pedidos.html"] span').textContent = 'Mis pedidos';

        // Productos: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('productos.html')) {
            document.getElementById('btnAddProducto').style.display = 'none';
            // NO ocultes la tabla ni el buscador
        }
        // Categorías: deshabilitar edición/eliminación
        if (window.location.pathname.endsWith('categorias.html')) {
            document.getElementById('btnAddCategoria').style.display = 'none';
        }
    }
});

async function loadProductos(reset = false) {
    try {
        if (reset) {
            productosPage = 0;
            productosLastPage = false;
            productos = [];
            document.querySelector('#productosTable tbody').innerHTML = '';
        }
        if (productosLastPage) return;

        const nuevos = await window.OnlineStoreAPI.apiFetch(`/products?page=${productosPage}&size=${productosPageSize}`, 'GET');
        if (reset) {
            productos = nuevos || [];
        } else {
            productos = productos.concat(nuevos || []);
        }
        if (!nuevos || nuevos.length < productosPageSize) productosLastPage = true;

        renderProductos();
        document.getElementById('verMasProductosBtn').style.display = productosLastPage ? 'none' : 'block';
    } catch (error) {
        showError('Error al cargar productos');
        console.error(error);
    }
}

function renderProductos(lista = productos) {
    const tbody = document.querySelector('#productosTable tbody');
    tbody.innerHTML = '';
    let productosOrdenados = lista.slice();
    productosOrdenados.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    if (productosOrdenados.length > 0) {
        productosOrdenados.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.name}</td>
                <td>${producto.categoryName || ''}</td>
                <td>${producto.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                <td>${producto.stock}</td>
                <td>
                    <div class="pedido-actions">
                        <button class="btn-action btn-add-cart" title="Añadir al carrito" data-id="${producto.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                        ${role === 'ADMIN' ? `
                            <button class="btn-action btn-edit" title="Editar" data-id="${producto.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-deactivate" title="Desactivar" data-id="${producto.id}">
                                <i class="fas fa-ban"></i>
                            </button>
                            <button class="btn-action btn-delete" title="Eliminar" data-id="${producto.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" style="text-align:center;">No hay productos registrados.</td>`;
        tbody.appendChild(tr);
    }
    setupProductoActions();
}

async function loadCategorias() {
    try {
        const categorias = await window.OnlineStoreAPI.apiFetch('/categories', 'GET');
        const select = document.getElementById('productoCategoria');
        select.innerHTML = '';
        if (categorias && categorias.length > 0) {
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        showError('Error al cargar categorías');
        console.error(error);
    }
}

function setupProductoModal() {
    const modal = document.getElementById('productoModal');
    const btnAdd = document.getElementById('btnAddProducto');
    const closeBtn = document.getElementById('closeProductoModal');
    const form = document.getElementById('productoForm');
    const modalTitle = document.getElementById('modalTitle');
    btnAdd.addEventListener('click', () => {
        modalTitle.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('productoId').value = '';
        modal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.onclick = function (event) {
        if (event.target == modal) modal.style.display = 'none';
    };
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('productoId').value;
        const name = document.getElementById('productoNombre').value;
        const categoryId = document.getElementById('productoCategoria').value;
        const price = parseFloat(document.getElementById('productoPrecio').value);
        const stock = parseInt(document.getElementById('productoStock').value, 10);
        const producto = { name, price, stock, categoryId };
        try {
            if (id) {
                await window.OnlineStoreAPI.apiFetch(`/products/${id}`, 'PUT', producto);
            } else {
                await window.OnlineStoreAPI.apiFetch('/products', 'POST', producto);
            }
            modal.style.display = 'none';
            loadProductos(true); // <-- usa true para resetear la paginación
        } catch (error) {
            showError('Error al guardar producto');
            console.error(error);
        }
    });
}

function setupProductoActions() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            try {
                const producto = await window.OnlineStoreAPI.apiFetch(`/products/${id}`, 'GET');
                if (producto) {
                    document.getElementById('productoId').value = producto.id;
                    document.getElementById('productoNombre').value = producto.name;
                    document.getElementById('productoCategoria').value = producto.categoryId || '';
                    document.getElementById('productoPrecio').value = producto.price;
                    document.getElementById('productoStock').value = producto.stock;
                    document.getElementById('modalTitle').textContent = 'Editar Producto';
                    document.getElementById('productoModal').style.display = 'block';
                }
            } catch (error) {
                showError('Error al cargar producto');
                console.error(error);
            }
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            if (confirm('¿Seguro que deseas eliminar este producto?')) {
                try {
                    await window.OnlineStoreAPI.apiFetch(`/products/${id}`, 'DELETE'); 
                    loadProductos(true);
                } catch (error) {
                    if (
                        error &&
                        error.message &&
                        error.message.includes('foreign key constraint fails')
                    ) {
                        showCustomError(
                            'No se puede eliminar este producto porque está asociado a uno o más pedidos.<br>' +
                            'Si ya no quieres venderlo, puedes <b>desactivarlo</b> para que no aparezca en el catálogo.'
                        );
                    } else {
                        showCustomError('Error al eliminar producto');
                        console.error(error);
                    }
                }
            }
        });
    });
    document.querySelectorAll('.btn-deactivate').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            if (confirm('¿Seguro que deseas desactivar este producto?')) {
                try {
                    // Obtén el producto actual para enviar todos los campos
                    const producto = await window.OnlineStoreAPI.apiFetch(`/products/${id}`, 'GET');
                    if (producto) {
                        producto.active = false;
                        await window.OnlineStoreAPI.apiFetch(`/products/${id}`, 'PUT', producto);
                        loadProductos(true);
                    }
                } catch (error) {
                    showError('Error al desactivar producto');
                    console.error(error);
                }
            }
        });
    });
}

// Carrito funciones globales
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
document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-add-cart')) {
        const btn = e.target.closest('.btn-add-cart');
        const id = btn.getAttribute('data-id');
        const nombre = btn.closest('tr').querySelector('td:nth-child(2)').textContent;
        const cantidad = prompt(`¿Cuántas unidades de "${nombre}" quieres añadir?`, 1);
        if (cantidad && !isNaN(cantidad) && cantidad > 0) {
            let carrito = getCarrito();
            const existente = carrito.find(p => p.productId == id);
            if (existente) {
                existente.quantity += parseInt(cantidad, 10);
            } else {
                carrito.push({ productId: parseInt(id), quantity: parseInt(cantidad, 10) });
            }
            setCarrito(carrito);
        }
    }
});
document.getElementById('carritoBtn').addEventListener('click', function () {
    mostrarCarritoModal();
});
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
document.getElementById('closeCarritoModal').onclick = function () {
    document.getElementById('carritoModal').style.display = 'none';
};
window.onclick = function (event) {
    if (event.target == document.getElementById('carritoModal')) {
        document.getElementById('carritoModal').style.display = 'none';
    }
};
async function cargarClientesCarrito() {
    try {
        const userData = await window.OnlineStoreAPI.getCurrentUser();
        const select = document.getElementById('carritoCliente');
        select.innerHTML = '';
        if (userData.role === 'CUSTOMER') {
            const customers = await window.OnlineStoreAPI.apiFetch('/customers', 'GET');
            const myCustomer = customers.find(c => c.userId === userData.id);
            if (myCustomer) {
                const option = document.createElement('option');
                option.value = myCustomer.id;
                option.textContent = `${myCustomer.firstName} ${myCustomer.lastName || ''}`.trim();
                select.appendChild(option);
                select.value = myCustomer.id;
                select.disabled = true; // Solo su cliente y no editable
            }
        } else {
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

function showCustomError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle" style="margin-right:8px;"></i>${message}`;
        errorElement.style.display = 'block';
        errorElement.style.color = '#c62828';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 7000);
    }
}

updateCarritoBadge();