import { API } from '../api.js';
import { CONSTANTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';
import { Validators } from '../utils/validators.js';

export class CRUDManager {
    constructor() {
        this.api = new API();
        this.currentEditingId = null;
        this.currentEntity = null;
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

    // ===== RESERVAS =====
    async loadReservas() {
        try {
            const reservas = await this.api.getAllReservas();
            this.renderReservas(reservas);
        } catch (error) {
            console.error('Error loading reservas:', error);
            this.showTableError('reservasTableBody', 'Error cargando reservas');
        }
    }

    renderReservas(reservas) {
        const tbody = document.getElementById('reservasTableBody');
        if (!tbody) return;
        
        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay reservas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = reservas.map(reserva => `
            <tr>
                <td>${reserva.id}</td>
                <td>${Helpers.formatDate(reserva.fecha_reserva)}</td>
                <td>${reserva.salon_nombre || 'N/A'}</td>
                <td>${reserva.turno_nombre || 'N/A'}</td>
                <td>${reserva.tematica || 'Sin temática'}</td>
                <td>${Helpers.formatCurrency(reserva.importe_total)}</td>
                <td><span class="status-badge ${reserva.activo ? 'active' : 'inactive'}">${reserva.activo ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editReserva(${reserva.id})">
                            <span class="btn-icon material-icons">edit</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteReserva(${reserva.id})">
                            <span class="btn-icon material-icons">delete</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showReservaModal(reserva = null) {
        this.currentEditingId = reserva?.id || null;
        this.currentEntity = 'reserva';
        
        const modalHTML = `
            <div class="modal-overlay active" id="reservaModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>${reserva ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
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
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="turno_id">Turno</label>
                                <select id="turno_id" class="form-control" required>
                                    <option value="">Seleccionar turno</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="tematica">Temática</label>
                                <input type="text" id="tematica" class="form-control" 
                                       value="${reserva?.tematica || ''}" placeholder="Ej: Cars, Toy Story">
                            </div>
                            <div class="form-group">
                                <label for="foto_cumpleaniero">Foto Cumpleañero</label>
                                <input type="text" id="foto_cumpleaniero" class="form-control" 
                                       value="${reserva?.foto_cumpleaniero || ''}" placeholder="Nombre del archivo">
                            </div>
                            <div class="form-group">
                                <label for="importe_salon">Importe Salón</label>
                                <input type="number" id="importe_salon" class="form-control" step="0.01"
                                       value="${reserva?.importe_salon || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="importe_total">Importe Total</label>
                                <input type="number" id="importe_total" class="form-control" step="0.01"
                                       value="${reserva?.importe_total || ''}" required>
                            </div>
                            <div class="form-group full-width">
                                <label>Servicios Adicionales</label>
                                <div id="serviciosContainer" class="services-grid">
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
        await this.loadSelectOptions();
        
        // Si estamos editando, marcar servicios seleccionados
        if (reserva?.servicios) {
            this.markSelectedServicios(reserva.servicios);
        }
    }

    async saveReserva() {
        try {
            const formData = this.getFormData('reservaForm');
            const selectedServicios = this.getSelectedServicios();
            
            // Agregar servicios al formData
            if (selectedServicios.length > 0) {
                formData.servicios = selectedServicios;
            }

            const validation = Validators.validateForm(formData, {
                fecha_reserva: ['required'],
                salon_id: ['required'],
                turno_id: ['required'],
                importe_salon: ['required', 'number', 'minValue:0'],
                importe_total: ['required', 'number', 'minValue:0']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            if (this.currentEditingId) {
                await this.api.updateReserva(this.currentEditingId, formData);
                this.showNotification('Reserva actualizada exitosamente', 'success');
            } else {
                await this.api.createReserva(formData);
                this.showNotification('Reserva creada exitosamente', 'success');
            }

            this.closeModal();
            await this.loadReservas();
        } catch (error) {
            console.error('Error saving reserva:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editReserva(id) {
        try {
            const reserva = await this.api.getReserva(id);
            this.showReservaModal(reserva);
        } catch (error) {
            console.error('Error loading reserva:', error);
            this.showNotification('Error al cargar la reserva', 'error');
        }
    }

    async deleteReserva(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
            return;
        }

        try {
            await this.api.deleteReserva(id);
            this.showNotification('Reserva eliminada exitosamente', 'success');
            await this.loadReservas();
        } catch (error) {
            console.error('Error deleting reserva:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // ===== SALONES =====
    async loadSalones() {
        try {
            const salones = await this.api.getSalones();
            this.renderSalones(salones);
        } catch (error) {
            console.error('Error loading salones:', error);
            this.showTableError('salonesTableBody', 'Error cargando salones');
        }
    }

    renderSalones(salones) {
        const tbody = document.getElementById('salonesTableBody');
        if (!tbody) return;
        
        if (!salones || salones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay salones registrados</td></tr>';
            return;
        }

        tbody.innerHTML = salones.map(salon => `
            <tr>
                <td>${salon.id}</td>
                <td>${Helpers.sanitizeHTML(salon.titulo)}</td>
                <td>${salon.capacidad}</td>
                <td>${Helpers.formatCurrency(salon.importe)}</td>
                <td>${Helpers.sanitizeHTML(salon.direccion || 'No especificada')}</td>
                <td><span class="status-badge active">Activo</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editSalon(${salon.id})">
                            <span class="btn-icon material-icons">edit</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteSalon(${salon.id})">
                            <span class="btn-icon material-icons">delete</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showSalonModal(salon = null) {
        this.currentEditingId = salon?.id || null;
        this.currentEntity = 'salon';
        
        const modalHTML = `
            <div class="modal-overlay active" id="salonModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>${salon ? 'Editar Salón' : 'Nuevo Salón'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="salonForm" class="form-grid">
                            <div class="form-group">
                                <label for="titulo">Nombre del Salón</label>
                                <input type="text" id="titulo" class="form-control" required 
                                       value="${salon?.titulo || ''}" placeholder="Ej: Salón Principal">
                            </div>
                            <div class="form-group">
                                <label for="direccion">Dirección</label>
                                <input type="text" id="direccion" class="form-control"
                                       value="${salon?.direccion || ''}" placeholder="Dirección completa">
                            </div>
                            <div class="form-group">
                                <label for="capacidad">Capacidad</label>
                                <input type="number" id="capacidad" class="form-control" required
                                       value="${salon?.capacidad || ''}" min="1" placeholder="Número de personas">
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio Base</label>
                                <input type="number" id="importe" class="form-control" step="0.01" required
                                       value="${salon?.importe || ''}" min="0" placeholder="Precio en ARS">
                            </div>
                            <div class="form-group">
                                <label for="latitud">Latitud</label>
                                <input type="number" id="latitud" class="form-control" step="any"
                                       value="${salon?.latitud || ''}" placeholder="Coordenada latitud">
                            </div>
                            <div class="form-group">
                                <label for="longitud">Longitud</label>
                                <input type="number" id="longitud" class="form-control" step="any"
                                       value="${salon?.longitud || ''}" placeholder="Coordenada longitud">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveSalon()">
                            ${salon ? 'Actualizar' : 'Crear'} Salón
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    async saveSalon() {
        try {
            const formData = this.getFormData('salonForm');
            const validation = Validators.validateForm(formData, {
                titulo: ['required', 'minLength:2'],
                capacidad: ['required', 'number', 'minValue:1'],
                importe: ['required', 'number', 'minValue:0']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            if (this.currentEditingId) {
                await this.api.updateSalon(this.currentEditingId, formData);
                this.showNotification('Salón actualizado exitosamente', 'success');
            } else {
                await this.api.createSalon(formData);
                this.showNotification('Salón creado exitosamente', 'success');
            }

            this.closeModal();
            await this.loadSalones();
        } catch (error) {
            console.error('Error saving salon:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editSalon(id) {
        try {
            const salon = await this.api.getSalon(id);
            this.showSalonModal(salon);
        } catch (error) {
            console.error('Error loading salon:', error);
            this.showNotification('Error al cargar el salón', 'error');
        }
    }

    async deleteSalon(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este salón?')) {
            return;
        }

        try {
            await this.api.deleteSalon(id);
            this.showNotification('Salón eliminado exitosamente', 'success');
            await this.loadSalones();
        } catch (error) {
            console.error('Error deleting salon:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // ===== SERVICIOS =====
    async loadServicios() {
        try {
            const servicios = await this.api.getServicios();
            this.renderServicios(servicios);
        } catch (error) {
            console.error('Error loading servicios:', error);
            this.showTableError('serviciosTableBody', 'Error cargando servicios');
        }
    }

    renderServicios(servicios) {
        const tbody = document.getElementById('serviciosTableBody');
        if (!tbody) return;
        
        if (!servicios || servicios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay servicios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = servicios.map(servicio => `
            <tr>
                <td>${servicio.id}</td>
                <td>${Helpers.sanitizeHTML(servicio.descripcion)}</td>
                <td>${Helpers.sanitizeHTML(servicio.descripcion)}</td>
                <td>${Helpers.formatCurrency(servicio.importe)}</td>
                <td><span class="status-badge ${servicio.activo ? 'active' : 'inactive'}">${servicio.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editServicio(${servicio.id})">
                            <span class="btn-icon material-icons">edit</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteServicio(${servicio.id})">
                            <span class="btn-icon material-icons">delete</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showServicioModal(servicio = null) {
        this.currentEditingId = servicio?.id || null;
        this.currentEntity = 'servicio';
        
        const modalHTML = `
            <div class="modal-overlay active" id="servicioModal">
                <div class="modal modal-sm">
                    <div class="modal-header">
                        <h3>${servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="servicioForm" class="form-grid">
                            <div class="form-group">
                                <label for="descripcion">Descripción del Servicio</label>
                                <input type="text" id="descripcion" class="form-control" required 
                                       value="${servicio?.descripcion || ''}" placeholder="Ej: Decoración temática">
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio</label>
                                <input type="number" id="importe" class="form-control" step="0.01" required
                                       value="${servicio?.importe || ''}" min="0" placeholder="Precio en ARS">
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${servicio?.activo !== false ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${servicio?.activo === false ? 'selected' : ''}>Inactivo</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveServicio()">
                            ${servicio ? 'Actualizar' : 'Crear'} Servicio
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    async saveServicio() {
        try {
            const formData = this.getFormData('servicioForm');
            const validation = Validators.validateForm(formData, {
                descripcion: ['required', 'minLength:3'],
                importe: ['required', 'number', 'minValue:0'],
                activo: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Convertir a número
            formData.activo = parseInt(formData.activo);

            if (this.currentEditingId) {
                await this.api.updateServicio(this.currentEditingId, formData);
                this.showNotification('Servicio actualizado exitosamente', 'success');
            } else {
                await this.api.createServicio(formData);
                this.showNotification('Servicio creado exitosamente', 'success');
            }

            this.closeModal();
            await this.loadServicios();
        } catch (error) {
            console.error('Error saving servicio:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editServicio(id) {
        try {
            const servicio = await this.api.getServicio(id);
            this.showServicioModal(servicio);
        } catch (error) {
            console.error('Error loading servicio:', error);
            this.showNotification('Error al cargar el servicio', 'error');
        }
    }

    async deleteServicio(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            return;
        }

        try {
            await this.api.deleteServicio(id);
            this.showNotification('Servicio eliminado exitosamente', 'success');
            await this.loadServicios();
        } catch (error) {
            console.error('Error deleting servicio:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // ===== TURNOS =====
    async loadTurnos() {
        try {
            const turnos = await this.api.getTurnos();
            this.renderTurnos(turnos);
        } catch (error) {
            console.error('Error loading turnos:', error);
            this.showTableError('turnosTableBody', 'Error cargando turnos');
        }
    }

    renderTurnos(turnos) {
        const tbody = document.getElementById('turnosTableBody');
        if (!tbody) return;
        
        if (!turnos || turnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay turnos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = turnos.map(turno => `
            <tr>
                <td>${turno.id}</td>
                <td>Turno ${turno.orden}</td>
                <td>${this.formatTime(turno.hora_desde)}</td>
                <td>${this.formatTime(turno.hora_hasta)}</td>
                <td><span class="status-badge ${turno.activo ? 'active' : 'inactive'}">${turno.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editTurno(${turno.id})">
                            <span class="btn-icon material-icons">edit</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteTurno(${turno.id})">
                            <span class="btn-icon material-icons">delete</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showTurnoModal(turno = null) {
        this.currentEditingId = turno?.id || null;
        this.currentEntity = 'turno';
        
        const modalHTML = `
            <div class="modal-overlay active" id="turnoModal">
                <div class="modal modal-sm">
                    <div class="modal-header">
                        <h3>${turno ? 'Editar Turno' : 'Nuevo Turno'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="turnoForm" class="form-grid">
                            <div class="form-group">
                                <label for="orden">Orden</label>
                                <input type="number" id="orden" class="form-control" required 
                                       value="${turno?.orden || ''}" min="1" placeholder="Número de orden">
                            </div>
                            <div class="form-group">
                                <label for="hora_desde">Hora Inicio</label>
                                <input type="time" id="hora_desde" class="form-control" required
                                       value="${turno?.hora_desde || ''}">
                            </div>
                            <div class="form-group">
                                <label for="hora_hasta">Hora Fin</label>
                                <input type="time" id="hora_hasta" class="form-control" required
                                       value="${turno?.hora_hasta || ''}">
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${turno?.activo !== false ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${turno?.activo === false ? 'selected' : ''}>Inactivo</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveTurno()">
                            ${turno ? 'Actualizar' : 'Crear'} Turno
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    async saveTurno() {
        try {
            const formData = this.getFormData('turnoForm');
            const validation = Validators.validateForm(formData, {
                orden: ['required', 'number', 'minValue:1'],
                hora_desde: ['required'],
                hora_hasta: ['required'],
                activo: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Validar que hora_hasta sea mayor que hora_desde
            if (formData.hora_desde >= formData.hora_hasta) {
                this.showFormErrors({ hora_hasta: 'La hora de fin debe ser mayor a la hora de inicio' });
                return;
            }

            // Convertir a número
            formData.activo = parseInt(formData.activo);

            if (this.currentEditingId) {
                await this.api.updateTurno(this.currentEditingId, formData);
                this.showNotification('Turno actualizado exitosamente', 'success');
            } else {
                await this.api.createTurno(formData);
                this.showNotification('Turno creado exitosamente', 'success');
            }

            this.closeModal();
            await this.loadTurnos();
        } catch (error) {
            console.error('Error saving turno:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editTurno(id) {
        try {
            const turno = await this.api.getTurno(id);
            this.showTurnoModal(turno);
        } catch (error) {
            console.error('Error loading turno:', error);
            this.showNotification('Error al cargar el turno', 'error');
        }
    }

    async deleteTurno(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este turno?')) {
            return;
        }

        try {
            await this.api.deleteTurno(id);
            this.showNotification('Turno eliminado exitosamente', 'success');
            await this.loadTurnos();
        } catch (error) {
            console.error('Error deleting turno:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // ===== USUARIOS =====
    async loadUsuarios() {
        try {
            const usuarios = await this.api.getUsuarios();
            this.renderUsuarios(usuarios);
        } catch (error) {
            console.error('Error loading usuarios:', error);
            this.showTableError('usuariosTableBody', 'Error cargando usuarios');
        }
    }

    renderUsuarios(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;
        
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = usuarios.map(usuario => `
            <tr>
                <td>${usuario.usuario_id}</td>
                <td>${Helpers.sanitizeHTML(usuario.nombre)}</td>
                <td>${Helpers.sanitizeHTML(usuario.apellido)}</td>
                <td>${Helpers.sanitizeHTML(usuario.nombre_usuario)}</td>
                <td>${Helpers.getTipoUsuario(usuario.tipo_usuario)}</td>
                <td>${usuario.celular || 'No especificado'}</td>
                <td><span class="status-badge active">Activo</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="crudManager.editUsuario(${usuario.usuario_id})">
                            <span class="btn-icon material-icons">edit</span>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="crudManager.deleteUsuario(${usuario.usuario_id})">
                            <span class="btn-icon material-icons">delete</span>
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async showUsuarioModal(usuario = null) {
        this.currentEditingId = usuario?.usuario_id || null;
        this.currentEntity = 'usuario';
        
        const modalHTML = `
            <div class="modal-overlay active" id="usuarioModal">
                <div class="modal modal-sm">
                    <div class="modal-header">
                        <h3>${usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="usuarioForm" class="form-grid">
                            <div class="form-group">
                                <label for="nombre">Nombre</label>
                                <input type="text" id="nombre" class="form-control" required 
                                       value="${usuario?.nombre || ''}">
                            </div>
                            <div class="form-group">
                                <label for="apellido">Apellido</label>
                                <input type="text" id="apellido" class="form-control" required
                                       value="${usuario?.apellido || ''}">
                            </div>
                            <div class="form-group">
                                <label for="nombre_usuario">Usuario</label>
                                <input type="text" id="nombre_usuario" class="form-control" required
                                       value="${usuario?.nombre_usuario || ''}">
                            </div>
                            <div class="form-group">
                                <label for="contrasenia">Contraseña</label>
                                <input type="password" id="contrasenia" class="form-control" 
                                       ${!usuario ? 'required' : ''} 
                                       placeholder="${usuario ? 'Dejar vacío para mantener actual' : ''}">
                            </div>
                            <div class="form-group">
                                <label for="tipo_usuario">Tipo de Usuario</label>
                                <select id="tipo_usuario" class="form-control" required>
                                    <option value="1" ${usuario?.tipo_usuario == 1 ? 'selected' : ''}>Administrador</option>
                                    <option value="2" ${usuario?.tipo_usuario == 2 ? 'selected' : ''}>Empleado</option>
                                    <option value="3" ${usuario?.tipo_usuario == 3 ? 'selected' : ''}>Cliente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="celular">Teléfono</label>
                                <input type="tel" id="celular" class="form-control"
                                       value="${usuario?.celular || ''}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveUsuario()">
                            ${usuario ? 'Actualizar' : 'Crear'} Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    async saveUsuario() {
        try {
            const formData = this.getFormData('usuarioForm');
            const validation = Validators.validateForm(formData, {
                nombre: ['required', 'minLength:2'],
                apellido: ['required', 'minLength:2'],
                nombre_usuario: ['required', 'minLength:3'],
                tipo_usuario: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Si estamos editando y no se proporcionó contraseña, eliminar el campo
            if (this.currentEditingId && !formData.contrasenia) {
                delete formData.contrasenia;
            }

            if (this.currentEditingId) {
                await this.api.updateUsuario(this.currentEditingId, formData);
                this.showNotification('Usuario actualizado exitosamente', 'success');
            } else {
                await this.api.createUsuario(formData);
                this.showNotification('Usuario creado exitosamente', 'success');
            }

            this.closeModal();
            await this.loadUsuarios();
        } catch (error) {
            console.error('Error saving usuario:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editUsuario(id) {
        try {
            const usuario = await this.api.getUsuario(id);
            this.showUsuarioModal(usuario);
        } catch (error) {
            console.error('Error loading usuario:', error);
            this.showNotification('Error al cargar el usuario', 'error');
        }
    }

    async deleteUsuario(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            return;
        }

        try {
            await this.api.deleteUsuario(id);
            this.showNotification('Usuario eliminado exitosamente', 'success');
            await this.loadUsuarios();
        } catch (error) {
            console.error('Error deleting usuario:', error);
            this.showNotification(error.message, 'error');
        }
    }

    // ===== MÉTODOS AUXILIARES =====
    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (value !== '') {
                data[key] = value;
            }
        }
        
        return data;
    }

    showFormErrors(errors) {
        // Limpiar errores anteriores
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });

        // Mostrar nuevos errores
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            const errorElement = input?.parentElement?.querySelector('.error-message');
            
            if (input && errorElement) {
                input.classList.add('input-error');
                errorElement.textContent = message;
            }
        }
    }

    showTableError(tableBodyId, message) {
        const tbody = document.getElementById(tableBodyId);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="error">${message}</td></tr>`;
        }
    }

    showNotification(message, type = 'info') {
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: type === 'error' ? 'Error' : 'Éxito',
                message: message,
                type: type
            });
        } else {
            Helpers.showToast(message, type);
        }
    }

    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
        this.currentEditingId = null;
        this.currentEntity = null;
    }

    async loadSelectOptions() {
        // Cargar opciones para selects dinámicos
        try {
            const [salones, turnos, servicios] = await Promise.all([
                this.api.getSalones(),
                this.api.getTurnos(),
                this.api.getServicios()
            ]);

            this.populateSelect('salon_id', salones, 'id', 'titulo');
            this.populateSelect('turno_id', turnos, 'id', this.formatTurnoForSelect.bind(this));
            this.populateServicios(servicios);
        } catch (error) {
            console.error('Error loading select options:', error);
        }
    }

    populateSelect(selectId, data, valueKey, textKeyOrFunction) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Mantener la opción por defecto
        const defaultOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (defaultOption) {
            select.appendChild(defaultOption);
        }

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            
            if (typeof textKeyOrFunction === 'function') {
                option.textContent = textKeyOrFunction(item);
            } else {
                option.textContent = item[textKeyOrFunction];
            }
            
            select.appendChild(option);
        });
    }

    formatTurnoForSelect(turno) {
        return `Turno ${turno.orden} (${this.formatTime(turno.hora_desde)} - ${this.formatTime(turno.hora_hasta)})`;
    }

    populateServicios(servicios) {
        const container = document.getElementById('serviciosContainer');
        if (!container) return;

        container.innerHTML = servicios.map(servicio => `
            <div class="checkbox service-checkbox">
                <input type="checkbox" id="servicio_${servicio.id}" value="${servicio.id}" 
                       data-importe="${servicio.importe}">
                <label for="servicio_${servicio.id}">
                    ${servicio.descripcion} - ${Helpers.formatCurrency(servicio.importe)}
                </label>
            </div>
        `).join('');

        // Agregar evento para calcular total automáticamente
        this.setupServiciosEvents();
    }

    setupServiciosEvents() {
        const checkboxes = document.querySelectorAll('#serviciosContainer input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateTotalImporte();
            });
        });
    }

    calculateTotalImporte() {
        const importeSalon = parseFloat(document.getElementById('importe_salon').value) || 0;
        const checkboxes = document.querySelectorAll('#serviciosContainer input[type="checkbox"]:checked');
        
        let serviciosTotal = 0;
        checkboxes.forEach(checkbox => {
            serviciosTotal += parseFloat(checkbox.dataset.importe) || 0;
        });

        const total = importeSalon + serviciosTotal;
        document.getElementById('importe_total').value = total.toFixed(2);
    }

    getSelectedServicios() {
        const checkboxes = document.querySelectorAll('#serviciosContainer input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => ({
            servicio_id: parseInt(checkbox.value),
            importe: parseFloat(checkbox.dataset.importe) || 0
        }));
    }

    markSelectedServicios(serviciosSeleccionados) {
        if (!serviciosSeleccionados) return;
        
        serviciosSeleccionados.forEach(servicio => {
            const checkbox = document.getElementById(`servicio_${servicio.servicio_id}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        this.calculateTotalImporte();
    }

    formatTime(timeString) {
        if (!timeString) return 'N/A';
        // Convertir formato HH:MM:SS a HH:MM
        return timeString.substring(0, 5);
    }

    // Método para refrescar datos específicos
    refreshData(entity) {
        switch (entity) {
            case 'reservas':
                return this.loadReservas();
            case 'salones':
                return this.loadSalones();
            case 'servicios':
                return this.loadServicios();
            case 'turnos':
                return this.loadTurnos();
            case 'usuarios':
                return this.loadUsuarios();
            default:
                return this.loadInitialData();
        }
    }

    // Método para obtener estadísticas rápidas
    async getQuickStats() {
        try {
            const [reservas, usuarios, salones, servicios, turnos] = await Promise.all([
                this.api.getAllReservas().catch(() => []),
                this.api.getUsuarios().catch(() => []),
                this.api.getSalones().catch(() => []),
                this.api.getServicios().catch(() => []),
                this.api.getTurnos().catch(() => [])
            ]);

            return {
                totalReservas: reservas.length,
                totalUsuarios: usuarios.length,
                totalSalones: salones.length,
                totalServicios: servicios.length,
                totalTurnos: turnos.length,
                ingresosTotales: reservas.reduce((sum, r) => sum + (r.importe_total || 0), 0)
            };
        } catch (error) {
            console.error('Error getting quick stats:', error);
            return null;
        }
    }
}