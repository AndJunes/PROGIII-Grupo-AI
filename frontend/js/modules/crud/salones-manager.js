import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class SalonesManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Salon';
        this.salones = [];
    }

    async loadSalones() {
        try {
            // Enganchar toggle de inactivos para recargar cuando cambie
            const toggle = document.getElementById('toggleInactivosSalones');
            if (toggle && !toggle._salonesListenerAttached) {
                toggle.addEventListener('change', () => this.loadSalones());
                toggle._salonesListenerAttached = true;
            }

            const includeInactive = document.getElementById('toggleInactivosSalones')?.checked || false;
            const response = await this.api.getSalones({ includeInactive, pagina: 1, limite: 1000 });
            // El backend puede devolver array directo o envuelto
            const raw = Array.isArray(response) ? response : (response.salones || []);
            // Normalizar tipos para evitar problemas (e.g., '0' como string debe ser false)
            this.salones = raw.map(s => ({
                salon_id: Number(s.salon_id),
                titulo: s.titulo ?? 'N/A',
                capacidad: Number(s.capacidad) || 0,
                importe: parseFloat(s.importe) || 0,
                direccion: s.direccion ?? '',
                activo: Number(s.activo) === 1
            }));
            this.renderSalones();
        } catch (error) {
            console.error('Error loading salones:', error);
            this.showTableError('salonesTableBody', 'Error cargando salones');
        }
    }

    renderSalones(salones = null) {
        const columns = [
            { key: 'salon_id', title: 'ID' },
            { key: 'titulo', title: 'Nombre' },
            { key: 'capacidad', title: 'Capacidad' },
            { key: 'importe', title: 'Precio', type: 'currency' },
            { key: 'direccion', title: 'Dirección' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];
        const data = salones ?? this.salones;
        this.renderTable('salonesTableBody', data, columns, 'No hay salones registrados');
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
            
            return `<td>${value ?? 'N/A'}</td>`;
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
                                       value="${salon?.titulo ?? ''}" placeholder="Ej: Salón Principal">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="direccion">Dirección</label>
                                <input type="text" id="direccion" class="form-control"
                                       value="${salon?.direccion ?? ''}" placeholder="Dirección completa">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="capacidad">Capacidad</label>
                                <input type="number" id="capacidad" class="form-control" required
                                       value="${salon?.capacidad ?? ''}" min="1" placeholder="Número de personas">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio Base</label>
                                <input type="number" id="importe" class="form-control" step="0.01" required
                                       value="${salon?.importe ?? ''}" min="0" placeholder="Precio en ARS">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="latitud">Latitud</label>
                                <input type="number" id="latitud" class="form-control" step="any"
                                       value="${salon?.latitud ?? ''}" placeholder="Coordenada latitud">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="longitud">Longitud</label>
                                <input type="number" id="longitud" class="form-control" step="any"
                                       value="${salon?.longitud ?? ''}" placeholder="Coordenada longitud">
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
                direccion: formData.direccion.trim() ?? null, // Convertir vacío a null
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
                // Actualizar estado local
                const idx = this.salones.findIndex(s => s.salon_id === this.currentEditingId);
                const s = result?.salon || result;
                if (idx !== -1) {
                    this.salones[idx] = {
                        salon_id: Number(s?.salon_id ?? this.currentEditingId),
                        titulo: s?.titulo ?? payload.titulo,
                        capacidad: Number(s?.capacidad ?? payload.capacidad) || 0,
                        importe: parseFloat(s?.importe ?? payload.importe) || 0,
                        direccion: s?.direccion ?? payload.direccion ?? '',
                        activo: Number(s?.activo ?? updatePayload.activo) === 1
                    };
                }
                this.showNotification('Salón actualizado exitosamente', 'success');
            } else {
                console.log('Creando nuevo salón');
                // Para CREATE, usar solo el payload sin activo
                result = await this.api.createSalon(payload);
                const s = result?.salon || result;
                // Agregar al estado local
                this.salones.push({
                    salon_id: Number(s?.salon_id),
                    titulo: s?.titulo ?? payload.titulo,
                    capacidad: Number(s?.capacidad ?? payload.capacidad) || 0,
                    importe: parseFloat(s?.importe ?? payload.importe) || 0,
                    direccion: s?.direccion ?? payload.direccion ?? '',
                    activo: Number(s?.activo ?? 1) === 1
                });
                this.showNotification('Salón creado exitosamente', 'success');
            }

            console.log('Respuesta del servidor:', result);

            this.closeModal();
            // Render desde estado local actualizado
            this.renderSalones(this.salones);
            
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
            // Intentar desde estado local primero para evitar valores viejos por caché
            let salon = this.salones.find(s => s.salon_id === id);
            if (!salon) {
                // Permitir traer inactivos por ID si el toggle está activo
                const includeInactive = document.getElementById('toggleInactivosSalones')?.checked || false;
                salon = await this.api.getSalon(id, { includeInactive });
            }
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

            // Actualización optimista del estado local
            const includeInactive = document.getElementById('toggleInactivosSalones')?.checked || false;
            if (includeInactive) {
                // Marcar como inactivo y mantener en la lista si se muestran inactivos
                this.salones = this.salones.map(s => s.salon_id === Number(id) ? { ...s, activo: false } : s);
            } else {
                // Ocultar de la lista si no se muestran inactivos
                this.salones = this.salones.filter(s => s.salon_id !== Number(id));
            }
            this.renderSalones(this.salones);
            
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