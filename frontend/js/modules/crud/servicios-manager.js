import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';

export class ServiciosManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Servicio';
    }

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
        const columns = [
            { key: 'id', title: 'ID' },
            { key: 'descripcion', title: 'Descripción' },
            { key: 'importe', title: 'Precio', type: 'currency' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        this.renderTable('serviciosTableBody', servicios, columns, 'No hay servicios registrados');
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

            // Convertir a números
            formData.importe = parseFloat(formData.importe);
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
        if (!this.confirmDelete('servicio')) return;

        try {
            await this.api.deleteServicio(id);
            this.showNotification('Servicio eliminado exitosamente', 'success');
            await this.loadServicios();
        } catch (error) {
            console.error('Error deleting servicio:', error);
            this.showNotification(error.message, 'error');
        }
    }
}