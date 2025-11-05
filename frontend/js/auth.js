class Auth {
    constructor() {
        this.token = localStorage.getItem("authToken");
        this.userData = JSON.parse(localStorage.getItem("userData") || "{}");
        
        console.log('Auth initialized - Token:', !!this.token, 'UserData:', this.userData);
        
        if (this.isProtectedPage()) {
            this.validateAuth();
        } else {
            // Si estamos en login y ya hay sesión, redirigir al dashboard
            if (this.isLoggedIn()) {
                console.log('Ya hay sesión, redirigiendo...');
                this.redirectToDashboard(this.userData.tipo_usuario);
            }
        }
    }

    isProtectedPage() {
        return window.location.pathname.includes('dashboard');
    }


    validateAuth() {
        console.log('Validando autenticación...');
        
        if (!this.isLoggedIn()) {
            console.log('No hay sesión activa, redirigiendo a login');
            this.redirectToLogin();
            return;
        }

        // Verificación local del token JWT
        if (this.isTokenValid()) {
            console.log('Token válido, mostrando página');
            this.updateUIWithUserData(this.userData);
            this.setupLogout();
        } else {
            console.log('Token inválido o expirado, haciendo logout');
            this.logOut();
        }
    }

    isTokenValid() {
        try {
            if (!this.token) return false;
            
            // Decodificar el token JWT para verificar expiración
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const now = Date.now() / 1000;
            
            // Verificar que el token no esté expirado
            if (payload.exp && payload.exp < now) {
                console.log('Token expirado');
                return false;
            }
            
            // Verificar que tenemos userData completo
            if (!this.userData || !this.userData.usuario_id) {
                console.log('UserData incompleto');
                return false;
            }
            
            console.log('Token válido');
            return true;
            
        } catch (error) {
            console.error('Error validando token:', error);
            return false;
        }
    }

    updateUIWithUserData(userData) {
        const userElement = document.querySelector('.user-info');
        if (userElement && userData.nombre) {
            userElement.innerHTML = `
                <strong>Bienvenido, ${userData.nombre} ${userData.apellido}</strong>
                <br><small>${this.getUserTypeText(userData.tipo_usuario)}</small>
            `;
        }
        this.showUserSpecificElements(userData.tipo_usuario);
    }

    getUserTypeText(userType) {
        const types = {
            1: "Administrador",
            2: "Empleado", 
            3: "Cliente"
        };
        return types[userType] || "Usuario";
    }

    showUserSpecificElements(userType) {
        const adminElements = document.querySelectorAll('.admin-only');
        const empleadoElements = document.querySelectorAll('.empleado-only');
        const clienteElements = document.querySelectorAll('.cliente-only');

        // Ocultar todos primero
        adminElements.forEach(el => el.style.display = 'none');
        empleadoElements.forEach(el => el.style.display = 'none');
        clienteElements.forEach(el => el.style.display = 'none');

        // Mostrar según el tipo
        switch(parseInt(userType)) {
            case 1:
                adminElements.forEach(el => el.style.display = 'block');
                break;
            case 2:
                empleadoElements.forEach(el => el.style.display = 'block');
                break;
            case 3:
                clienteElements.forEach(el => el.style.display = 'block');
                break;
        }
    }

    setupLogout() {
        const logoutButtons = document.querySelectorAll('.logout');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logOut();
            });
        });
    }

    redirectToDashboard(userType) {
        console.log('Redirigiendo a dashboard tipo:', userType);
        const dashboards = {
            1: 'dashboard-admin.html',
            2: 'dashboard-empleado.html',
            3: 'dashboard-cliente.html'
        };
        
        const dashboard = dashboards[userType];
        if (dashboard) {
            // Usar replace para evitar que el navegador guarde la página de login en el historial
            window.location.replace(`./${dashboard}`);
        } else {
            console.error('Tipo de usuario no reconocido:', userType);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        window.location.href = './index.html?auth=failed';
    }

    logOut() {
        console.log('Cerrando sesión...');
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = './index.html?logout=success';
    }
}