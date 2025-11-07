import { BaseCRUDManager } from './base-manager.js';
import { Validators } from '../../utils/validators.js';
import { Helpers } from '../../utils/helpers.js';

export class ReservasManager extends BaseCRUDManager {
    constructor() {
        super();
        this.entityName = 'Reserva';
        this.salones = [];
        this.servicios = [];
        this.turnos = [];
    }

    async loadDependencies() {
        try {
            console.log('Cargando dependencias para reservas...');
            
            const [salonesResponse, serviciosResponse, turnosResponse] = await Promise.all([
                this.api.getSalones(),
                this.api.getServicios(),
                this.api.getTurnos()
            ]);

            // Extraer arrays de las respuestas
            this.salones = salonesResponse.salones || salonesResponse || [];
            this.servicios = serviciosResponse.servicios || serviciosResponse || [];
            this.turnos = turnosResponse.turnos || turnosResponse || [];

            console.log('Dependencias cargadas:', {
                salones: this.salones.length,
                servicios: this.servicios.length,
                turnos: this.turnos.length
            });

        } catch (error) {
            console.error('Error loading dependencies:', error);
        }
    }

    async loadReservas() {
        this.showLoadingState('reservasTableBody');
        
        try {
            const loadToken = (this._lastLoadToken = Date.now());

            // Enganchar toggle de inactivos
            const toggle = document.getElementById('toggleInactivosReservas');
            if (toggle && !toggle._reservasListenerAttached) {
                toggle.addEventListener('change', () => this.loadReservas());
                toggle._reservasListenerAttached = true;
            }

            await this.loadDependencies();

            const includeInactive = document.getElementById('toggleInactivosReservas')?.checked || false;
            const reservasResp = await this.api.getReservas({ includeInactive, pagina: 1, limite: 1000 });

            // Si llegó otra respuesta más nueva, ignorar esta
            if (loadToken !== this._lastLoadToken) return;

            // Asegurar que sea un array: si la API devuelve {mensaje: ...} u otro objeto, usar []
            const reservas = Array.isArray(reservasResp)
                ? reservasResp
                : (Array.isArray(reservasResp?.reservas) ? reservasResp.reservas : []);

            // Normalizar tipos y mantener en estado local
            this.reservas = (reservas || []).map(r => ({
                ...r,
                reserva_id: Number(r.reserva_id),
                usuario_id: r.usuario_id != null ? Number(r.usuario_id) : r.usuario_id,
                salon_id: r.salon_id != null ? Number(r.salon_id) : r.salon_id,
                turno_id: r.turno_id != null ? Number(r.turno_id) : r.turno_id,
                importe_salon: r.importe_salon != null ? Number(r.importe_salon) : r.importe_salon,
                importe_total: r.importe_total != null ? Number(r.importe_total) : r.importe_total,
                activo: Number(r.activo ?? 1) === 1
            }));

            console.log('Reservas cargadas:', this.reservas);
            this.renderReservas(this.reservas);
        } catch (error) {
            console.error('Error loading reservas:', error);
            this.showTableError('reservasTableBody', 'Error cargando reservas');
        }
    }

    renderReservas(reservas) {
        const columns = [
            { key: 'reserva_id', title: 'ID' },
            { 
                key: 'fecha_reserva', 
                title: 'Fecha',
                formatter: (value) => Helpers.formatDate(value)
            },
            { 
                key: 'salon', 
                title: 'Salón'
            },
            { 
                key: 'hora_desde', 
                title: 'Horario',
                formatter: (value, row) => this.getHorarioCompleto(row)
            },
            { 
                key: 'nombre', 
                title: 'Cliente'
            },
            { 
                key: 'tematica', 
                title: 'Temática'
            },
            { 
                key: 'importe_total', 
                title: 'Total',
                formatter: (value) => Helpers.formatCurrency(value)
            },
            { 
                key: 'activo', 
                title: 'Estado',
                formatter: (value) => this.getEstadoBadge(value)
            }
        ];

        this.renderTable('reservasTableBody', reservas, columns, 'No hay reservas registradas');
    }

