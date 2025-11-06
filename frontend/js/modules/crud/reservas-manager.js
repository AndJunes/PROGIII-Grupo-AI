import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class ReservasManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Reserva';
        this.salones = [];
        this.servicios = [];
        this.turnos = [];
        this.usuarios = [];
    }

    async loadDependencies() {
        try {
            [this.salones, this.servicios, this.turnos, this.usuarios] = await Promise.all([
                this.api.getSalones(),
                this.api.getServicios(),
                this.api.getTurnos(),
                this.api.getUsuarios()
            ]);
        } catch (error) {
            console.error('Error loading dependencies:', error);
        }
    }

    async loadReservas() {
        this.showLoadingState('reservasTableBody');
        
        try {
            await this.loadDependencies();
            const reservas = await this.api.getReservas();
            this.renderReservas(reservas);
        } catch (error) {
            console.error('Error loading reservas:', error);
            this.showTableError('reservasTableBody', 'Error cargando reservas');
        }
    }

    renderReservas(reservas) {
        const columns = [
            { key: 'id', title: 'ID' },
            { 
                key: 'fecha_reserva', 
                title: 'Fecha',
                type: 'date'
            },
            { 
                key: 'salon_id', 
                title: 'Salón',
                formatter: (value) => this.getSalonName(value)
            },
            { 
                key: 'turno_id', 
                title: 'Turno',
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
                key: 'estado', 
                title: 'Estado',
                formatter: (value) => this.getEstadoBadge(value)
            }
        ];

        this.renderTable('reservasTableBody', reservas, columns, 'No hay reservas registradas');
    }

    getSalonName(salonId) {
        const salon = this.salones.find(s => s.salon_id === salonId);
        return salon ? salon.titulo : 'N/A';
    }

    getTurnoInfo(turnoId) {
        const turno = this.turnos.find(t => t.id === turnoId);
        return turno ? `Turno ${turno.orden}` : 'N/A';
    }

    getEstadoBadge(estado) {
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
        this.currentEditingId = reserva?.id || null;
        this.currentEntity = 'reserva';
        
        await this.loadDependencies();
        
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
                                    ${this.salones.map(salon => 
                                        `<option value="${salon.salon_id}" ${reserva?.salon_id == salon.salon_id ? 'selected' : ''}>
                                            ${salon.titulo} - Capacidad: ${salon.capacidad}
                                        </option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="turno_id">Turno</label>
                                <select id="turno_id" class="form-control" required>
                                    <option value="">Seleccionar turno</option>
                                    ${this.turnos.map(turno => 
                                        `<option value="${turno.id}" ${reserva?.turno_id == turno.id ? 'selected' : ''}>
                                            Turno ${turno.orden} (${this.formatTime(turno.hora_desde)} - ${this.formatTime(turno.hora_hasta)})
                                        </option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="tematica">Temática</label>
                                <input type="text" id="tematica" class="form-control"
                                       value="${reserva?.tematica || ''}" placeholder="Temática del evento">
                            </div>
                            <div class="form-group">
                                <label for="importe_total">Importe Total</label>
                                <input type="number" id="importe_total" class="form-control" step="0.01" required
                                       value="${reserva?.importe_total || ''}" min="0" placeholder="Importe total">
                            </div>
                            <div class="form-group">
                                <label for="estado">Estado</label>
                                <select id="estado" class="form-control" required>
                                    <option value="pendiente" ${reserva?.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="confirmada" ${reserva?.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                                    <option value="cancelada" ${reserva?.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                                    <option value="completada" ${reserva?.estado === 'completada' ? 'selected' : ''}>Completada</option>
                                </select>
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
            const validation = Validators.validateForm(formData, {
                fecha_reserva: ['required'],
                salon_id: ['required', 'number'],
                turno_id: ['required', 'number'],
                importe_total: ['required', 'number', 'minValue:0'],
                estado: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Convertir a números
            formData.salon_id = parseInt(formData.salon_id);
            formData.turno_id = parseInt(formData.turno_id);
            formData.importe_total = parseFloat(formData.importe_total);

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