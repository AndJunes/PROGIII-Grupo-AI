// CRUD Operations Manager
class CRUDManager {
    constructor() {
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        // Botones de agregar
        document.getElementById('addReservaBtn')?.addEventListener('click', () => this.showReservaModal());
        document.getElementById('addSalonBtn')?.addEventListener('click', () => this.showSalonModal());
        document.getElementById('addServicioBtn')?.addEventListener('click', () => this.showServicioModal());
        document.getElementById('addTurnoBtn')?.addEventListener('click', () => this.showTurnoModal());
        document.getElementById('addUsuarioBtn')?.addEventListener('click', () => this.showUsuarioModal());
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadReservas(),
                this.loadSalones(),
                this.loadServicios(),
                this.loadTurnos(),
                this.loadUsuarios()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error al cargar datos iniciales', 'error');
        }
    }

    // === RESERVAS ===
    async loadReservas() {
        try {
            const reservas = await apiClient.request('/reservas/all');
            this.renderReservas(reservas);
        } catch (error) {
            console.error('Error loading reservas:', error);
            document.getElementById('reservasTableBody').innerHTML = 
                '<tr><td colspan="8" class="error">Error cargando reservas</td></tr>';
        }
    }

    renderReservas(reservas) {
        const tbody = document.getElementById('reservasTableBody');
        
        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay reservas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = reservas.map(reserva => `
            <tr>
                <td>${reserva.id}</td>
                <td>${this.formatDate(reserva.fecha_reserva)}</td>
                <td>${reserva.salon_nombre || 'N/A'}</td>
                <td>${reserva.turno_nombre || 'N/A'}</td>
                <td>${reserva.tematica || 'Sin temática'}</td>
                <td>$${this.formatCurrency(reserva.importe_total)}</td>
                <td><span class="status-badge ${reserva.activo ? 'active' : 'inactive'}">${reserva.activo ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editReserva(${reserva.id})">
                            <span class="btn-icon">✏️</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteReserva(${reserva.id})">
                            <span class="btn-icon">🗑️</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    showReservaModal(reserva = null) {
        this.currentEditingId = reserva?.id || null;
        
        const modalHTML = `
            <div class="modal-overlay active" id="reservaModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${reserva ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="reservaForm" class="form-grid">
                            <div class="form-group">
                                <label for="fecha_reserva">Fecha de Reserva</label>
                                <input type="date" id="fecha_reserva" class="form-control" required 
                                       value="${reserva?.fecha_reserva || ''}">
                            </div>
                            <div class="form-group">
                                <label for="salon_id">Salón</label>
                                <select id="salon_id" class="form-control" required>
                                    <option value="">Seleccionar salón</option>
                                    <!-- Opciones se cargarán dinámicamente -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="turno_id">Turno</label>
                                <select id="turno_id" class="form-control" required>
                                    <option value="">Seleccionar turno</option>
                                    <!-- Opciones se cargarán dinámicamente -->
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="tematica">Temática</label>
                                <input type="text" id="tematica" class="form-control" 
                                       value="${reserva?.tematica || ''}" placeholder="Ej: Cars, Toy Story">
                            </div>
                            <div class="form-group">
                                <label for="importe_salon">Importe Salón</label>
                                <input type="number" id="importe_salon" class="form-control" step="0.01"
                                       value="${reserva?.importe_salon || ''}" required>
                            </div>
                            <div class="form-group full-width">
                                <label>Servicios Adicionales</label>
                                <div id="serviciosContainer">
                                    <!-- Servicios se cargarán dinámicamente -->
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveReserva()">
                            ${reserva ? 'Actualizar' : 'Crear'} Reserva
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
        this.loadSelectOptions();
    }

    // Métodos similares para salones, servicios, turnos y usuarios...
    // Por brevedad, muestro solo el esqueleto

    async loadSalones() {
        // Implementar carga de salones
    }

    async loadServicios() {
        // Implementar carga de servicios
    }

    async loadTurnos() {
        // Implementar carga de turnos
    }

    async loadUsuarios() {
        try {
            const usuarios = await apiClient.getUsuarios();
            this.renderUsuarios(usuarios);
        } catch (error) {
            console.error('Error loading usuarios:', error);
            document.getElementById('usuariosTableBody').innerHTML = 
                '<tr><td colspan="8" class="error">Error cargando usuarios</td></tr>';
        }
    }

    renderUsuarios(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.usuario_id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellido}</td>
                <td>${usuario.nombre_usuario}</td>
                <td>${this.getTipoUsuario(usuario.tipo_usuario)}</td>
                <td>${usuario.celular || 'No especificado'}</td>
                <td><span class="status-badge active">Activo</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editUsuario(${usuario.usuario_id})">
                            <span class="btn-icon">✏️</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteUsuario(${usuario.usuario_id})">
                            <span class="btn-icon">🗑️</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Utilidades
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR').format(amount);
    }

    getTipoUsuario(tipo) {
        const tipos = {
            1: "Administrador",
            2: "Empleado", 
            3: "Cliente"
        };
        return tipos[tipo] || "Desconocido";
    }

    showNotification(message, type = 'info') {
        // Implementar notificación toast
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
        this.currentEditingId = null;
    }
}

// Inicializar CRUD Manager
document.addEventListener('DOMContentLoaded', () => {
    window.crudManager = new CRUDManager();
});