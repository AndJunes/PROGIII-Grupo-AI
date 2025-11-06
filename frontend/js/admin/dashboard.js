// Dashboard Manager - Estadísticas y datos principales
class DashboardManager {
    constructor() {
        this.stats = {
            totalReservas: 0,
            ingresosTotales: 0,
            totalUsuarios: 0,
            reservasHoy: 0
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.setupAutoRefresh();
    }

    bindEvents() {
        // Recargar datos cuando se active la sección dashboard
        document.addEventListener('sectionChanged', (e) => {
            if (e.detail.section === 'dashboard') {
                this.loadDashboardData();
            }
        });
    }

    async loadDashboardData() {
        try {
            this.showLoadingState(true);
            
            const [stats, recentActivity, chartData] = await Promise.all([
                this.loadStats(),
                this.loadRecentActivity(),
                this.loadChartData()
            ]);

            this.updateStats(stats);
            this.updateRecentActivity(recentActivity);
            this.updateCharts(chartData);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error al cargar los datos del dashboard');
        } finally {
            this.showLoadingState(false);
        }
    }

    async loadStats() {
        try {
            // En una implementación real, estos vendrían de endpoints específicos
            const [reservas, usuarios, reportes] = await Promise.all([
                apiClient.request('/reservas/all').catch(() => []),
                apiClient.getUsuarios().catch(() => []),
                apiClient.request('/reportes/estadisticas').catch(() => ({}))
            ]);

            const hoy = new Date().toISOString().split('T')[0];
            const reservasHoy = reservas.filter(r => r.fecha_reserva === hoy).length;
            const ingresosTotales = reservas.reduce((sum, r) => sum + (r.importe_total || 0), 0);

            return {
                totalReservas: reservas.length,
                ingresosTotales: ingresosTotales,
                totalUsuarios: usuarios.length,
                reservasHoy: reservasHoy
            };

        } catch (error) {
            console.error('Error loading stats:', error);
            return this.stats; // Retornar stats anteriores en caso de error
        }
    }

    async loadRecentActivity() {
        try {
            // Simular actividad reciente - en producción vendría de la API
            return [
                {
                    id: 1,
                    type: 'reserva',
                    icon: '📅',
                    title: 'Nueva Reserva Creada',
                    description: 'Reserva #245 para el salón Principal',
                    time: 'Hace 5 minutos',
                    user: 'María González'
                },
                {
                    id: 2,
                    type: 'usuario',
                    icon: '👥',
                    title: 'Usuario Registrado',
                    description: 'Nuevo cliente: Carlos López',
                    time: 'Hace 15 minutos',
                    user: 'Sistema'
                },
                {
                    id: 3,
                    type: 'pago',
                    icon: '💰',
                    title: 'Pago Confirmado',
                    description: 'Pago de reserva #243 procesado',
                    time: 'Hace 1 hora',
                    user: 'Sistema'
                },
                {
                    id: 4,
                    type: 'reserva',
                    icon: '📅',
                    title: 'Reserva Modificada',
                    description: 'Reserva #240 actualizada',
                    time: 'Hace 2 horas',
                    user: 'Juan Pérez'
                }
            ];
        } catch (error) {
            console.error('Error loading recent activity:', error);
            return [];
        }
    }

    async loadChartData() {
        try {
            // Datos de ejemplo para gráficos - en producción vendrían de la API
            return {
                reservasPorMes: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    data: [12, 19, 8, 15, 12, 17]
                },
                usuariosPorTipo: {
                    labels: ['Administradores', 'Empleados', 'Clientes'],
                    data: [3, 8, 34]
                },
                ingresosPorCategoria: {
                    labels: ['Salones', 'Servicios', 'Extras'],
                    data: [450000, 120000, 30000]
                },
                serviciosPopulares: {
                    labels: ['Decoración', 'Catering', 'Animación', 'Fotografía', 'Torta'],
                    data: [45, 38, 28, 22, 18]
                }
            };
        } catch (error) {
            console.error('Error loading chart data:', error);
            return null;
        }
    }

    updateStats(stats) {
        this.stats = { ...this.stats, ...stats };
        
        document.getElementById('totalReservas').textContent = stats.totalReservas;
        document.getElementById('ingresosTotales').textContent = this.formatCurrency(stats.ingresosTotales);
        document.getElementById('totalUsuarios').textContent = stats.totalUsuarios;
        document.getElementById('reservasHoy').textContent = stats.reservasHoy;
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('activityList');
        
        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-description">No hay actividad reciente</div></div></div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time} • Por ${activity.user}</div>
                </div>
            </div>
        `).join('');
    }

    updateCharts(chartData) {
        if (!chartData) return;

        // Actualizar placeholders con datos reales
        // En una implementación completa, aquí inicializarías Chart.js o similar
        this.updateChartPlaceholder('reservasChart', chartData.reservasPorMes);
        this.updateChartPlaceholder('usuariosChart', chartData.usuariosPorTipo);
        this.updateChartPlaceholder('statsReservasChart', chartData.reservasPorMes);
        this.updateChartPlaceholder('statsIngresosChart', chartData.ingresosPorCategoria);
        this.updateChartPlaceholder('statsUsuariosChart', chartData.usuariosPorTipo);
        this.updateChartPlaceholder('statsServiciosChart', chartData.serviciosPopulares);
    }

    updateChartPlaceholder(chartId, data) {
        const container = document.getElementById(chartId);
        if (!container) return;

        // Simular un gráfico simple con HTML/CSS
        // En producción, reemplazar con Chart.js o similar
        container.innerHTML = `
            <div class="simple-chart">
                <div class="chart-bars">
                    ${data.data.map((value, index) => `
                        <div class="chart-bar-container">
                            <div class="chart-bar" style="height: ${(value / Math.max(...data.data)) * 100}%"></div>
                            <span class="chart-label">${data.labels[index]}</span>
                            <span class="chart-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupAutoRefresh() {
        // Recargar datos cada 2 minutos
        setInterval(() => {
            if (document.querySelector('#dashboard-section.active')) {
                this.loadDashboardData();
            }
        }, 120000);
    }

    showLoadingState(show) {
        const elements = [
            'totalReservas', 'ingresosTotales', 'totalUsuarios', 'reservasHoy'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (show) {
                    element.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
                }
            }
        });

        // Mostrar/ocultar skeletons en actividades
        const activityList = document.getElementById('activityList');
        if (activityList) {
            if (show) {
                activityList.innerHTML = `
                    <div class="activity-item skeleton">
                        <div class="activity-icon skeleton"></div>
                        <div class="activity-content">
                            <div class="activity-title skeleton"></div>
                            <div class="activity-description skeleton"></div>
                            <div class="activity-time skeleton"></div>
                        </div>
                    </div>
                    <div class="activity-item skeleton">
                        <div class="activity-icon skeleton"></div>
                        <div class="activity-content">
                            <div class="activity-title skeleton"></div>
                            <div class="activity-description skeleton"></div>
                            <div class="activity-time skeleton"></div>
                        </div>
                    </div>
                `;
            }
        }
    }

    showError(message) {
        // Mostrar notificación de error
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Error en Dashboard',
                message: message,
                type: 'error'
            });
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }

    // Método para forzar actualización desde otras partes del sistema
    refresh() {
        this.loadDashboardData();
    }
}

// Inicializar Dashboard Manager
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});