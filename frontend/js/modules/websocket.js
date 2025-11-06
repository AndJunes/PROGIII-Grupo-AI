import { CONSTANTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000; // 3 segundos
        this.isConnected = false;
        this.messageHandlers = new Map();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.connect();
    }

    connect() {
        try {
            // En producción, esta URL vendría de variables de entorno
            const wsUrl = this.getWebSocketUrl();
            this.socket = new WebSocket(wsUrl);
            
            this.setupEventHandlers();
            
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    getWebSocketUrl() {
        // Convertir http/https a ws/wss
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws/reservas`;
        
        // Para desarrollo con puerto específico:
        // return 'ws://localhost:3006/ws/reservas';
    }

    setupEventHandlers() {
        this.socket.onopen = (event) => {
            console.log('WebSocket conectado exitosamente');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.onConnectionOpen(event);
        };

        this.socket.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket desconectado:', event);
            this.isConnected = false;
            this.onConnectionClose(event);
            
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.onConnectionError(error);
        };
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Ejecutar handlers específicos para el tipo de mensaje
            const handlers = this.messageHandlers.get(data.type) || [];
            handlers.forEach(handler => handler(data));
            
            // Handler global
            this.onMessage(data);
            
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    onConnectionOpen(event) {
        // Notificar a la aplicación que la conexión está establecida
        this.dispatchEvent('websocket:connected', { event });
        
        // Enviar mensaje de autenticación si tenemos token
        this.authenticate();
    }

    onConnectionClose(event) {
        this.dispatchEvent('websocket:disconnected', { event });
        
        // Mostrar notificación de reconexión si no fue un cierre limpio
        if (!event.wasClean) {
            this.showReconnectionNotification();
        }
    }

    onConnectionError(error) {
        this.dispatchEvent('websocket:error', { error });
    }

    onMessage(data) {
        // Manejar diferentes tipos de mensajes
        switch (data.type) {
            case 'nueva_reserva':
                this.handleNuevaReserva(data);
                break;
            case 'reserva_modificada':
                this.handleReservaModificada(data);
                break;
            case 'reserva_eliminada':
                this.handleReservaEliminada(data);
                break;
            case 'usuario_registrado':
                this.handleUsuarioRegistrado(data);
                break;
            case 'pago_procesado':
                this.handlePagoProcesado(data);
                break;
            case 'system_notification':
                this.handleSystemNotification(data);
                break;
            default:
                console.log('Tipo de mensaje no manejado:', data.type);
        }
    }

    handleNuevaReserva(data) {
        const reserva = data.data;
        console.log('Nueva reserva recibida:', reserva);
        
        // Mostrar notificación
        if (window.notificationsManager) {
            window.notificationsManager.notifyNewReserva(reserva);
        }
        
        // Actualizar dashboard si está activo
        this.updateDashboardStats();
        
        // Actualizar lista de reservas si está visible
        this.updateReservasList();
        
        // Disparar evento personalizado
        this.dispatchEvent('reserva:creada', { reserva });
    }

    handleReservaModificada(data) {
        const reserva = data.data;
        console.log('Reserva modificada:', reserva);
        
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Reserva Actualizada',
                message: `Reserva #${reserva.id} ha sido modificada`,
                type: CONSTANTS.NOTIFICATION_TYPES.RESERVA
            });
        }
        
        this.updateReservasList();
        this.dispatchEvent('reserva:actualizada', { reserva });
    }

    handleReservaEliminada(data) {
        const reservaId = data.data.id;
        console.log('Reserva eliminada:', reservaId);
        
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Reserva Eliminada',
                message: `Reserva #${reservaId} ha sido eliminada`,
                type: CONSTANTS.NOTIFICATION_TYPES.RESERVA
            });
        }
        
        this.updateReservasList();
        this.dispatchEvent('reserva:eliminada', { reservaId });
    }

    handleUsuarioRegistrado(data) {
        const usuario = data.data;
        console.log('Nuevo usuario registrado:', usuario);
        
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Nuevo Usuario',
                message: `${usuario.nombre} ${usuario.apellido} se ha registrado`,
                type: CONSTANTS.NOTIFICATION_TYPES.USUARIO
            });
        }
        
        this.updateDashboardStats();
        this.dispatchEvent('usuario:registrado', { usuario });
    }

    handlePagoProcesado(data) {
        const pago = data.data;
        console.log('Pago procesado:', pago);
        
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Pago Confirmado',
                message: `Pago de reserva #${pago.reserva_id} procesado exitosamente`,
                type: 'pago'
            });
        }
        
        this.dispatchEvent('pago:procesado', { pago });
    }

    handleSystemNotification(data) {
        const notification = data.data;
        console.log('Notificación del sistema:', notification);
        
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: notification.title || 'Sistema',
                message: notification.message,
                type: notification.type || CONSTANTS.NOTIFICATION_TYPES.SISTEMA
            });
        }
    }

    authenticate() {
        const token = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        if (token && this.isConnected) {
            this.send({
                type: 'auth',
                token: token
            });
        }
    }

    send(message) {
        if (this.isConnected && this.socket) {
            try {
                this.socket.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        } else {
            console.warn('WebSocket no está conectado, no se puede enviar mensaje');
        }
    }

    subscribe(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }

    unsubscribe(messageType, handler) {
        if (this.messageHandlers.has(messageType)) {
            const handlers = this.messageHandlers.get(messageType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectInterval * this.reconnectAttempts;
            
            console.log(`Intentando reconectar en ${delay}ms (intento ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('Máximo número de intentos de reconexión alcanzado');
            this.showConnectionLostNotification();
        }
    }

    showReconnectionNotification() {
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Conexión Perdida',
                message: 'Intentando reconectar...',
                type: 'warning'
            });
        }
    }

    showConnectionLostNotification() {
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Conexión Perdida',
                message: 'No se pudo establecer conexión con el servidor',
                type: 'error'
            });
        }
    }

    updateDashboardStats() {
        // Actualizar estadísticas del dashboard si está activo
        if (window.dashboardManager && this.isDashboardActive()) {
            window.dashboardManager.refresh();
        }
    }

    updateReservasList() {
        // Actualizar lista de reservas si está visible
        if (window.crudManager && this.isReservasSectionActive()) {
            window.crudManager.loadReservas();
        }
    }

    isDashboardActive() {
        const dashboardSection = document.getElementById('dashboard-section');
        return dashboardSection && dashboardSection.classList.contains('active');
    }

    isReservasSectionActive() {
        const reservasSection = document.getElementById('reservas-section');
        return reservasSection && reservasSection.classList.contains('active');
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    bindEvents() {
        // Escuchar eventos de autenticación
        document.addEventListener('auth:login', () => {
            this.authenticate();
        });

        document.addEventListener('auth:logout', () => {
            this.disconnect();
        });

        // Escuchar cambios de sección para optimizar actualizaciones
        document.addEventListener('sectionChanged', (e) => {
            this.handleSectionChange(e.detail.section);
        });
    }

    handleSectionChange(section) {
        // Podemos optimizar las suscripciones basándonos en la sección activa
        console.log('Sección cambiada, actualizando suscripciones WebSocket:', section);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Logout del usuario');
            this.socket = null;
        }
        this.isConnected = false;
    }

    reconnect() {
        this.disconnect();
        this.reconnectAttempts = 0;
        this.connect();
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    // Método para suscribirse a eventos específicos de reservas
    subscribeToReservas() {
        this.subscribe('nueva_reserva', this.handleNuevaReserva.bind(this));
        this.subscribe('reserva_modificada', this.handleReservaModificada.bind(this));
        this.subscribe('reserva_eliminada', this.handleReservaEliminada.bind(this));
    }

    // Método para suscribirse a eventos de usuarios
    subscribeToUsuarios() {
        this.subscribe('usuario_registrado', this.handleUsuarioRegistrado.bind(this));
    }

    // Método para enviar comandos al servidor
    requestReservasUpdate() {
        this.send({
            type: 'get_reservas',
            timestamp: Date.now()
        });
    }

    requestStatsUpdate() {
        this.send({
            type: 'get_stats',
            timestamp: Date.now()
        });
    }

    // Método para verificar la latencia
    ping() {
        const startTime = Date.now();
        this.send({
            type: 'ping',
            timestamp: startTime
        });

        this.subscribe('pong', (data) => {
            const latency = Date.now() - data.timestamp;
            console.log(`Latencia WebSocket: ${latency}ms`);
            this.dispatchEvent('websocket:latency', { latency });
        });
    }

    // Destructor
    destroy() {
        this.disconnect();
        this.messageHandlers.clear();
    }
}

// Singleton pattern para fácil acceso
let websocketInstance = null;

export function getWebSocketManager() {
    if (!websocketInstance) {
        websocketInstance = new WebSocketManager();
    }
    return websocketInstance;
}

export function initWebSocket() {
    return getWebSocketManager();
}