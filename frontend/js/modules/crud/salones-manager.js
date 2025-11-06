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
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${salon?.activo !== false ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${salon?.activo === false ? 'selected' : ''}>Inactivo</option>
                                </select>
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
                importe: ['required', 'number', 'minValue:0'],
                activo: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Convertir a números
            formData.capacidad = parseInt(formData.capacidad);
            formData.importe = parseFloat(formData.importe);
            formData.activo = parseInt(formData.activo);

            if (formData.latitud) formData.latitud = parseFloat(formData.latitud);
            if (formData.longitud) formData.longitud = parseFloat(formData.longitud);

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
        if (!this.confirmDelete('salón')) return;

        try {
            await this.api.deleteSalon(id);
            this.showNotification('Salón eliminado exitosamente', 'success');
            await this.loadSalones();
        } catch (error) {
            console.error('Error deleting salon:', error);
            this.showNotification(error.message, 'error');
        }
    }
}