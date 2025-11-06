import { BaseCRUDManager } from './base-manager.js?v=4';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class ReservasManager extends BaseCRUDManager {
    constructor() {
        super();
        
        // --- INICIO DE CAMBIOS ---
        // comentario: aca le decimos al 'padre' (base-manager)
        // cuales son los nombres especificos para este modulo
        this.entityName = 'Reserva';
        this.tableBodyId = 'reservasTableBody';
        this.dataKey = 'reservas'; // la clave del array en el json de la api
        // --- FIN DE CAMBIOS ---

        this.salones = [];
        this.servicios = [];
        this.turnos = [];
        this.usuarios = [];
    }

    async loadDependencies() {
        try {
            // comentario: esto está bien, pero nos aseguramos
            // de que la api devuelva el array correcto
            const [salonesData, serviciosData, turnosData, usuariosData] = await Promise.all([
                this.api.getSalones(),
                this.api.getServicios(),
                this.api.getTurnos(),
                this.api.getUsuarios()
            ]);
            
            this.salones = salonesData.salones || salonesData || [];
            this.servicios = serviciosData.servicios || serviciosData || [];
            this.turnos = turnosData.turnos || turnosData || [];
            this.usuarios = usuariosData.usuarios || usuariosData || [];

        } catch (error) {
            console.error('Error loading dependencies:', error);
        }
    }

    async loadReservas() {
        // --- INICIO DE CAMBIOS ---
        // comentario: this.showLoadingState ahora existe en el 'padre'
        // y ya sabe cual es el tableBodyId, asi que no pasamos nada.
        this.showLoadingState(true);
        // --- FIN DE CAMBIOS ---
        
        try {
            await this.loadDependencies();
            const reservasData = await this.api.getReservas(); // api.getReservas() debe devolver el objeto { ..., reservas: [...] }
            this.renderReservas(reservasData);
        } catch (error) {
            console.error('Error loading reservas:', error);
            this.showTableError(this.tableBodyId, 'Error cargando reservas');
        }
    }

    renderReservas(reservasData) {
        const columns = [
            { key: 'reserva_id', title: 'ID' }, // comentario: ajustado a 'reserva_id' (como seguro viene de tu bd)
            { 
                key: 'fecha_reserva', 
                title: 'Fecha',
                type: 'date'
            },
            { 
                key: 'salon_id', 
                title: 'Salón',
                // comentario: tu api.getReservas() ya deberia traer el nombre del salon con un JOIN
                // pero si no lo hace, este formatter (que ya tenias) funciona bien
                formatter: (value) => this.getSalonName(value)
            },
            { 
                key: 'turno_id', 
                title: 'Turno',
                // comentario: lo mismo para turno
                formatter: (value) => this.getTurnoInfo(value)
            },
            { 
                key: 'tematica', 
                title: 'Temática'
            },
            { 
                key: 'importe_total', 
                title: 'Total',
                type: 'currency'
            },
            { 
                key: 'activo', // cambiado de 'estado' a 'activo' (soft delete)
                title: 'Estado',
                type: 'status' // 'status' ya sabe mostrar 'Activo' o 'Inactivo'
            }
        ];

        // comentario: le pasamos 'reservasData' (el objeto entero) a renderTable.
        // renderTable (el padre) ahora sabe que tiene que buscar la lista
        // adentro de 'reservasData[this.dataKey]' (o sea, reservasData['reservas'])
        this.renderTable(this.tableBodyId, reservasData, columns, 'No hay reservas registradas');
    }

    getSalonName(salonId) {
        const salon = this.salones.find(s => s.salon_id === salonId);
        return salon ? salon.titulo : 'N/A';
    }

    getTurnoInfo(turnoId) {
        // comentario: tu dao de turnos seguro usa 'turno_id', no 'id'
        const turno = this.turnos.find(t => t.turno_id === turnoId); 
        return turno ? `${this.formatTime(turno.hora_desde)} - ${this.formatTime(turno.hora_hasta)}` : 'N/A';
    }

    getEstadoBadge(estado) {
        // ... (esta funcion no la usamos mas, usamos el 'status' del padre) ...
        const estados = {
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada',
            'cancelada': 'Cancelada',
            'completada': 'Completada'
        };
        const estadoClass = estado ? estado.toLowerCase() : 'pendiente';
        const estadoText = estados[estado] || estado || 'Pendiente';
        return `<span class="status-badge ${estadoClass}">${estadoText}</span>`;
    }

    async showReservaModal(reserva = null) {
        this.currentEditingId = reserva?.reserva_id || null; // Usar 'reserva_id'
        this.currentEntity = 'reserva';
        
        await this.loadDependencies();
        
        // comentario: todo este html estaba bien
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
                                <input type="date" name="fecha_reserva" id="fecha_reserva" class="form-control" required 
                                    value="${reserva?.fecha_reserva ? new Date(reserva.fecha_reserva).toISOString().split('T')[0] : ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="salon_id">Salón</label>
                                <select name="salon_id" id="salon_id" class="form-control" required>
                                    <option value="">Seleccionar salón</option>
                                    ${this.salones.map(salon => 
                                        `<option value="${salon.salon_id}" ${reserva?.salon_id == salon.salon_id ? 'selected' : ''}>
                                            ${salon.titulo} - Capacidad: ${salon.capacidad}
                                        </option>`
                                    ).join('')}
                                </select>
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="turno_id">Turno</label>
                                <select name="turno_id" id="turno_id" class="form-control" required>
                                    <option value="">Seleccionar turno</option>
                                    ${this.turnos.map(turno => 
                                        `<option value="${turno.turno_id}" ${reserva?.turno_id == turno.turno_id ? 'selected' : ''}>
                                            ${this.formatTime(turno.hora_desde)} - ${this.formatTime(turno.hora_hasta)}
                                        </option>`
                                    ).join('')}
                                </select>
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="tematica">Temática</label>
                                <input type="text" name="tematica" id="tematica" class="form-control"
                                    value="${reserva?.tematica || ''}" placeholder="Temática del evento">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe_total">Importe Total</label>
                                <input type="number" name="importe_total" id="importe_total" class="form-control" step="0.01" required
                                    value="${reserva?.importe_total || ''}" min="0" placeholder="Importe total">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select name="activo" id="activo" class="form-control" required>
                                    <option value="1" ${reserva?.activo === 1 ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${reserva?.activo === 0 ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
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
    }

    async saveReserva() {
        try {
            const formData = this.getFormData('reservaForm');
            
            // comentario: tu validator.js no lo vi, pero asumo que esta logica esta bien
            const validation = Validators.validateForm(formData, {
                fecha_reserva: ['required'],
                salon_id: ['required', 'number'],
                turno_id: ['required', 'number'],
                importe_total: ['required', 'number', 'minValue:0'],
                activo: ['required'] // cambiado de 'estado' a 'activo'
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Convertir a números
            formData.salon_id = parseInt(formData.salon_id);
            formData.turno_id = parseInt(formData.turno_id);
            formData.importe_total = parseFloat(formData.importe_total);
            formData.activo = parseInt(formData.activo); // asegurarse que sea numero

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
            // comentario: la api debe devolver la reserva sola, no un objeto
            const reserva = await this.api.getReserva(id);
            this.showReservaModal(reserva);
        } catch (error) {
            console.error('Error loading reserva:', error);
            this.showNotification('Error al cargar la reserva', 'error');
        }
    }

    async deleteReserva(id) {
        if (!this.confirmDelete('reserva')) return;

        try {
            await this.api.deleteReserva(id);
            this.showNotification('Reserva eliminada exitosamente', 'success');
            await this.loadReservas();
        } catch (error) {
            console.error('Error deleting reserva:', error);
            this.showNotification(error.message, 'error');
        }
    }
}