let role; 

document.addEventListener('DOMContentLoaded', async function() {
    if (!window.OnlineStoreAPI || !window.OnlineStoreAPI.checkAuth()) return;

    role = await window.getCurrentUserRole(); // <-- ASIGNA role AQUÍ

  
    loadCategorias();
    setupCategoriaModal();

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

async function loadCategorias() {
    try {
        const categorias = await window.OnlineStoreAPI.apiFetch('/categories', 'GET');
        const tbody = document.querySelector('#categoriasTable tbody');
        tbody.innerHTML = '';
        if (categorias && categorias.length > 0) {
            categorias.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cat.id}</td>
                    <td>${cat.name}</td>
                    <td>
                        <div class="pedido-actions">
                            ${role === 'ADMIN' ? `
                                <button class="btn-action btn-edit" title="Editar" data-id="${cat.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action btn-delete" title="Eliminar" data-id="${cat.id}">
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
            tr.innerHTML = `<td colspan="3" style="text-align:center;">No hay categorías registradas.</td>`;
            tbody.appendChild(tr);
        }
        setupCategoriaActions();
    } catch (error) {
        showError('Error al cargar categorías');
        console.error(error);
    }
}

function setupCategoriaModal() {
    const modal = document.getElementById('categoriaModal');
    const btnAdd = document.getElementById('btnAddCategoria');
    const closeBtn = document.getElementById('closeCategoriaModal');
    const form = document.getElementById('categoriaForm');
    const modalTitle = document.getElementById('modalTitle');
    btnAdd.addEventListener('click', () => {
        modalTitle.textContent = 'Nueva Categoría';
        form.reset();
        document.getElementById('categoriaId').value = '';
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
        const id = document.getElementById('categoriaId').value;
        const name = document.getElementById('categoriaNombre').value;
        const categoria = { name };
        try {
            if (id) {
                await window.OnlineStoreAPI.apiFetch(`/categories/${id}`, 'PUT', categoria);
            } else {
                await window.OnlineStoreAPI.apiFetch('/categories', 'POST', categoria);
            }
            modal.style.display = 'none';
            loadCategorias(true);
        } catch (error) {
            showError('Error al guardar categoría');
            console.error(error);
        }
    });
}

function setupCategoriaActions() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const cat = await window.OnlineStoreAPI.apiFetch(`/categories/${id}`, 'GET');
                if (cat) {
                    document.getElementById('categoriaId').value = cat.id;
                    document.getElementById('categoriaNombre').value = cat.name;
                    document.getElementById('modalTitle').textContent = 'Editar Categoría';
                    document.getElementById('categoriaModal').style.display = 'block';
                }
            } catch (error) {
                showError('Error al cargar categoría');
                console.error(error);
            }
        });
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
                try {
                    await window.OnlineStoreAPI.apiFetch(`/categories/${id}`, 'DELETE');
                    loadCategorias(true);
                } catch (error) {
                    if (
                        error &&
                        error.message &&
                        error.message.includes('foreign key constraint fails')
                    ) {
                        showCustomError(
                            'No se puede eliminar esta categoría porque tiene productos asociados.<br>' +
                            'Elimina primero los productos de esta categoría antes de eliminarla.'
                        );
                    } else {
                        showCustomError('Error al eliminar categoría');
                        console.error(error);
                    }
                }
            }
        });
    });
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