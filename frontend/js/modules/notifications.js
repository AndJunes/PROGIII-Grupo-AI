import { CONSTANTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNotifications();
        this.startPolling();
    }

    bindEvents() {
        const notificationBtn = document.getElementById('notificationBtn');
        const markAllReadBtn = document.getElementById('markAllRead');
        const dropdown = document.getElementById('notificationDropdown');

        notificationBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        markAllReadBtn?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!dropdown?.contains(e.target) && !notificationBtn?.contains(e.target)) {
                dropdown?.classList.remove('show');
            }
        });
    }

    async loadNotifications() {
        try {
            // En producción, esto vendría de tu API
            // Por ahora usamos datos de ejemplo
            const mockNotifications = [
                {
                    id: 1,
                    title: 'Nueva Reserva',
                    message: 'Se ha creado una nueva reserva para el salón Principal',
                    type: 'reserva',
                    read: false,
                    timestamp: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Usuario Registrado',
                    message: 'Nuevo usuario registrado: Juan Pérez',
                    type: 'usuario',
                    read: false,
                    timestamp: new Date(Date.now() - 300000).toISOString()
                }
            ];

            this.notifications = mockNotifications;
            this.updateUnreadCount();
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        if (!this.notifications.length) {
            list.innerHTML = '<div class="notification-item"><div class="notification-message">No hay notificaciones</div></div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 onclick="notificationsManager.markAsRead(${notification.id})">
                <div class="notification-title">${Helpers.sanitizeHTML(notification.title)}</div>
                <div class="notification-message">${Helpers.sanitizeHTML(notification.message)}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
        `).join('');
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateUnreadCount();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.updateUnreadCount();
        this.renderNotifications();
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        };

        this.notifications.unshift(newNotification);
        
        this.updateUnreadCount();
        this.renderNotifications();
        
        // Mostrar notificación toast
        this.showToast(newNotification);
    }

    showToast(notification) {
        Helpers.showToast(notification.message, notification.type);
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        return `Hace ${days} días`;
    }

    startPolling() {
        // Polling para nuevas notificaciones cada 30 segundos
        setInterval(() => {
            this.checkNewNotifications();
        }, 30000);
    }

    async checkNewNotifications() {
        // En producción, verificar con la API si hay nuevas notificaciones
        try {
            // Ejemplo: const newNotifications = await apiClient.getNewNotifications();
            // this.processNewNotifications(newNotifications);
        } catch (error) {
            console.error('Error checking new notifications:', error);
        }
    }

    processNewNotifications(newNotifications) {
        if (newNotifications && newNotifications.length > 0) {
            newNotifications.forEach(notification => {
                this.addNotification(notification);
            });
        }
    }

    // Método para notificaciones de reserva en tiempo real
    notifyNewReserva(reserva) {
        this.addNotification({
            title: 'Nueva Reserva',
            message: `Reserva #${reserva.id} creada para ${Helpers.formatDate(reserva.fecha_reserva)}`,
            type: CONSTANTS.NOTIFICATION_TYPES.RESERVA
        });
    }

    // Método para notificaciones de error
    notifyError(message) {
        this.addNotification({
            title: 'Error del Sistema',
            message: message,
            type: CONSTANTS.NOTIFICATION_TYPES.ERROR
        });
    }
}