import { SidebarManager } from '../modules/sidebar.js';
import { CRUDManager } from '../modules/crud/index.js';
import { ReportsManager } from '../modules/reports.js';
import { DashboardManager } from '../modules/dashboard.js';
import { WebSocketManager } from '../modules/websocket.js';
import { Auth } from '../auth.js';

class DashboardAdmin {
    constructor() {
        this.modules = {};
        this.init();
    }

    async init() {
        try {
            // Inicializar autenticación primero
            this.auth = new Auth();
            
            // Esperar a que la autenticación se complete
            await this.waitForAuth();
            
            // Inicializar módulos
            this.initializeModules();
            this.bindEvents();
            
            console.log('Dashboard Admin inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando Dashboard Admin:', error);
        }
    }

    waitForAuth() {
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (this.auth && this.auth.isLoggedIn()) {
                    resolve();
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    initializeModules() {
        this.modules.sidebar = new SidebarManager();
        this.modules.notifications = new NotificationsManager();
        this.modules.crud = new CRUDManager();
        this.modules.reports = new ReportsManager();
        this.modules.dashboard = new DashboardManager();
        this.modules.websocket = new WebSocketManager();

        // Hacer disponibles globalmente para compatibilidad
        window.sidebarManager = this.modules.sidebar;
        window.notificationsManager = this.modules.notifications;
        window.crudManager = this.modules.crud;
        window.reportsManager = this.modules.reports;
        window.dashboardManager = this.modules.dashboard;
        window.websocketManager = this.modules.websocket;
    }

    bindEvents() {
        // Evento cuando cambia la sección
        document.addEventListener('sectionChanged', (e) => {
            this.handleSectionChange(e.detail.section);
        });

        // Evento de logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.auth.logOut();
        });

        // Eventos de WebSocket
        document.addEventListener('websocket:connected', () => {
            console.log('WebSocket conectado - Dashboard listo para notificaciones en tiempo real');
        });

        document.addEventListener('reserva:creada', (e) => {
            this.handleNuevaReserva(e.detail.reserva);
        });

        // Actualizar información del usuario en el sidebar
        const userData = this.auth.userData;
        if (userData && this.modules.sidebar) {
            this.modules.sidebar.updateUserInfo(userData);
        }
    }

    handleSectionChange(section) {
        console.log('Sección cambiada:', section);
        
        // Recargar datos específicos de la sección si es necesario
        switch (section) {
            case 'dashboard':
                this.modules.dashboard.refresh();
                break;
            case 'reservas':
                this.modules.crud.loadReservas();
                break;
            case 'salones':
                this.modules.crud.loadSalones();
                break;
            case 'servicios':
                this.modules.crud.loadServicios();
                break;
            case 'turnos':
                this.modules.crud.loadTurnos();
                break;
            case 'usuarios':
                this.modules.crud.loadUsuarios();
                break;
            default:
                console.log('Sección no manejada:', section);
        }
    }

    handleNuevaReserva(reserva) {
        console.log('Procesando nueva reserva en tiempo real:', reserva);
        
        // Actualizar estadísticas inmediatamente
        if (this.modules.dashboard) {
            this.modules.dashboard.updateSpecificStats({
                totalReservas: this.modules.dashboard.stats.totalReservas + 1,
                reservasHoy: this.modules.dashboard.stats.reservasHoy + 1
            });
        }
        
        // Si estamos en la sección de reservas, actualizar la lista
        if (document.querySelector('[data-section="reservas"]')?.classList.contains('active')) {
            this.modules.crud.loadReservas();
        }
    }

    // Método para limpiar recursos
    destroy() {
        if (this.modules.websocket) {
            this.modules.websocket.destroy();
        }
        
        // Limpiar managers del CRUD si es necesario
        if (this.modules.crud && this.modules.crud.managers) {
            Object.values(this.modules.crud.managers).forEach(manager => {
                if (manager.destroy) {
                    manager.destroy();
                }
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardAdmin = new DashboardAdmin();
});

// Limpiar recursos cuando la página se cierre
window.addEventListener('beforeunload', () => {
    if (window.dashboardAdmin) {
        window.dashboardAdmin.destroy();
    }
});