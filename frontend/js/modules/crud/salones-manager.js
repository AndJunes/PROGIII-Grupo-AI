import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class SalonesManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Salon';
    }

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
        const columns = [
            { key: 'salon_id', title: 'ID' },
            { key: 'titulo', title: 'Nombre' },
            { key: 'capacidad', title: 'Capacidad' },
            { key: 'importe', title: 'Precio', type: 'currency' },
            { key: 'direccion', title: 'Dirección' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        this.renderTable('salonesTableBody', salones, columns, 'No hay salones registrados');
    }

    // Sobrescribir createTableRow para usar salon_id correctamente
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
                            data-id="${data.salon_id}" 
                            data-entity="salon">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" 
                            data-id="${data.salon_id}" 
                            data-entity="salon">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr data-id="${data.salon_id}">${cells}${actionButtons}</tr>`;
    }

    async showSalonModal(salon = null) {
        this.currentEditingId = salon?.salon_id || null;
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
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="direccion">Dirección</label>
                                <input type="text" id="direccion" class="form-control"
                                       value="${salon?.direccion || ''}" placeholder="Dirección completa">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="capacidad">Capacidad</label>
                                <input type="number" id="capacidad" class="form-control" required
                                       value="${salon?.capacidad || ''}" min="1" placeholder="Número de personas">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio Base</label>
                                <input type="number" id="importe" class="form-control" step="0.01" required
                                       value="${salon?.importe || ''}" min="0" placeholder="Precio en ARS">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="latitud">Latitud</label>
                                <input type="number" id="latitud" class="form-control" step="any"
                                       value="${salon?.latitud || ''}" placeholder="Coordenada latitud">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="longitud">Longitud</label>
                                <input type="number" id="longitud" class="form-control" step="any"
                                       value="${salon?.longitud || ''}" placeholder="Coordenada longitud">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${salon?.activo !== false ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${salon?.activo === false ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
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
        
        // Agregar validación en tiempo real
        this.setupRealTimeValidation('salonForm', {
            titulo: ['required', 'minLength:2'],
            capacidad: ['required', 'number', 'minValue:1'],
            importe: ['required', 'number', 'minValue:0'],
            activo: ['required']
        });
    }

   async saveSalon() {
    try {
        // Obtener datos del formulario manualmente
        const formData = {
            titulo: document.getElementById('titulo').value,
            direccion: document.getElementById('direccion').value,
            capacidad: document.getElementById('capacidad').value,
            importe: document.getElementById('importe').value,
            latitud: document.getElementById('latitud').value,
            longitud: document.getElementById('longitud').value
        };

        console.log('Datos del formulario:', formData);

        // Validación
        const validation = Validators.validateForm(formData, {
            titulo: ['required', 'minLength:2'],
            capacidad: ['required', 'number', 'minValue:1'],
            importe: ['required', 'number', 'minValue:0']
        });

        if (!validation.isValid) {
            this.showFormErrors(validation.errors);
            return;
        }

        // Preparar payload - CONVERTIR CAMPOS VACÍOS A null
        const payload = {
            titulo: formData.titulo.trim(),
            direccion: formData.direccion.trim() || null, // Convertir vacío a null
            capacidad: parseInt(formData.capacidad),
            importe: parseFloat(formData.importe)
        };

        // Manejar coordenadas - convertir vacíos explícitamente a null
        if (formData.latitud && formData.latitud.trim() !== '') {
            payload.latitud = parseFloat(formData.latitud);
        } else {
            payload.latitud = null; // Explícitamente null en lugar de undefined
        }

        if (formData.longitud && formData.longitud.trim() !== '') {
            payload.longitud = parseFloat(formData.longitud);
        } else {
            payload.longitud = null; // Explícitamente null en lugar de undefined
        }

        console.log('JSON final a enviar:', JSON.stringify(payload, null, 2));

        let result;
        if (this.currentEditingId) {
            console.log('Actualizando salón ID:', this.currentEditingId);
            // Para update, agregar activo si es necesario
            const updatePayload = {
                ...payload,
                activo: parseInt(document.getElementById('activo').value)
            };
            result = await this.api.updateSalon(this.currentEditingId, updatePayload);
            this.showNotification('Salón actualizado exitosamente', 'success');
        } else {
            console.log('Creando nuevo salón');
            // Para CREATE, usar solo el payload sin activo
            result = await this.api.createSalon(payload);
            this.showNotification('Salón creado exitosamente', 'success');
        }

        console.log('Respuesta del servidor:', result);

        this.closeModal();
        await this.loadSalones();
        
        document.dispatchEvent(new CustomEvent('dataUpdated', { 
            detail: { entity: 'salones' } 
        }));
        
    } catch (error) {
        console.error('Error completo saving salon:', error);
        
        let errorMessage = 'Error al guardar el salón';
        if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.message}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        this.showNotification(errorMessage, 'error');
    }
}

    async editSalon(id) {
        try {
            console.log('Editando salón con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de salón inválido');
            }
            
            const salon = await this.api.getSalon(id);
            this.showSalonModal(salon);
        } catch (error) {
            console.error('Error loading salon:', error);
            this.showNotification('Error al cargar el salón: ' + error.message, 'error');
        }
    }

    async deleteSalon(id) {
        if (!this.confirmDelete('salón')) return;

        try {
            console.log('Eliminando salón con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de salón inválido');
            }
            
            await this.api.deleteSalon(id);
            this.showNotification('Salón eliminado exitosamente', 'success');
            await this.loadSalones();
            
            // Disparar evento para actualizar dashboard si es necesario
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'salones' } 
            }));
            
        } catch (error) {
            console.error('Error deleting salon:', error);
            this.showNotification(error.message || 'Error al eliminar el salón', 'error');
        }
    }

    // Método para búsqueda y filtrado
    setupSearch() {
        const searchInput = document.getElementById('searchSalones');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#salonesTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        // Limpiar event listeners si se agregaron
        const searchInput = document.getElementById('searchSalones');
        if (searchInput) {
            searchInput.replaceWith(searchInput.cloneNode(true));
        }
    }
}