    // Sobrescribir createTableRow para usar reserva_id correctamente
    createTableRow(data, columns, actions = true) {
        const cells = columns.map(col => {
            let value = data[col.key];
            
            if (col.formatter) {
                value = col.formatter(value, data);
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
                            data-id="${data.reserva_id}" 
                            data-entity="reserva">
                        <span class="btn-icon material-icons">edit</span>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" 
                            data-id="${data.reserva_id}" 
                            data-entity="reserva">
                        <span class="btn-icon material-icons">delete</span>
                        Eliminar
                    </button>
                </div>
            </td>
        ` : '';

        return `<tr data-id="${data.reserva_id}">${cells}${actionButtons}</tr>`;
    }

    getHorarioCompleto(reserva) {
        if (reserva.hora_desde && reserva.hora_hasta) {
            return `${this.formatTime(reserva.hora_desde)} - ${this.formatTime(reserva.hora_hasta)}`;
        }
        return 'N/A';
    }

    // Formatea valores de hora tipo "HH:MM:SS" a "HH:MM"
    formatTime(value) {
        if (!value) return 'N/A';
        const str = String(value);
        const parts = str.split(':');
        if (parts.length >= 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
        return str;
    }

    getEstadoBadge(activo) {
        const isActive = activo === 1 || activo === true;
        const statusClass = isActive ? 'active' : 'inactive';
        const statusText = isActive ? 'Activa' : 'Cancelada';
        return `<span class="status-badge ${statusClass}">${statusText}</span>`;
    }

    async showReservaModal(reserva = null) {
        this.currentEditingId = reserva?.reserva_id || null;
        this.currentEntity = 'reserva';
        
        await this.loadDependencies();
        
        const modalHTML = `
            <div class="modal-overlay active" id="reservaModal">
                <div class="modal modal-lg">
                    <div class="modal-header">
                        <h3>${reserva ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
                        <button class="modal-close" onclick="crudManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="reservaForm" class="form-grid">
                            <div class="form-group">
                                <label for="fecha_reserva">Fecha de Reserva</label>
                                <input type="date" id="fecha_reserva" class="form-control" required 
                                       value="${reserva?.fecha_reserva?.split('T')[0] || ''}">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="salon_id">Salón</label>
                                <select id="salon_id" class="form-control" required>
                                    <option value="">Seleccionar salón</option>
                                    ${this.salones.map(salon => 
                                        `<option value="${salon.salon_id}" ${reserva?.salon_id == salon.salon_id ? 'selected' : ''}>
                                            ${salon.titulo} - Capacidad: ${salon.capacidad}
                                        </option>`
                                    ).join('')}
                                </select>
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="turno_id">Turno</label>
                                <select id="turno_id" class="form-control" required>
                                    <option value="">Seleccionar turno</option>
                                    ${this.turnos.map(turno => 
                                        `<option value="${turno.turno_id}" ${reserva?.turno_id == turno.turno_id ? 'selected' : ''}>
                                            Turno ${turno.orden} (${this.formatTime(turno.hora_desde)} - ${this.formatTime(turno.hora_hasta)})
                                        </option>`
                                    ).join('')}
                                </select>
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="tematica">Temática</label>
                                <input type="text" id="tematica" class="form-control"
                                       value="${reserva?.tematica || ''}" placeholder="Temática del evento">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="importe_total">Importe Total</label>
                                <input type="number" id="importe_total" class="form-control" step="0.01" required
                                       value="${reserva?.importe_total || ''}" min="0" placeholder="Importe total">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group full-width">
                                <label>Servicios adicionales</label>
                                <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
                                  <input type="text" id="serviciosSearch" class="form-control" placeholder="Buscar servicio..." style="flex:1;" />
                                  <button type="button" class="btn btn-sm btn-outline" id="selectAllServicios">Todos</button>
                                  <button type="button" class="btn btn-sm btn-outline" id="clearServicios">Ninguno</button>
                                </div>
                                <div id="serviciosSelector" class="list-group" style="max-height: 260px; overflow: auto; border: 1px solid #eee; border-radius: 6px;">
                                    ${this.servicios.map(s => `
                                        <div class="list-item servicio-item" data-servicio-id="${s.servicio_id}">
                                            <label style="display:flex; align-items:center; gap:12px; width:100%; padding:8px 12px;">
                                                <input type="checkbox" class="servicio-checkbox" data-id="${s.servicio_id}">
                                                <span style="flex:1;">${s.descripcion}</span>
                                                <span style="min-width:90px; text-align:right;">${Helpers.formatCurrency(s.importe)}</span>
                                                <input type="number" class="form-control servicio-importe" step="0.01" min="0" 
                                                       data-id="${s.servicio_id}" value="${s.importe || 0}" disabled style="max-width:140px;">
                                            </label>
                                        </div>
                                    `).join('')}
                                </div>
                                <small class="help-text">Marcá los servicios, buscá por nombre y ajustá el importe si corresponde.</small>
                            </div>
                            <div class="form-group">
                                <label for="foto_cumpleaniero">Foto Cumpleañero (URL)</label>
                                <input type="text" id="foto_cumpleaniero" class="form-control"
                                       value="${reserva?.foto_cumpleaniero || ''}" placeholder="URL de la foto">
                                <div class="error-message"></div>
                            </div>
                            <div class="form-group">
                                <label for="activo">Estado</label>
                                <select id="activo" class="form-control" required>
                                    <option value="1" ${reserva?.activo !== false && reserva?.activo !== 0 ? 'selected' : ''}>Activa</option>
                                    <option value="0" ${reserva?.activo === false || reserva?.activo === 0 ? 'selected' : ''}>Cancelada</option>
                                </select>
                                <div class="error-message"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="crudManager.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="crudManager.saveReserva()">
                            ${reserva ? 'Actualizar' : 'Crear'} Reserva
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = modalHTML;
        
        const container = document.getElementById('serviciosSelector');
        if (container) {
            // Delegación: checkbox change -> habilitar/deshabilitar importe
            container.addEventListener('change', (e) => {
                const cb = e.target.closest('.servicio-checkbox');
                if (!cb) return;
                const id = cb.getAttribute('data-id');
                const input = container.querySelector(`.servicio-importe[data-id="${id}"]`);
                if (input) input.disabled = !cb.checked;
            });
            // Delegación: focus en importe -> auto-check y habilitar
            container.addEventListener('focusin', (e) => {
                const inp = e.target.closest('.servicio-importe');
                if (!inp) return;
                const id = inp.getAttribute('data-id');
                const cb = container.querySelector(`.servicio-checkbox[data-id="${id}"]`);
                if (cb && !cb.checked) {
                    cb.checked = true;
                    inp.disabled = false;
                }
            });
        }

        // Buscar: ocultar/mostrar items existentes (sin re-render)
        const serviciosSearch = document.getElementById('serviciosSearch');
        if (serviciosSearch && container) {
            const stripAccents = (str) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalized = (s) => stripAccents(String(s || '').toLowerCase());
            serviciosSearch.addEventListener('input', (e) => {
                const q = normalized(e.target.value || '');
                container.querySelectorAll('.servicio-item').forEach(item => {
                    const labelText = item.querySelector('span')?.textContent || '';
                    const match = normalized(labelText).includes(q);
                    item.style.display = match ? '' : 'none';
                });
            });
        }

        // Selección masiva: solo elementos visibles
        document.getElementById('selectAllServicios')?.addEventListener('click', () => {
            if (!container) return;
            container.querySelectorAll('.servicio-item').forEach(item => {
                if (item.style.display === 'none') return;
                const cb = item.querySelector('.servicio-checkbox');
                const inp = item.querySelector('.servicio-importe');
                if (cb) cb.checked = true;
                if (inp) inp.disabled = false;
            });
        });

        document.getElementById('clearServicios')?.addEventListener('click', () => {
            if (!container) return;
            container.querySelectorAll('.servicio-item').forEach(item => {
                if (item.style.display === 'none') return;
                const cb = item.querySelector('.servicio-checkbox');
                const inp = item.querySelector('.servicio-importe');
                if (cb) cb.checked = false;
                if (inp) inp.disabled = true;
            });
        });
    }

    async saveReserva() {
        try {
            // Obtener datos del formulario manualmente
            const formData = {
                fecha_reserva: document.getElementById('fecha_reserva').value,
                salon_id: document.getElementById('salon_id').value,
                turno_id: document.getElementById('turno_id').value,
                tematica: document.getElementById('tematica').value,
                importe_total: document.getElementById('importe_total').value,
                foto_cumpleaniero: document.getElementById('foto_cumpleaniero').value,
                activo: document.getElementById('activo').value
            };

            console.log('📋 Datos del formulario reserva:', formData);

            // Validación
            const validation = Validators.validateForm(formData, {
                fecha_reserva: ['required'],
                salon_id: ['required'],
                turno_id: ['required'],
                importe_total: ['required', 'number', 'minValue:0'],
                activo: ['required']
            });

            if (!validation.isValid) {
                this.showFormErrors(validation.errors);
                return;
            }

            // Preparar payload
            const payload = {
                fecha_reserva: formData.fecha_reserva,
                salon_id: parseInt(formData.salon_id),
                turno_id: parseInt(formData.turno_id),
                importe_total: parseFloat(formData.importe_total),
                activo: parseInt(formData.activo)
            };

            // Solo incluir campos opcionales si no están vacíos
            if (formData.tematica && formData.tematica.trim() !== '') {
                payload.tematica = formData.tematica.trim();
            }

            if (formData.foto_cumpleaniero && formData.foto_cumpleaniero.trim() !== '') {
                payload.foto_cumpleaniero = formData.foto_cumpleaniero.trim();
            }

            // Recolectar servicios seleccionados
            const servicios = [];
            document.querySelectorAll('.servicio-checkbox:checked').forEach(cb => {
                const id = parseInt(cb.getAttribute('data-id'));
                const impInput = document.querySelector(`.servicio-importe[data-id="${id}"]`);
                const importe = impInput ? parseFloat(impInput.value || '0') : 0;
                if (!Number.isNaN(id)) {
                    servicios.push({ servicio_id: id, importe: Number.isNaN(importe) ? 0 : importe });
                }
            });
            if (servicios.length > 0) {
                payload.servicios = servicios;
            }

            console.log('JSON final a enviar:', JSON.stringify(payload, null, 2));

            let result;
            if (this.currentEditingId) {
                console.log('Actualizando reserva ID:', this.currentEditingId);
                result = await this.api.updateReserva(this.currentEditingId, payload);
                this.showNotification('Reserva actualizada exitosamente', 'success');
            } else {
                console.log('Creando nueva reserva');
                result = await this.api.createReserva(payload);
                this.showNotification('Reserva creada exitosamente', 'success');
            }

            console.log('Respuesta del servidor:', result);

            this.closeModal();
            await this.loadReservas();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'reservas' } 
            }));
            
        } catch (error) {
            console.error('Error completo saving reserva:', error);
            
            let errorMessage = 'Error al guardar la reserva';
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.message}`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    async editReserva(id) {
        try {
            console.log('Editando reserva con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de reserva inválido');
            }
            
            const includeInactive = document.getElementById('toggleInactivosReservas')?.checked || false;
            const [reserva, serviciosAsociados] = await Promise.all([
                this.api.getReserva(id, { includeInactive }),
                this.api.getReservaServicios(id)
            ]);

            await this.showReservaModal(reserva);

            // Preseleccionar servicios asociados con sus importes
            if (Array.isArray(serviciosAsociados) && serviciosAsociados.length > 0) {
                const container = document.getElementById('serviciosSelector');
                serviciosAsociados.forEach(s => {
                    const cb = container?.querySelector(`.servicio-checkbox[data-id="${s.servicio_id}"]`);
                    const inp = container?.querySelector(`.servicio-importe[data-id="${s.servicio_id}"]`);
                    if (cb) cb.checked = true;
                    if (inp) {
                        inp.disabled = false;
                        if (s.importe != null) inp.value = s.importe;
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error loading reserva:', error);
            this.showNotification('Error al cargar la reserva: ' + error.message, 'error');
        }
    }

    async deleteReserva(id) {
        if (!this.confirmDelete('reserva')) return;

        try {
            console.log('Eliminando reserva con ID:', id);
            
            if (!id || isNaN(id)) {
                throw new Error('ID de reserva inválido');
            }
            
            await this.api.deleteReserva(id);
            this.showNotification('Reserva eliminada exitosamente', 'success');
            await this.loadReservas();
            
            document.dispatchEvent(new CustomEvent('dataUpdated', { 
                detail: { entity: 'reservas' } 
            }));
            
        } catch (error) {
            console.error('Error deleting reserva:', error);
            this.showNotification(error.message || 'Error al eliminar la reserva', 'error');
        }
    }

    // Método para búsqueda y filtrado
    setupSearch() {
        const searchInput = document.getElementById('searchReservas');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#reservasTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }

    // Método para limpiar recursos si es necesario
    destroy() {
        const searchInput = document.getElementById('searchReservas');
        if (searchInput) {
            searchInput.replaceWith(searchInput.cloneNode(true));
        }
    }
}