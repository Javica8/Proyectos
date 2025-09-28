document.addEventListener('DOMContentLoaded', function() {
    if (!window.OnlineStoreAPI) {
        console.error('OnlineStoreAPI no está disponible');
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await window.OnlineStoreAPI.loginUser({ email, password });
                if (response && response.token) {
                    // Espera a que el token esté realmente en localStorage antes de redirigir
                    let retries = 10;
                    while (!localStorage.getItem('authToken') && retries-- > 0) {
                        await new Promise(res => setTimeout(res, 10));
                    }
                    window.location.href = '/home.html';
                } else {
                    showAuthError('Credenciales incorrectas');
                }
            } catch (error) {
                showAuthError(error.message || 'Error de autenticación');
                console.error('Error detallado:', error);
            }
        });
    }
});

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