import { BaseCRUDManager } from './base-manager.js?v=4';
import { Validators } from '../../utils/validators.js';

export class ServiciosManager extends BaseCRUDManager {
    constructor() {
        super();

        // --- INICIO DE CAMBIOS ---
        // comentario: aca le decimos al 'padre' (base-manager)
        // cuales son los nombres especificos para este modulo
        this.entityName = 'Servicio';
        this.tableBodyId = 'serviciosTableBody';
        this.dataKey = 'servicios'; // la clave del array en el json de la api
        // --- FIN DE CAMBIOS ---
    }

    async loadServicios() {
        // --- INICIO DE CAMBIOS ---
        // comentario: this.showLoadingState ahora existe en el 'padre'
        // y ya sabe cual es el tableBodyId.
        this.showLoadingState(true);
        // --- FIN DE CAMBIOS ---
        
        try {
            const serviciosData = await this.api.getServicios(); // api.getServicios() debe devolver el objeto { ..., servicios: [...] }
            this.renderServicios(serviciosData);
        } catch (error) {
            console.error('Error loading servicios:', error);
            this.showTableError(this.tableBodyId, 'Error cargando servicios');
        }
    }

    renderServicios(serviciosData) {
        const columns = [
            { key: 'servicio_id', title: 'ID' }, // comentario: ajustado a 'servicio_id' (como seguro viene de tu bd)
            { key: 'descripcion', title: 'Descripción' },
            { key: 'importe', title: 'Precio', type: 'currency' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        // --- INICIO DE CAMBIOS ---
        // comentario: le pasamos 'serviciosData' (el objeto entero) a renderTable.
        // el 'padre' (base-manager) se encarga de buscar la lista
        // adentro de 'serviciosData[this.dataKey]' (o sea, serviciosData['servicios'])
        this.renderTable(this.tableBodyId, serviciosData, columns, 'No hay servicios registrados');
        // --- FIN DE CAMBIOS ---
    }

    async showServicioModal(servicio = null) {
        this.currentEditingId = servicio?.servicio_id || null; // comentario: ajustado a 'servicio_id'
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
                                <input type="text" id="descripcion" name="descripcion" class="form-control" required 
                                    value="${servicio?.descripcion || ''}" placeholder="Ej: Decoración temática">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe">Precio</label>
                                <input type="number" id="importe" name="importe" class="form-control" step="0.01" required
                                    value="${servicio?.importe || ''}" min="0" placeholder="Precio en ARS">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" name="activo" class="form-control" required>
                                    <option value="1" ${servicio?.activo !== 0 ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${servicio?.activo === 0 ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
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
            const servicio = await this.api.getServicio(id); // Asumo que api.getServicio devuelve el objeto solo
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