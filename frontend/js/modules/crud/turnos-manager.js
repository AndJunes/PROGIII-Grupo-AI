import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';

export class TurnosManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Turno';
    }

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
        const columns = [
            { key: 'id', title: 'ID' },
            { 
                key: 'orden', 
                title: 'Turno',
                formatter: (value) => `Turno ${value}`
            },
            { 
                key: 'hora_desde', 
                title: 'Hora Inicio',
                formatter: (value) => this.formatTime(value)
            },
            { 
                key: 'hora_hasta', 
                title: 'Hora Fin',
                formatter: (value) => this.formatTime(value)
            },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        this.renderTable('turnosTableBody', turnos, columns, 'No hay turnos registrados');
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

            // Convertir a números
            formData.orden = parseInt(formData.orden);
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
        if (!this.confirmDelete('turno')) return;

        try {
            await this.api.deleteTurno(id);
            this.showNotification('Turno eliminado exitosamente', 'success');
            await this.loadTurnos();
        } catch (error) {
            console.error('Error deleting turno:', error);
            this.showNotification(error.message, 'error');
        }
    }
}