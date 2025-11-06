// Notifications Manager
class NotificationsManager {
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
            // Simular carga de notificaciones
            // En producción, esto vendría de tu API
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
        
        if (!this.notifications.length) {
            list.innerHTML = '<div class="notification-item">No hay notificaciones</div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 onclick="notificationsManager.markAsRead(${notification.id})">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
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
        this.notifications.unshift({
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        });
        
        this.updateUnreadCount();
        this.renderNotifications();
        
        // Mostrar notificación toast
        this.showToast(notification);
    }

    showToast(notification) {
        // Implementar toast notification
        console.log('Nueva notificación:', notification);
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
        // Por ahora es solo un placeholder
    }
}

// Inicializar Notifications Manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsManager = new NotificationsManager();
});