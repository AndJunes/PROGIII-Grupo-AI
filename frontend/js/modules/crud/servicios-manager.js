import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';

export class ServiciosManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Servicio';
        this.currentEntity = 'Servicio';
        this.servicios = [];
    }

    async loadServicios() {
        try {
            // Mostrar estado de carga y generar token anti-carreras
            this.showLoadingState('serviciosTableBody');
            const loadToken = (this._lastLoadToken = Date.now());

            // Enganchar el toggle si existe para recargar automáticamente
            const toggle = document.getElementById('toggleInactivos');
            if (toggle && !toggle._serviciosListenerAttached) {
                toggle.addEventListener('change', () => this.loadServicios());
                toggle._serviciosListenerAttached = true;
            }

            const includeInactive = document.getElementById('toggleInactivos')?.checked || false;
            const response = await this.api.getServicios({ includeInactive });

            // Si llegó otra respuesta más nueva, ignorar esta
            if (loadToken !== this._lastLoadToken) return;

            const list = Array.isArray(response) ? response : (response?.servicios || []);

            this.servicios = list.map(s => ({
                servicio_id: s.servicio_id,
                id: s.servicio_id,      // importante para BaseCRUDManager
                descripcion: s.descripcion || 'N/A',
                importe: parseFloat(s.importe) || 0,
                activo: Number(s.activo) === 1
            }));

            this.renderServicios();

        } catch (error) {
            console.error('Error loading servicios:', error);
            this.showTableError('serviciosTableBody', 'Error cargando servicios');
        }
    }

    renderServicios(servicios = null) {
        const columns = [
            { key: 'servicio_id', title: 'ID' },
            { key: 'descripcion', title: 'Descripción' },
            { key: 'importe', title: 'Precio', type: 'currency' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        // Usar el array pasado o el interno
        const dataToRender = servicios ?? this.servicios;

        this.renderTable('serviciosTableBody', dataToRender, columns, 'No hay servicios registrados');
    }


    async showServicioModal(servicio = null) {
        this.currentEditingId = servicio?.servicio_id || null;

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
                                <input type="text" id="descripcion" name="descripcion" class="form-control" required
                                    value="${servicio?.descripcion ?? ''}" placeholder="Ej: Decoración temática">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio</label>
                                <input type="number" id="importe" name="importe" class="form-control" step="0.01" required
                                    value="${servicio?.importe ?? ''}" min="0" placeholder="Precio en ARS">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" name="activo" class="form-control" required>
                                    <option value="1" ${servicio?.activo ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${!servicio?.activo ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="saveServicioBtn">
                            ${servicio ? 'Actualizar' : 'Crear'} Servicio
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;

        document.getElementById('saveServicioBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveServicio();
        });

        // Si existe un toggle de inactivos en el layout, enganchar cambio para recargar
        const toggle = document.getElementById('toggleInactivos');
        if (toggle && !toggle._serviciosListenerAttached) {
            toggle.addEventListener('change', () => this.loadServicios());
            toggle._serviciosListenerAttached = true;
        }
    }

    async saveServicio() {
        try {
            const formData = this.getFormData('servicioForm');

            // Validación
            const validation = Validators.validateForm(formData, {
                descripcion: ['required', 'minLength:3'],
                importe: ['required', 'number', 'minValue:0'],
                activo: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Convertir campos numéricos
            formData.importe = parseFloat(formData.importe);
            formData.activo = parseInt(formData.activo);

            let savedServicio;

            if (this.currentEditingId) {
                // Actualizar servicio existente
                savedServicio = await this.api.updateServicio(this.currentEditingId, formData);
                const servicioData = savedServicio?.servicio || savedServicio;

                // Actualizar el array local
                const index = this.servicios.findIndex(s => s.servicio_id === this.currentEditingId);
                if (index !== -1) {
                    this.servicios[index] = {
                        servicio_id: servicioData?.servicio_id ?? this.currentEditingId,
                        id: servicioData?.servicio_id ?? this.currentEditingId,
                        descripcion: servicioData?.descripcion ?? formData.descripcion,
                        importe: parseFloat(servicioData?.importe ?? formData.importe),
                        activo: servicioData?.activo != null ? Boolean(servicioData.activo) : Boolean(formData.activo)
                    };
                }

                this.showNotification('Servicio actualizado exitosamente', 'success');
            } else {
                // Crear nuevo servicio
                savedServicio = await this.api.createServicio(formData);
                const servicioData = savedServicio?.servicio || savedServicio;

                // Agregar al array local
                this.servicios.push({
                    servicio_id: servicioData?.servicio_id,
                    id: servicioData?.servicio_id,
                    descripcion: servicioData?.descripcion ?? formData.descripcion,
                    importe: parseFloat(servicioData?.importe ?? formData.importe),
                    activo: servicioData?.activo != null ? Boolean(servicioData.activo) : Boolean(formData.activo)
                });

                this.showNotification('Servicio creado exitosamente', 'success');
            }

            this.closeModal();

            // Renderizar la tabla con los datos locales actualizados
            this.renderServicios(this.servicios);

        } catch (error) {
            console.error('Error saving servicio:', error);
            this.showNotification(error.message || 'Error al guardar el servicio', 'error');
        }
    }


    async editServicio(id) {
        try {
            // Preferir estado local para evitar valores viejos por caché
            let servicio = this.servicios.find(s => s.servicio_id === id);
            if (!servicio) {
                servicio = await this.api.getServicio(id);
            }
            this.showServicioModal(servicio);
        } catch (error) {
            console.error('Error loading servicio:', error);
            this.showNotification('Error al cargar el servicio', 'error');
        }
    }

    async deleteServicio(id) {
        if (!this.confirmDelete('servicio')) return;

        try {
            await this.api.deleteServicio(id);

            this.servicios = this.servicios.filter(s => s.servicio_id !== id);
            
            this.renderServicios();

            this.showNotification('Servicio eliminado exitosamente', 'success');
        } catch (error) {
            console.error('Error deleting servicio:', error);
            this.showNotification(error.message, 'error');
        }
    }
}
