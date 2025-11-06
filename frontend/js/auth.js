import { CONSTANTS } from './utils/constants.js';
import { Helpers } from './utils/helpers.js';

export class Auth {
    constructor() {
        this.token = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        
        // Decodificar el token para obtener userData actualizado
        if (this.token) {
            try {
                const payload = this.decodeToken(this.token);
                this.userData = payload;
                // Actualizar localStorage con los datos decodificados del token
                localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(payload));
                console.log('✅ UserData actualizado desde token:', this.userData);
            } catch (error) {
                console.error('❌ Error decodificando token:', error);
                this.userData = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA) || "{}");
            }
        } else {
            this.userData = JSON.parse(localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA) || "{}");
        }
        
        console.log('🔐 Auth initialized - Token:', !!this.token, 'UserData:', this.userData);
        
        // Debug del token
        this.debugToken();
        
        if (this.isProtectedPage()) {
            this.validateAuth();
        } else {
            if (this.isLoggedIn()) {
                console.log('🔄 Ya hay sesión, redirigiendo...');
                this.redirectToDashboard(this.userData.tipo_usuario);
            }
        }
    }

    decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (err) {
            console.error('❌ Error al decodificar token:', err);
            return null;
        }
    }

    debugToken() {
        if (this.token) {
            try {
                const payload = this.decodeToken(this.token);
                console.log('🔍 DEBUG - Token payload:', payload);
                console.log('🔍 DEBUG - UserData en localStorage:', this.userData);
                console.log('🔍 DEBUG - Coinciden?', JSON.stringify(payload) === JSON.stringify(this.userData));
                
                // Verificar campos específicos
                if (payload) {
                    console.log('🔍 DEBUG - Campos del token:');
                    console.log('  - usuario_id:', payload.usuario_id);
                    console.log('  - nombre:', payload.nombre);
                    console.log('  - apellido:', payload.apellido);
                    console.log('  - tipo_usuario:', payload.tipo_usuario);
                    console.log('  - email:', payload.email);
                }
            } catch (error) {
                console.error('❌ Error en debug:', error);
            }
        } else {
            console.log('🔍 DEBUG - No hay token disponible');
        }
    }

    isProtectedPage() {
        return window.location.pathname.includes('dashboard');
    }

    isLoggedIn() {
        const hasToken = this.token && this.token.length > 10;
        const hasUserData = this.userData && this.userData.usuario_id;
        
        console.log('🔐 Verificando sesión - Token:', hasToken, 'UserData:', hasUserData);
        
        return hasToken && hasUserData;
    }

    validateAuth() {
        console.log('🔄 Validando autenticación...');
        
        if (!this.isLoggedIn()) {
            console.log('❌ No hay sesión activa, redirigiendo a login');
            this.redirectToLogin();
            return;
        }

        // Verificación local del token JWT
        if (this.isTokenValid()) {
            console.log('✅ Token válido, mostrando página');
            this.updateUIWithUserData(this.userData);
            this.setupLogout();
        } else {
            console.log('❌ Token inválido o expirado, haciendo logout');
            this.logOut();
        }
    }

    isTokenValid() {
        try {
            if (!this.token) return false;
            
            // Decodificar el token JWT para verificar expiración
            const payload = this.decodeToken(this.token);
            if (!payload) return false;
            
            const now = Date.now() / 1000;
            
            // Verificar que el token no esté expirado
            if (payload.exp && payload.exp < now) {
                console.log('❌ Token expirado');
                return false;
            }
            
            // Verificar que tenemos userData completo
            if (!this.userData || !this.userData.usuario_id) {
                console.log('❌ UserData incompleto');
                return false;
            }
            
            console.log('✅ Token válido');
            return true;
            
        } catch (error) {
            console.error('❌ Error validando token:', error);
            return false;
        }
    }

    updateUIWithUserData(userData) {
        console.log('🎨 Actualizando UI con datos:', userData);
        
        // Actualizar user-info en sidebar
        const userElement = document.querySelector('.user-info');
        if (userElement) {
            const nombreCompleto = `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
            const tipoUsuario = this.getUserTypeText(userData.tipo_usuario);
            
            console.log('👤 Mostrando usuario:', nombreCompleto, '- Tipo:', tipoUsuario);
            
            userElement.innerHTML = `
                <div class="user-avatar">
                    <span class="avatar-text">${(userData.nombre?.charAt(0) || 'U')}</span>
                </div>
                <div class="user-details">
                    <span class="user-name">${nombreCompleto || 'Usuario'}</span>
                    <span class="user-role">${tipoUsuario}</span>
                </div>
            `;
        } else {
            console.log('❌ No se encontró .user-info en el DOM');
        }
        
        // Actualizar también el nombre en el header si existe
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userData.nombre) {
            userNameElement.textContent = userData.nombre;
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

        console.log('🎯 Mostrando elementos para tipo:', userType);
        console.log('   - Admin elements:', adminElements.length);
        console.log('   - Empleado elements:', empleadoElements.length);
        console.log('   - Cliente elements:', clienteElements.length);

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
        console.log('🔧 Configurando botones de logout...');
        
        // Buscar todos los botones de logout
        const logoutButtons = document.querySelectorAll('.logout, .logout-btn, [id="logoutBtn"]');
        console.log('🔍 Botones de logout encontrados:', logoutButtons.length);
        
        logoutButtons.forEach((button, index) => {
            console.log(`🔧 Configurando botón ${index + 1}:`, button);
            
            // Remover event listeners previos
            button.replaceWith(button.cloneNode(true));
        });

        // Re-seleccionar después del clone
        const freshButtons = document.querySelectorAll('.logout, .logout-btn, [id="logoutBtn"]');
        
        freshButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🚪 Logout clickeado en botón ${index + 1}`);
                this.logOut();
            });
        });

        // También agregar manejo por si el botón se carga dinámicamente
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('logout') || 
                target.classList.contains('logout-btn') ||
                target.id === 'logoutBtn' ||
                target.closest('.logout') ||
                target.closest('.logout-btn') ||
                target.closest('#logoutBtn')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Logout clickeado (delegación de eventos)');
                this.logOut();
            }
        });

        console.log('✅ Configuración de logout completada');
    }

    redirectToDashboard(userType) {
        console.log('🔄 Redirigiendo a dashboard tipo:', userType);
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
            console.error('❌ Tipo de usuario no reconocido:', userType);
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        console.log('🔄 Redirigiendo a login');
        window.location.href = './index.html?auth=failed';
    }

    logOut() {
        console.log('🚪 Cerrando sesión...');
        localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA);
        console.log('✅ Sesión cerrada, redirigiendo...');
        window.location.href = './index.html?logout=success';
    }

    // Métodos estáticos para uso en login
    static async login(username, password) {
        try {
            const API_URL = 'https://localhost:3006/auth/login';
            
            console.log('📤 Enviando login a:', API_URL);
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre_usuario: username,
                    contrasenia: password
                })
            });

            const data = await response.json();
            console.log('📥 Respuesta del backend:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    static saveSession(token, userData, rememberUser = false, username = '') {
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        if (rememberUser && username) {
            localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.REMEMBERED_USER, username);
        } else {
            localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.REMEMBERED_USER);
        }
        
        console.log('💾 Sesión guardada:', { 
            token: !!token, 
            userData: userData,
            rememberUser: rememberUser 
        });
    }
}