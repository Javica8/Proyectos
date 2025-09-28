const API_BASE_URL = 'http://localhost:8080/api/v1';

async function apiFetch(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (requiresAuth) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Solo redirige si NO estás ya en login o register
            const path = window.location.pathname;
            if (!path.includes('/auth/login.html') && !path.includes('/auth/register.html')) {
                window.location.href = '/auth/login.html';
            }
            throw new Error('No token disponible');
        }
        headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
        method,
        headers,
        credentials: 'include'
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const status = response.status;
        console.log('Fetch status:', status);

        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } else {
            // Si no es JSON, intenta leer como texto o deja data en null
            data = null;
        }

        if (!response.ok) {
            throw new Error(data && data.message ? data.message : 'Error en la petición');
        }
        console.log('JSON recibido:', data);
        return data;
    } catch (error) {
        // No mostrar por consola los errores de integridad referencial esperados
        if (
            error &&
            error.message &&
            error.message.includes('foreign key constraint fails')
        ) {
            // No mostrar nada por consola
        } else {
            console.error('API Error:', error);
        }
        throw error;
    }
}

// Funciones específicas para usuarios
async function registerUser(userData) {
    return apiFetch('/auth/register', 'POST', userData, false);
}

async function loginUser(credentials) {
    try {
        const response = await apiFetch('/auth/login', 'POST', credentials, false);
        if (response && response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            // Forzar recarga para asegurar que todas las dependencias se carguen
            window.location.href = '/home.html';
            return response;
        } else {
            throw new Error('No se recibió token en la respuesta');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAuthError('Credenciales incorrectas o error de conexión');
        throw error;
    }
}

function showAuthError(message) {
    const errorElement = document.getElementById('authError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

async function getCurrentUser() {
    try {
        const userData = localStorage.getItem('userData');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

function checkAuth() {
    const token = localStorage.getItem('authToken');
    const path = window.location.pathname;
    if (!token) {
        if (!path.includes('/auth/login.html') && !path.includes('/auth/register.html')) {
            window.location.href = '/auth/login.html';
        }
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/auth/login.html';
}

if (typeof window !== 'undefined') {
    window.OnlineStoreAPI = {
        apiFetch,
        registerUser,
        loginUser,
        getCurrentUser,
        checkAuth,
        logout
    };
}