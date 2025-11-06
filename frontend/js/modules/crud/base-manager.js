import { API } from '../../api.js';
import { CONSTANTS } from '../../utils/constants.js';
import { Helpers } from '../../utils/helpers.js';
import { Validators } from '../../utils/validators.js';

export class BaseCRUDManager {
    constructor() {
        this.api = new API();
        this.currentEditingId = null;
        this.currentEntity = null;

        // comentario: los 'hijos' (ej: reservas-manager) tienen que definir
        // estas 3 propiedades en su constructor:
        // this.entityName = 'Reserva';
        // this.tableBodyId = 'reservasTableBody';
        // this.dataKey = 'reservas'; // la clave del array en el json de la api
    }

    // Métodos comunes a todos los managers
    getFormData(formId) {
        // ... (esta función estaba perfecta, no se toca) ...
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (value !== '') {
                data[key] = value;
            }
        }
        
        return data;
    }

    showFormErrors(errors) {
        // ... (esta función estaba perfecta, no se toca) ...
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });

        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field);
            const errorElement = input?.parentElement?.querySelector('.error-message');
            
            if (input && errorElement) {
                input.classList.add('input-error');
                errorElement.textContent = message;
            }
        }
    }

    showTableError(tableBodyId, message) {
        // ... (esta función estaba perfecta, no se toca) ...
        const tbody = document.getElementById(tableBodyId);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="error">${message}</td></tr>`;
        }
    }

    showNotification(message, type = 'info') {
        // ... (esta función estaba perfecta, no se toca) ...
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: type === 'error' ? 'Error' : 'Éxito',
                message: message,
                type: type
            });
        } else {
            Helpers.showToast(message, type);
        }
    }

    closeModal() {
        // ... (esta función estaba perfecta, no se toca) ...
        document.getElementById('modalContainer').innerHTML = '';
        this.currentEditingId = null;
        this.currentEntity = null;
    }

    formatTime(timeString) {
        // ... (esta función estaba perfecta, no se toca) ...
        if (!timeString) return 'N/A';
        return timeString.substring(0, 5);
    }

    // ---
    // comentario: agregamos la funcion que faltaba
    // (la que causaba 'this.showLoadingState is not a function')
    // ---
    showLoadingState(show) {
        const tbody = document.getElementById(this.tableBodyId);
        if (!tbody) return;

        if (show) {
            // mostramos 'cargando...' en la tabla
            const colCount = tbody.parentElement.querySelector('thead tr').childElementCount;
            tbody.innerHTML = `<tr><td colspan="${colCount}" class="text-center">Cargando...</td></tr>`;
        } else {
            // limpiamos la tabla (despues se rellena)
            tbody.innerHTML = '';
        }
    }

    // Método para crear filas de tabla
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

        // comentario: cambiamos el 'onclick' para que use 'this.entityName'
        // (ej: 'Reserva', 'Salon', 'Turno') que define el 'hijo'
        const actionButtons = actions ? `
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="crudManager.edit${this.entityName}(${data.id || data.reserva_id || data.salon_id || data.servicio_id || data.turno_id || data.usuario_id})">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="crudManager.delete${this.entityName}(${data.id || data.reserva_id || data.salon_id || data.servicio_id || data.turno_id || data.usuario_id})">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr>${cells}${actionButtons}</tr>`;
    }

    // Método para renderizar tabla completa
    // Método para renderizar tabla completa
    renderTable(tableBodyId, data, columns, emptyMessage = 'No hay registros') {
        const tbody = document.getElementById(tableBodyId);
        if (!tbody) return;
        
        // ---
        // comentario: aca estaba el error 'list.map is not a function'
        // la api nos da un objeto (ej: { pagina_actual: 1, usuarios: [...] })
        // tenemos que buscar el array adentro de ese objeto.
        // ---
        let list;
        if (Array.isArray(data)) {
            // caso 1: la api devolvio un array simple (ej: [ ... ])
            list = data;
        } else if (data && Array.isArray(data[this.dataKey])) {
            // caso 2: la api devolvio un objeto paginado (ej: { ..., usuarios: [ ... ] })
            list = data[this.dataKey];
        } else {
            // caso 3: no encontramos nada
            console.warn(`renderTable esperaba un array o un objeto con la clave '${this.dataKey}', pero recibió:`, data);
            list = [];
        }

        if (!list || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${columns.length + 1}" class="text-center">${emptyMessage}</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => 
            this.createTableRow(item, columns)
        ).join('');
    }

    // Método para confirmación de eliminación
    confirmDelete(entityName) {
        return confirm(`¿Estás seguro de que deseas eliminar este ${entityName}?`);
    }
}