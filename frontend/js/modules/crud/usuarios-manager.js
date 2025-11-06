import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class UsuariosManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Usuario';
    }

    async loadUsuarios() {
        try {
            const usuarios = await this.api.getUsuarios();
            this.renderUsuarios(usuarios);
        } catch (error) {
            console.error('Error loading usuarios:', error);
            this.showTableError('usuariosTableBody', 'Error cargando usuarios');
        }
    }

    renderUsuarios(usuarios) {
        const columns = [
            { key: 'usuario_id', title: 'ID' },
            { key: 'nombre', title: 'Nombre' },
            { key: 'apellido', title: 'Apellido' },
            { key: 'nombre_usuario', title: 'Usuario' },
            { 
                key: 'tipo_usuario', 
                title: 'Tipo',
                formatter: (value) => Helpers.getTipoUsuario(value)
            },
            { key: 'celular', title: 'Teléfono' },
            { key: 'activo', title: 'Estado', type: 'status' }
        ];

        this.renderTable('usuariosTableBody', usuarios, columns, 'No hay usuarios registrados');
    }

    async showUsuarioModal(usuario = null) {
        this.currentEditingId = usuario?.usuario_id || null;
        this.currentEntity = 'usuario';
        
        const modalHTML = `
            <div class="modal-overlay active" id="usuarioModal">
                <div class="modal modal-sm">
                    <div class="modal-header">
                        <h3>${usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="usuarioForm" class="form-grid">
                            <div class="form-group">
                                <label for="nombre">Nombre</label>
                                <input type="text" id="nombre" class="form-control" required 
                                       value="${usuario?.nombre || ''}">
                            </div>
                            <div class="form-group">
                                <label for="apellido">Apellido</label>
                                <input type="text" id="apellido" class="form-control" required
                                       value="${usuario?.apellido || ''}">
                            </div>
                            <div class="form-group">
                                <label for="nombre_usuario">Usuario</label>
                                <input type="text" id="nombre_usuario" class="form-control" required
                                       value="${usuario?.nombre_usuario || ''}">
                            </div>
                            <div class="form-group">
                                <label for="contrasenia">Contraseña</label>
                                <input type="password" id="contrasenia" class="form-control" 
                                       ${!usuario ? 'required' : ''} 
                                       placeholder="${usuario ? 'Dejar vacío para mantener actual' : ''}">
                            </div>
                            <div class="form-group">
                                <label for="tipo_usuario">Tipo de Usuario</label>
                                <select id="tipo_usuario" class="form-control" required>
                                    <option value="1" ${usuario?.tipo_usuario == 1 ? 'selected' : ''}>Administrador</option>
                                    <option value="2" ${usuario?.tipo_usuario == 2 ? 'selected' : ''}>Empleado</option>
                                    <option value="3" ${usuario?.tipo_usuario == 3 ? 'selected' : ''}>Cliente</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="celular">Teléfono</label>
                                <input type="tel" id="celular" class="form-control"
                                       value="${usuario?.celular || ''}">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveUsuario()">
                            ${usuario ? 'Actualizar' : 'Crear'} Usuario
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
    }

    async saveUsuario() {
        try {
            const formData = this.getFormData('usuarioForm');
            const validation = Validators.validateForm(formData, {
                nombre: ['required', 'minLength:2'],
                apellido: ['required', 'minLength:2'],
                nombre_usuario: ['required', 'minLength:3'],
                tipo_usuario: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Si estamos editando y no se proporcionó contraseña, eliminar el campo
            if (this.currentEditingId && !formData.contrasenia) {
                delete formData.contrasenia;
            }

            if (this.currentEditingId) {
                await this.api.updateUsuario(this.currentEditingId, formData);
                this.showNotification('Usuario actualizado exitosamente', 'success');
            } else {
                await this.api.createUsuario(formData);
                this.showNotification('Usuario creado exitosamente', 'success');
            }

            this.closeModal();
            await this.loadUsuarios();
        } catch (error) {
            console.error('Error saving usuario:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editUsuario(id) {
        try {
            const usuario = await this.api.getUsuario(id);
            this.showUsuarioModal(usuario);
        } catch (error) {
            console.error('Error loading usuario:', error);
            this.showNotification('Error al cargar el usuario', 'error');
        }
    }

    async deleteUsuario(id) {
        if (!this.confirmDelete('usuario')) return;

        try {
            await this.api.deleteUsuario(id);
            this.showNotification('Usuario eliminado exitosamente', 'success');
            await this.loadUsuarios();
        } catch (error) {
            console.error('Error deleting usuario:', error);
            this.showNotification(error.message, 'error');
        }
    }
}