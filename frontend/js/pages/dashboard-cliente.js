// Función simple para hacer requests a la API
async function apiRequest(endpoint) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://localhost:3006/api${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en API request:', error);
        throw error;
    }
}

// Función para verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
        window.location.href = '../index.html?auth=failed';
        return false;
    }
    
    return true;
}

// Función para logout
// Función para logout - VERSIÓN MEJORADA
function setupLogout() {
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Determinar la ruta correcta basada en la ubicación actual
            const currentPath = window.location.pathname;
            let loginPath;
            
            if (currentPath.includes('/frontend/')) {
                // Si estamos en /frontend/dashboard-cliente.html
                loginPath = 'index.html?logout=success';
            } else {
                // Si estamos en otra estructura
                loginPath = '../index.html?logout=success';
            }
            
            console.log('🚪 Redirigiendo a:', loginPath);
            window.location.href = loginPath;
        });
    });
}

// Dashboard principal
class DashboardCliente {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentData = [];
        this.currentSection = 'reservas';
        
        this.init();
    }

    async init() {
        console.log('🚀 Iniciando dashboard cliente...');
        
        // Verificar autenticación
        if (!checkAuth()) {
            return;
        }

        // Cargar datos del usuario
        this.loadUserData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Cargar la sección inicial
        await this.loadSection(this.currentSection);
        
        console.log('✅ Dashboard cliente inicializado');
    }

    setupEventListeners() {
        // Navegación entre pestañas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Paginación
        document.getElementById('prev-page').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page').addEventListener('click', () => this.nextPage());
        document.getElementById('prev-page-bottom').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page-bottom').addEventListener('click', () => this.nextPage());

        // Logout
        setupLogout();
    }

    async switchSection(section) {
        console.log(`🔄 Cambiando a sección: ${section}`);
        
        // Actualizar pestañas activas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(section).classList.add('active');
        
        this.currentSection = section;
        this.currentPage = 1; // Resetear paginación
        await this.loadSection(section);
    }

    async loadSection(section) {
        console.log(`📦 Cargando sección: ${section}`);
        
        try {
            switch(section) {
                case 'reservas':
                    await this.loadReservas();
                    break;
                case 'salones':
                    await this.loadSalones();
                    break;
                case 'servicios':
                    await this.loadServicios();
                    break;
                case 'turnos':
                    await this.loadTurnos();
                    break;
                case 'perfil':
                    // Los datos ya están cargados
                    break;
            }
        } catch (error) {
            console.error(`❌ Error cargando ${section}:`, error);
            this.showError(section, `Error al cargar ${section}`);
        }
    }

    async loadReservas() {
        console.log('📅 Cargando reservas...');
        this.showLoading('reservas-body');
        
        try {
            const response = await apiRequest('/reservas');
            console.log('📊 Reservas cargadas:', response);
            
            this.currentData = response;
            this.totalItems = this.currentData.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            
            this.renderReservas();
            this.updatePaginationControls();
            
        } catch (error) {
            console.error('❌ Error cargando reservas:', error);
            this.showError('reservas-body', 'Error al cargar las reservas');
        }
    }

    renderReservas() {
        const tbody = document.getElementById('reservas-body');
        if (!tbody) {
            console.error('❌ No se encontró tbody para reservas');
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentItems = this.currentData.slice(startIndex, endIndex);

        console.log(`📋 Renderizando ${currentItems.length} reservas`);

        if (currentItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <div class="empty-state">
                            <span class="empty-icon">📅</span>
                            <h3>No tienes reservas</h3>
                            <p>No se encontraron reservas para mostrar</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = currentItems.map(reserva => `
            <tr>
                <td><strong>#${reserva.reserva_id}</strong></td>
                <td>${reserva.salon || 'Sin nombre'}</td>
                <td>${this.formatDate(reserva.fecha_reserva)}</td>
                <td>${reserva.hora_desde} - ${reserva.hora_hasta}</td>
                <td>${reserva.tematica || 'Sin temática'}</td>
                <td>$${this.formatCurrency(reserva.importe_total)}</td>
                <td>
                    <span class="status-badge ${reserva.activo ? 'active' : 'inactive'}">
                        ${reserva.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
            </tr>
        `).join('');

        console.log('✅ Reservas renderizadas correctamente');
    }

    async loadSalones() {
        console.log('🏢 Cargando salones...');
        this.showLoading('salones-container');
        
        try {
            const response = await apiRequest('/salones');
            console.log('🏢 Salones cargados:', response);
            this.renderSalones(response);
            
        } catch (error) {
            console.error('❌ Error cargando salones:', error);
            this.showError('salones-container', 'Error al cargar los salones');
        }
    }

    renderSalones(salones) {
        const container = document.getElementById('salones-container');
        if (!container) return;

        if (!salones || salones.length === 0) {
            container.innerHTML = '<p class="no-data">No hay salones disponibles</p>';
            return;
        }

        container.innerHTML = salones.map(salon => `
            <div class="card salon-card">
                <div class="card-header">
                    <h3>${salon.titulo}</h3>
                    <span class="price">$${this.formatCurrency(salon.importe)}</span>
                </div>
                <div class="card-body">
                    <p><strong>Dirección:</strong> ${salon.direccion}</p>
                    <p><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
                    <p><strong>Estado:</strong> 
                        <span class="status-badge ${salon.activo ? 'active' : 'inactive'}">
                            ${salon.activo ? 'Disponible' : 'No disponible'}
                        </span>
                    </p>
                </div>
            </div>
        `).join('');

        console.log('✅ Salones renderizados correctamente');
    }

    async loadServicios() {
        console.log('🛠️ Cargando servicios...');
        this.showLoading('servicios-container');
        
        try {
            const response = await apiRequest('/servicios');
            console.log('🛠️ Servicios cargados:', response);
            this.renderServicios(response.servicios);
            
        } catch (error) {
            console.error('❌ Error cargando servicios:', error);
            this.showError('servicios-container', 'Error al cargar los servicios');
        }
    }

    renderServicios(servicios) {
        const container = document.getElementById('servicios-container');
        if (!container) return;

        if (!servicios || servicios.length === 0) {
            container.innerHTML = '<p class="no-data">No hay servicios disponibles</p>';
            return;
        }

        container.innerHTML = servicios.map(servicio => `
            <div class="card servicio-card">
                <div class="card-header">
                    <h3>${servicio.descripcion}</h3>
                    <span class="price">$${this.formatCurrency(servicio.importe)}</span>
                </div>
                <div class="card-body">
                    <p>Servicio adicional para tu evento</p>
                    <p><strong>Estado:</strong> 
                        <span class="status-badge ${servicio.activo ? 'active' : 'inactive'}">
                            ${servicio.activo ? 'Disponible' : 'No disponible'}
                        </span>
                    </p>
                </div>
            </div>
        `).join('');

        console.log('✅ Servicios renderizados correctamente');
    }

    async loadTurnos() {
        console.log('⏰ Cargando turnos...');
        this.showLoading('turnos-container');
        
        try {
            const response = await apiRequest('/turnos');
            console.log('⏰ Turnos cargados:', response);
            this.renderTurnos(response.turnos);
            
        } catch (error) {
            console.error('❌ Error cargando turnos:', error);
            this.showError('turnos-container', 'Error al cargar los turnos');
        }
    }

    renderTurnos(turnos) {
        const container = document.getElementById('turnos-container');
        if (!container) return;

        if (!turnos || turnos.length === 0) {
            container.innerHTML = '<p class="no-data">No hay turnos disponibles</p>';
            return;
        }

        container.innerHTML = turnos.map(turno => `
            <div class="card turno-card">
                <div class="card-header">
                    <h3>Turno ${turno.orden}</h3>
                </div>
                <div class="card-body">
                    <p><strong>Horario:</strong> ${turno.hora_desde} - ${turno.hora_hasta}</p>
                    <p><strong>Duración:</strong> 2 horas</p>
                    <p><strong>Estado:</strong> 
                        <span class="status-badge ${turno.activo ? 'active' : 'inactive'}">
                            ${turno.activo ? 'Disponible' : 'No disponible'}
                        </span>
                    </p>
                </div>
            </div>
        `).join('');

        console.log('✅ Turnos renderizados correctamente');
    }

    // Métodos de paginación
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadSection(this.currentSection);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadSection(this.currentSection);
        }
    }

    updatePaginationControls() {
        const prevButtons = document.querySelectorAll('#prev-page, #prev-page-bottom');
        const nextButtons = document.querySelectorAll('#next-page, #next-page-bottom');
        const pageInfo = document.querySelectorAll('#page-info, #page-info-bottom');
        const itemsShown = document.getElementById('items-shown');
        const totalItems = document.getElementById('total-items');

        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

        // Actualizar botones
        prevButtons.forEach(btn => {
            btn.disabled = this.currentPage === 1;
        });
        nextButtons.forEach(btn => {
            btn.disabled = this.currentPage === this.totalPages;
        });

        // Actualizar información
        pageInfo.forEach(info => {
            info.textContent = `Página ${this.currentPage} de ${this.totalPages}`;
        });

        if (itemsShown) itemsShown.textContent = `${startIndex}-${endIndex}`;
        if (totalItems) totalItems.textContent = this.totalItems;

        console.log(`📄 Paginación: Página ${this.currentPage}/${this.totalPages}, Mostrando ${startIndex}-${endIndex} de ${this.totalItems}`);
    }

    // Métodos auxiliares
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-AR');
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    formatCurrency(amount) {
        if (!amount) return '0.00';
        try {
            return parseFloat(amount).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } catch (error) {
            return '0.00';
        }
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando...</p>
                </div>
            `;
        }
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-outline" onclick="dashboard.loadSection('${this.currentSection}')">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            console.log('👤 Datos del usuario:', userData);
            
            // Mostrar datos en el header
            const welcomeElement = document.getElementById('user-welcome');
            if (welcomeElement) {
                const nombreCompleto = `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
                welcomeElement.textContent = `Bienvenido, ${nombreCompleto || 'Usuario'}`;
            }

            // Mostrar datos en la sección de perfil
            this.displayUserData(userData);
            
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
        }
    }

    displayUserData(userData) {
        const container = document.getElementById('user-data');
        if (!container) return;

        container.innerHTML = `
            <div class="user-details">
                <div class="detail-item">
                    <label>Nombre completo:</label>
                    <span>${userData.nombre || 'N/A'} ${userData.apellido || ''}</span>
                </div>
                <div class="detail-item">
                    <label>Usuario:</label>
                    <span>${userData.nombre_usuario || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${userData.correo || userData.nombre_usuario || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Teléfono:</label>
                    <span>${userData.celular || 'No especificado'}</span>
                </div>
                <div class="detail-item">
                    <label>Tipo de usuario:</label>
                    <span class="user-type">Cliente</span>
                </div>
                <div class="detail-item">
                    <label>ID de usuario:</label>
                    <span>${userData.usuario_id || 'N/A'}</span>
                </div>
            </div>
        `;
    }
}

// Inicializar el dashboard cuando el DOM esté listo
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM cargado, iniciando dashboard...');
    dashboard = new DashboardCliente();
});

// Hacer disponible globalmente para los event listeners
window.dashboard = dashboard;