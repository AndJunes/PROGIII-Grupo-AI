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
            console.log('🔍 Cargando usuarios...');
            const response = await this.api.getUsuarios();
            console.log('📦 Respuesta completa de API:', response);
            console.log('📊 Tipo de respuesta:', typeof response);
            console.log('🔢 Es array?', Array.isArray(response));
            
            // Si response es un objeto, extraer el array
            let usuarios;
            if (Array.isArray(response)) {
                usuarios = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                usuarios = response.data;
            } else if (response && response.usuarios && Array.isArray(response.usuarios)) {
                usuarios = response.usuarios;
            } else {
                console.warn('⚠️ Formato inesperado, usando array vacío');
                usuarios = [];
            }
            
            console.log('👥 Usuarios procesados:', usuarios);
            this.renderUsuarios(usuarios);
        } catch (error) {
            console.error('❌ Error loading usuarios:', error);
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

    // Sobrescribir createTableRow para usar usuario_id correctamente
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
                            data-id="${data.usuario_id}" 
                            data-entity="usuario">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" 
                            data-id="${data.usuario_id}" 
                            data-entity="usuario">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr data-id="${data.usuario_id}">${cells}${actionButtons}</tr>`;
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
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="apellido">Apellido</label>
                                <input type="text" id="apellido" class="form-control" required
                                       value="${usuario?.apellido || ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="nombre_usuario">Usuario</label>
                                <input type="text" id="nombre_usuario" class="form-control" required
                                       value="${usuario?.nombre_usuario || ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="contrasenia">Contraseña</label>
                                <input type="password" id="contrasenia" class="form-control" 
                                       ${!usuario ? 'required' : ''} 
                                       placeholder="${usuario ? 'Dejar vacío para mantener actual' : 'Ingrese contraseña'}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="tipo_usuario">Tipo de Usuario</label>
                                <select id="tipo_usuario" class="form-control" required>
                                    <option value="1" ${usuario?.tipo_usuario == 1 ? 'selected' : ''}>Administrador</option>
                                    <option value="2" ${usuario?.tipo_usuario == 2 ? 'selected' : ''}>Empleado</option>
                                    <option value="3" ${usuario?.tipo_usuario == 3 ? 'selected' : ''}>Cliente</option>
                                </select>
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="celular">Teléfono</label>
                                <input type="tel" id="celular" class="form-control"
                                       value="${usuario?.celular || ''}" placeholder="Ej: 3416123456">
                                <div class="error-message"></div>
                            </div>
                            ${usuario ? `
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${usuario?.activo !== false ? 'selected' : ''}>Activo</option>
                                    <option value="0" ${usuario?.activo === false ? 'selected' : ''}>Inactivo</option>
                                </select>
                                <div class="error-message"></div>
                            </div>
                            ` : ''}
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
        
        // Agregar validación en tiempo real
        this.setupRealTimeValidation('usuarioForm', {
            nombre: ['required', 'minLength:2'],
            apellido: ['required', 'minLength:2'],
            nombre_usuario: ['required', 'minLength:3'],
            tipo_usuario: ['required'],
            ...(usuario ? {} : { contrasenia: ['required', 'minLength:4'] })
        });
    }

    async saveUsuario() {
        try {
            // Obtener datos del formulario manualmente
            const formData = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                nombre_usuario: document.getElementById('nombre_usuario').value,
                contrasenia: document.getElementById('contrasenia').value,
                tipo_usuario: document.getElementById('tipo_usuario').value,
                celular: document.getElementById('celular').value
            };

            console.log('Datos del formulario usuario:', formData);

            // Validación básica
            const validationRules = {
                nombre: ['required', 'minLength:2'],
                apellido: ['required', 'minLength:2'],
                nombre_usuario: ['required', 'minLength:3'],
                tipo_usuario: ['required']
            };

            // Solo validar contraseña si es nuevo usuario o se está cambiando
            if (!this.currentEditingId || formData.contrasenia) {
                validationRules.contrasenia = ['required', 'minLength:4'];
            }

            const validation = Validators.validateForm(formData, validationRules);

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Preparar payload
            const payload = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                nombre_usuario: formData.nombre_usuario.trim(),
                tipo_usuario: parseInt(formData.tipo_usuario),
                celular: formData.celular.trim() || null
            };

            // Solo incluir contraseña si se proporcionó
            if (formData.contrasenia && formData.contrasenia.trim() !== '') {
                payload.contrasenia = formData.contrasenia.trim();
            }

            // Para edición, incluir activo si existe el campo
            if (this.currentEditingId) {
                const activoField = document.getElementById('activo');
                if (activoField) {
                    payload.activo = parseInt(activoField.value);
                }
            }

            console.log('JSON final a enviar:', JSON.stringify(payload, null, 2));

            let result;
            if (this.currentEditingId) {
                console.log('Actualizando usuario ID:', this.currentEditingId);
                result = await this.api.updateUsuario(this.currentEditingId, payload);
                this.showNotification('Usuario actualizado exitosamente', 'success');
            } else {
                console.log('Creando nuevo usuario');
                result = await this.api.createUsuario(payload);
                this.showNotification('Usuario creado exitosamente', 'success');
            }

            console.log('Respuesta del servidor:', result);

            this.closeModal();
            await this.loadUsuarios();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'usuarios' } 
            }));
            
        } catch (error) {
            console.error('Error completo saving usuario:', error);
            
            let errorMessage = 'Error al guardar el usuario';
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.message}`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    async editUsuario(id) {
        try {
            console.log('Editando usuario con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }
            
            const usuario = await this.api.getUsuario(id);
            this.showUsuarioModal(usuario);
        } catch (error) {
            console.error('Error loading usuario:', error);
            this.showNotification('Error al cargar el usuario: ' + error.message, 'error');
        }
    }

    async deleteUsuario(id) {
        if (!this.confirmDelete('usuario')) return;

        try {
            console.log('Eliminando usuario con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de usuario inválido');
            }
            
            await this.api.deleteUsuario(id);
            this.showNotification('Usuario eliminado exitosamente', 'success');
            await this.loadUsuarios();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'usuarios' } 
            }));
            
        } catch (error) {
            console.error('Error deleting usuario:', error);
            this.showNotification(error.message || 'Error al eliminar el usuario', 'error');
        }
    }

    // Método para búsqueda y filtrado
    setupSearch() {
        const searchInput = document.getElementById('searchUsuarios');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#usuariosTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        const searchInput = document.getElementById('searchUsuarios');
        if (searchInput) {
            searchInput.replaceWith(searchInput.cloneNode(true));
        }
    }
}