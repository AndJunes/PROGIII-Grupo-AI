import { CONSTANTS } from './utils/constants.js';
import { Helpers } from './utils/helpers.js';

export class API {
    constructor() {
        this.baseURL = 'https://localhost:3006/api';
        this.token = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log(`Haciendo request a: ${url}`, config);
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA);
                window.location.replace('./index.html?auth=failed');
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.mensaje || errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
                throw new Error(msg);
            }

            // Para endpoints que devuelven archivos (PDF, CSV)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/pdf')) {
                return await response.blob();
            }
            if (contentType && contentType.includes('text/csv')) {
                return await response.text();
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ===== USUARIOS =====
    async getUsuarios({ includeInactive = false, pagina = 1, limite = 1000, orden, direccion } = {}) {
        const params = new URLSearchParams();
        if (includeInactive) params.set('include_inactive', 'true');
        if (pagina != null) params.set('pagina', String(pagina));
        if (limite != null) params.set('limite', String(limite));
        if (orden) params.set('orden', String(orden));
        if (direccion) params.set('direccion', String(direccion));
        params.set('_ts', Date.now().toString());
        const qs = params.toString();
        const url = qs ? `${CONSTANTS.API_ENDPOINTS.USUARIOS}?${qs}` : CONSTANTS.API_ENDPOINTS.USUARIOS;
        return this.request(url);
    }

    async getClientes() {
        return this.request(CONSTANTS.API_ENDPOINTS.CLIENTES);
    }

    async getUsuario(id, { includeInactive = false } = {}) {
        const params = new URLSearchParams();
        if (includeInactive) params.set('include_inactive', 'true');
        params.set('_ts', Date.now().toString());
        const qs = params.toString();
        const sep = qs ? `?${qs}` : '';
        return this.request(`${CONSTANTS.API_ENDPOINTS.USUARIOS}/${id}${sep}`);
    }

    async createUsuario(data) {
        return this.request(CONSTANTS.API_ENDPOINTS.USUARIOS, {
            method: 'POST',
            body: data
        });
    }

    async updateUsuario(id, data) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.USUARIOS}/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteUsuario(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.USUARIOS}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== RESERVAS =====
    async getReservas() {
        return this.request(CONSTANTS.API_ENDPOINTS.RESERVAS);
    }

    async getAllReservas() {
        return this.request(CONSTANTS.API_ENDPOINTS.RESERVAS_ALL);
    }

    async getReserva(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.RESERVAS}/${id}`);
    }

    async createReserva(data) {
        return this.request(CONSTANTS.API_ENDPOINTS.RESERVAS, {
            method: 'POST',
            body: data
        });
    }

    async updateReserva(id, data) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.RESERVAS}/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteReserva(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.RESERVAS}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== SALONES =====
    async getSalones({ includeInactive = false, pagina = 1, limite = 1000 } = {}) {
        const params = new URLSearchParams();
        if (includeInactive) params.set('include_inactive', 'true');
        if (pagina != null) params.set('pagina', String(pagina));
        if (limite != null) params.set('limite', String(limite));
        // Evitar respuestas viejas en cambios rápidos del toggle
        params.set('ts', String(Date.now()));
        const qs = params.toString();
        const url = qs ? `${CONSTANTS.API_ENDPOINTS.SALONES}?${qs}` : CONSTANTS.API_ENDPOINTS.SALONES;
        return this.request(url);
    }

    async getSalon(id, { includeInactive = false } = {}) {
        const qs = includeInactive ? '?include_inactive=true' : '';
        return this.request(`${CONSTANTS.API_ENDPOINTS.SALONES}/${id}${qs}`);
    }

    async createSalon(data) {
        return this.request(CONSTANTS.API_ENDPOINTS.SALONES, {
            method: 'POST',
            body: data
        });
    }

    async updateSalon(id, data) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SALONES}/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteSalon(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SALONES}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== SERVICIOS =====
    async getServicios({ includeInactive = false, page = 1, limit = 1000 } = {}) {
        const params = new URLSearchParams();
        if (includeInactive) params.set('include_inactive', 'true');
        if (page != null) params.set('page', String(page));
        if (limit != null) params.set('limit', String(limit));
        const qs = params.toString();
        const url = qs ? `${CONSTANTS.API_ENDPOINTS.SERVICIOS}?${qs}` : CONSTANTS.API_ENDPOINTS.SERVICIOS;
        return this.request(url);
    }

    async getServicio(id, { includeInactive = false } = {}) {
        const qs = includeInactive ? '?include_inactive=true' : '';
        return this.request(`${CONSTANTS.API_ENDPOINTS.SERVICIOS}/${id}${qs}`);
    }

    async createServicio(data) {
        return this.request(CONSTANTS.API_ENDPOINTS.SERVICIOS, {
            method: 'POST',
            body: data
        });
    }

    async updateServicio(id, data) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SERVICIOS}/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteServicio(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SERVICIOS}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== TURNOS =====
    async getTurnos({ page = 1, limit = 100, includeInactive=false} = {}) {
        const params = new URLSearchParams();
        if (page != null) params.set('page', String(page));
        if (limit != null) params.set('limit', String(limit));
        if(includeInactive) params.set('include_inactive', 'true');
        // Evitar respuestas viejas en cache
        params.set('ts', String(Date.now())); 
        const qs = params.toString();
        const url = qs ? `${CONSTANTS.API_ENDPOINTS.TURNOS}?${qs}` : CONSTANTS.API_ENDPOINTS.TURNOS;
        return this.request(url);
    }

    async getTurno(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.TURNOS}/${id}`);
    }

    async createTurno(data) {
        return this.request(CONSTANTS.API_ENDPOINTS.TURNOS, {
            method: 'POST',
            body: data
        });
    }

    async updateTurno(id, data) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.TURNOS}/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteTurno(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.TURNOS}/${id}`, {
            method: 'DELETE'
        });
    }

    // ===== REPORTES =====
    async getReporteReservas(formato = 'pdf') {
        return this.request(`${CONSTANTS.API_ENDPOINTS.REPORTE_RESERVAS}?formato=${formato}`);
    }

    async getEstadisticasSalones(formato = null) {
        const endpoint = formato ? 
            `${CONSTANTS.API_ENDPOINTS.ESTADISTICAS_SALONES}?formato=${formato}` :
            CONSTANTS.API_ENDPOINTS.ESTADISTICAS_SALONES;
        return this.request(endpoint);
    }

    async getEstadisticasServicios(formato = null) {
        const endpoint = formato ? 
            `${CONSTANTS.API_ENDPOINTS.ESTADISTICAS_SERVICIOS}?formato=${formato}` :
            CONSTANTS.API_ENDPOINTS.ESTADISTICAS_SERVICIOS;
        return this.request(endpoint);
    }

    async getEstadisticasTurnos(formato = null) {
        const endpoint = formato ? 
            `${CONSTANTS.API_ENDPOINTS.ESTADISTICAS_TURNOS}?formato=${formato}` :
            CONSTANTS.API_ENDPOINTS.ESTADISTICAS_TURNOS;
        return this.request(endpoint);
    }
}

// Para compatibilidad con código existente
window.apiClient = new API();