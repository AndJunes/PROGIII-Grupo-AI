// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando auth...');
    
    try {
        const auth = new Auth();
        
        // Forzar actualización del UI después de un breve delay
        setTimeout(() => {
            if (auth.isLoggedIn()) {
                console.log('Forzando actualización de UI...');
                auth.updateUIWithUserData(auth.userData);
                auth.setupLogout();
                
                // Verificar que los botones estén funcionando
                const logoutButtons = document.querySelectorAll('.logout, .logout-btn, [id="logoutBtn"]');
                console.log('Botones de logout después de inicialización:', logoutButtons.length);
                
                logoutButtons.forEach((button, index) => {
                    console.log(`Botón ${index + 1} listo:`, button);
                });
            }
        }, 500);
        
        window.auth = auth; // Para debugging en consola
        console.log('Auth inicializado correctamente');
        
    } catch (error) {
        console.error('Error inicializando auth:', error);
    }
});