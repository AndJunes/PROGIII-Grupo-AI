import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class TurnosManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Turno';
    }

    async loadTurnos() {
        try {
            const response = await this.api.getTurnos();
            console.log('📦 Respuesta completa de API turnos:', response);
            
            // Extraer el array de turnos de la respuesta
            const turnos = response.turnos || [];
            console.log('👥 Turnos extraídos:', turnos);
            
            this.renderTurnos(turnos);
        } catch (error) {
            console.error('Error loading turnos:', error);
            this.showTableError('turnosTableBody', 'Error cargando turnos');
        }
    }

    renderTurnos(turnos) {
        const columns = [
            { key: 'turno_id', title: 'ID' },
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

    // Sobrescribir createTableRow para usar turno_id correctamente
    createTableRow(data, columns, actions = true) {
        const cells = columns.map(col => {
            let value = data[col.key];
            
            if (col.formatter) {
                value = col.formatter(value);
            } else if (col.type === 'currency') {
                value = Helpers.formatCurrency(value);
            } else if (col.type === 'date') {
                value = Helpers.formatDate(value);
            } else if (col.type === 'status') {
                const statusClass = value ? 'active' : 'inactive';
                const statusText = value ? 'Activo' : 'Inactivo';
                value = `<span class="status-badge ${statusClass}">${statusText}</span>`;
            }
            
            return `<td>${value || 'N/A'}</td>`;
        }).join('');

        const actionButtons = actions ? `
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline edit-btn" 
                            data-id="${data.turno_id}" 
                            data-entity="turno">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" 
                            data-id="${data.turno_id}" 
                            data-entity="turno">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr data-id="${data.turno_id}">${cells}${actionButtons}</tr>`;
    }

    async showTurnoModal(turno = null) {
        this.currentEditingId = turno?.turno_id || null;
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
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="hora_desde">Hora Inicio</label>
                                <input type="time" id="hora_desde" class="form-control" required
                                       value="${turno?.hora_desde?.substring(0, 5) || ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="hora_hasta">Hora Fin</label>
                                <input type="time" id="hora_hasta" class="form-control" required
                                       value="${turno?.hora_hasta?.substring(0, 5) || ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${turno?.activo !== false && turno?.activo !== 0 ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${turno?.activo === false || turno?.activo === 0 ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
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
        
        // Agregar validación en tiempo real
        this.setupRealTimeValidation('turnoForm', {
            orden: ['required', 'number', 'minValue:1'],
            hora_desde: ['required'],
            hora_hasta: ['required'],
            activo: ['required']
        });
    }

    async saveTurno() {
        try {
            // Obtener datos del formulario manualmente
            const formData = {
                orden: document.getElementById('orden').value,
                hora_desde: document.getElementById('hora_desde').value,
                hora_hasta: document.getElementById('hora_hasta').value,
                activo: document.getElementById('activo').value
            };

            console.log('Datos del formulario turno:', formData);

            // Validación
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

            // Preparar payload - agregar segundos a las horas
            const payload = {
                orden: parseInt(formData.orden),
                hora_desde: formData.hora_desde + ':00', // Agregar segundos
                hora_hasta: formData.hora_hasta + ':00', // Agregar segundos
                activo: parseInt(formData.activo)
            };

            console.log('JSON final a enviar:', JSON.stringify(payload, null, 2));

            let result;
            if (this.currentEditingId) {
                console.log('Actualizando turno ID:', this.currentEditingId);
                result = await this.api.updateTurno(this.currentEditingId, payload);
                this.showNotification('Turno actualizado exitosamente', 'success');
            } else {
                console.log('Creando nuevo turno');
                result = await this.api.createTurno(payload);
                this.showNotification('Turno creado exitosamente', 'success');
            }

            console.log('Respuesta del servidor:', result);

            this.closeModal();
            await this.loadTurnos();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'turnos' } 
            }));
            
        } catch (error) {
            console.error('Error completo saving turno:', error);
            
            let errorMessage = 'Error al guardar el turno';
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.message}`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    async editTurno(id) {
        try {
            console.log('Editando turno con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de turno inválido');
            }
            
            const turno = await this.api.getTurno(id);
            this.showTurnoModal(turno);
        } catch (error) {
            console.error('Error loading turno:', error);
            this.showNotification('Error al cargar el turno: ' + error.message, 'error');
        }
    }

    async deleteTurno(id) {
        if (!this.confirmDelete('turno')) return;

        try {
            console.log('Eliminando turno con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de turno inválido');
            }
            
            await this.api.deleteTurno(id);
            this.showNotification('Turno eliminado exitosamente', 'success');
            await this.loadTurnos();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'turnos' } 
            }));
            
        } catch (error) {
            console.error('Error deleting turno:', error);
            this.showNotification(error.message || 'Error al eliminar el turno', 'error');
        }
    }

    // Método para búsqueda y filtrado
    setupSearch() {
        const searchInput = document.getElementById('searchTurnos');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#turnosTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        const searchInput = document.getElementById('searchTurnos');
        if (searchInput) {
            searchInput.replaceWith(searchInput.cloneNode(true));
        }
    }
}