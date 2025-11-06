import { API } from '../api.js';
import { CONSTANTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class DashboardManager {
    constructor() {
        this.api = new API();
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
            // Cargar datos reales desde la API
            const [reservas, usuarios] = await Promise.all([
                this.api.getAllReservas().catch(() => []),
                this.api.getUsuarios().catch(() => [])
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
            // En producción, esto vendría de un endpoint específico
            const reservas = await this.api.getAllReservas();
            
            // Ordenar por fecha más reciente y tomar las últimas 5
            const recentReservas = reservas
                .sort((a, b) => new Date(b.fecha_reserva) - new Date(a.fecha_reserva))
                .slice(0, 5);

            return recentReservas.map(reserva => ({
                id: reserva.id,
                type: 'reserva',
                icon: 'event',
                title: 'Nueva Reserva',
                description: `Reserva #${reserva.id} para ${reserva.salon_nombre || 'salón'}`,
                time: this.formatTimeAgo(reserva.fecha_reserva),
                user: 'Sistema'
            }));
        } catch (error) {
            console.error('Error loading recent activity:', error);
            return this.getMockActivity();
        }
    }

    getMockActivity() {
        // Datos de ejemplo cuando la API no está disponible
        return [
            {
                id: 1,
                type: 'reserva',
                icon: 'event',
                title: 'Nueva Reserva Creada',
                description: 'Reserva #245 para el salón Principal',
                time: 'Hace 5 minutos',
                user: 'María González'
            },
            {
                id: 2,
                type: 'usuario',
                icon: 'person_add',
                title: 'Usuario Registrado',
                description: 'Nuevo cliente: Carlos López',
                time: 'Hace 15 minutos',
                user: 'Sistema'
            },
            {
                id: 3,
                type: 'pago',
                icon: 'payments',
                title: 'Pago Confirmado',
                description: 'Pago de reserva #243 procesado',
                time: 'Hace 1 hora',
                user: 'Sistema'
            }
        ];
    }

    async loadChartData() {
        try {
            // Datos para gráficos - en producción vendrían de endpoints específicos
            const reservas = await this.api.getAllReservas();
            
            return {
                reservasPorMes: this.calculateReservasPorMes(reservas),
                usuariosPorTipo: await this.calculateUsuariosPorTipo(),
                ingresosPorCategoria: this.calculateIngresosPorCategoria(reservas),
                serviciosPopulares: await this.calculateServiciosPopulares()
            };
        } catch (error) {
            console.error('Error loading chart data:', error);
            return this.getMockChartData();
        }
    }

    calculateReservasPorMes(reservas) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const reservasPorMes = new Array(12).fill(0);
        
        reservas.forEach(reserva => {
            const fecha = new Date(reserva.fecha_reserva);
            const mes = fecha.getMonth();
            reservasPorMes[mes]++;
        });

        return {
            labels: meses,
            data: reservasPorMes
        };
    }

    async calculateUsuariosPorTipo() {
        try {
            const usuarios = await this.api.getUsuarios();
            const tipos = {
                'Administradores': 0,
                'Empleados': 0,
                'Clientes': 0
            };

            usuarios.forEach(usuario => {
                switch(usuario.tipo_usuario) {
                    case 1: tipos['Administradores']++; break;
                    case 2: tipos['Empleados']++; break;
                    case 3: tipos['Clientes']++; break;
                }
            });

            return {
                labels: Object.keys(tipos),
                data: Object.values(tipos)
            };
        } catch (error) {
            return {
                labels: ['Administradores', 'Empleados', 'Clientes'],
                data: [3, 8, 34]
            };
        }
    }

    calculateIngresosPorCategoria(reservas) {
        // Simular distribución de ingresos
        return {
            labels: ['Salones', 'Servicios', 'Extras'],
            data: [450000, 120000, 30000]
        };
    }

    async calculateServiciosPopulares() {
        try {
            const servicios = await this.api.getServicios();
            // Simular datos de popularidad
            return {
                labels: servicios.slice(0, 5).map(s => s.descripcion),
                data: [45, 38, 28, 22, 18]
            };
        } catch (error) {
            return {
                labels: ['Decoración', 'Catering', 'Animación', 'Fotografía', 'Torta'],
                data: [45, 38, 28, 22, 18]
            };
        }
    }

    getMockChartData() {
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
    }

    updateStats(stats) {
        this.stats = { ...this.stats, ...stats };
        
        // Actualizar elementos del DOM
        this.updateElement('totalReservas', stats.totalReservas);
        this.updateElement('ingresosTotales', Helpers.formatCurrency(stats.ingresosTotales));
        this.updateElement('totalUsuarios', stats.totalUsuarios);
        this.updateElement('reservasHoy', stats.reservasHoy);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateRecentActivity(activities) {
        const container = document.getElementById('activityList');
        if (!container) return;
        
        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-description">No hay actividad reciente</div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon material-icons">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${Helpers.sanitizeHTML(activity.title)}</div>
                    <div class="activity-description">${Helpers.sanitizeHTML(activity.description)}</div>
                    <div class="activity-time">${activity.time} • Por ${activity.user}</div>
                </div>
            </div>
        `).join('');
    }

    updateCharts(chartData) {
        if (!chartData) return;

        // Actualizar placeholders con datos reales
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

        // Crear gráfico simple con HTML/CSS
        container.innerHTML = this.createSimpleChart(data);
    }

    createSimpleChart(data) {
        const maxValue = Math.max(...data.data);
        
        return `
            <div class="simple-chart">
                <div class="chart-bars">
                    ${data.data.map((value, index) => {
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        return `
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="height: ${height}%"></div>
                                <span class="chart-label">${data.labels[index]}</span>
                                <span class="chart-value">${value}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 0) {
            return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else if (diffMinutes > 0) {
            return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
        } else {
            return 'Hace unos momentos';
        }
    }

    setupAutoRefresh() {
        // Recargar datos cada 2 minutos si el dashboard está activo
        setInterval(() => {
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection && dashboardSection.classList.contains('active')) {
                this.loadDashboardData();
            }
        }, 120000);
    }

    showLoadingState(show) {
        const statIds = ['totalReservas', 'ingresosTotales', 'totalUsuarios', 'reservasHoy'];
        
        statIds.forEach(id => {
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
                activityList.innerHTML = this.createActivitySkeletons();
            }
        }

        // Mostrar/ocultar skeletons en gráficos
        const chartIds = ['reservasChart', 'usuariosChart', 'statsReservasChart', 'statsIngresosChart', 'statsUsuariosChart', 'statsServiciosChart'];
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && show) {
                element.innerHTML = '<div class="chart-skeleton"></div>';
            }
        });
    }

    createActivitySkeletons() {
        return `
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

    showError(message) {
        console.error('Dashboard Error:', message);
        
        // Mostrar notificación de error
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Error en Dashboard',
                message: message,
                type: 'error'
            });
        }

        // Mostrar estado de error en el dashboard
        this.showErrorState();
    }

    showErrorState() {
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-description error">Error cargando actividades</div>
                    </div>
                </div>
            `;
        }
    }

    // Método para forzar actualización desde otras partes del sistema
    refresh() {
        this.loadDashboardData();
    }

    // Método para actualizar estadísticas específicas
    updateSpecificStats(newStats) {
        this.stats = { ...this.stats, ...newStats };
        this.updateStats(this.stats);
    }
}