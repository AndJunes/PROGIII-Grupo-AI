import { API } from '../../api.js';
import { CONSTANTS } from '../../utils/constants.js';
import { Helpers } from '../../utils/helpers.js';
import { Validators } from '../../utils/validators.js';

export class BaseCRUDManager {
    constructor() {
        this.api = new API();
        this.currentEditingId = null;
        this.currentEntity = null;
    }

    // Métodos comunes a todos los managers
    getFormData(formId) {
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
        // Limpiar errores anteriores
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });

        // Mostrar nuevos errores
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
        const tbody = document.getElementById(tableBodyId);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" class="error">${message}</td></tr>`;
        }
    }

    showNotification(message, type = 'info') {
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
        document.getElementById('modalContainer').innerHTML = '';
        this.currentEditingId = null;
        this.currentEntity = null;
    }

    formatTime(timeString) {
        if (!timeString) return 'N/A';
        return timeString.substring(0, 5);
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

        const actionButtons = actions ? `
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" onclick="crudManager.edit${this.entityName}(${data.id})">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="crudManager.delete${this.entityName}(${data.id})">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr>${cells}${actionButtons}</tr>`;
    }

    // Método para renderizar tabla completa
    renderTable(tableBodyId, data, columns, emptyMessage = 'No hay registros') {
        const tbody = document.getElementById(tableBodyId);
        if (!tbody) return;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${columns.length + 1}" class="text-center">${emptyMessage}</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(item => 
            this.createTableRow(item, columns)
        ).join('');
    }

    // Método para confirmación de eliminación
    confirmDelete(entityName) {
        return confirm(`¿Estás seguro de que deseas eliminar este ${entityName}?`);
    }
}