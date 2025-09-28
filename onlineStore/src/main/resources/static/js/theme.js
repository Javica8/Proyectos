document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Función para aplicar el tema
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Actualizar icono
        if (themeToggle) {
            if (theme === 'dark') {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('title', 'Cambiar a modo claro');
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.setAttribute('title', 'Cambiar a modo oscuro');
            }
        }
    }
    
    // Comprobar tema almacenado o preferencia del sistema
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    
    // Manejar el clic en el botón de cambio de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }
    
    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    const video = document.querySelector('.features-video');
    const html = document.documentElement;
    function setPoster() {
        if (!video) return;
        if (html.getAttribute('data-theme') === 'dark') {
            video.setAttribute('poster', '/img/3er Torneo Pádel 2023 negro.png');
        } else {
            video.setAttribute('poster', '/img/3er Torneo Pádel 2023 naranja.png');
        }
    }
    setPoster();

    // Si tienes un botón para cambiar el tema dinámicamente:
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(setPoster, 100);
        });
    }
});