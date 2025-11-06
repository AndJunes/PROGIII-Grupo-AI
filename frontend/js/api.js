// Ruta: frontend/js/admin/api.js (COMPLETO Y CORREGIDO)

import { CONSTANTS } from './utils/constants.js';
import { Helpers } from './utils/helpers.js';

export class API {
    constructor() {
        this.baseURL = 'https://localhost:3006/api'; // esta es la base de tu api
        this.token = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    }

    /**
     * esta funcion 'request' ahora la usamos solo para pedir JSON (GET, POST, PUT, DELETE)
     */
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
            console.log(`Haciendo request JSON a: ${url}`, config);
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // token inválido o expirado
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA);
                window.location.replace('./index.html?auth=failed');
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // buscamos el 'mensaje' que pusimos en el backend
                throw new Error(errorData.mensaje || errorData.message || errorData.error || `Error ${response.status}`);
            }

            // comentario: borramos la logica de descargar archivos de aca.
            // si la respuesta no tiene contenido (como en un DELETE), devolvemos ok
            if (response.status === 204) {
                return { ok: true };
            }

            // si todo sale bien, devolvemos el json
            return await response.json();

        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * esta es la funcion nueva que 'reports.js' necesita.
     * se especializa solo en descargar archivos (pdf o csv)
     */
    async getReport(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        console.log(`Pidiendo reporte (archivo) a: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                // NO mandamos 'Content-Type': 'application/json'
                // porque estamos pidiendo un archivo
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        });

        if (response.status === 401) {
             // token inválido o expirado
             localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.AUTH_TOKEN);
             localStorage.removeItem(CONSTANTS.LOCAL_STORAGE_KEYS.USER_DATA);
             window.location.replace('./index.html?auth=failed');
             throw new Error('Sesión expirada');
        }

        if (!response.ok) {
            const errorData = await response.json(); // el backend tira json si hay error
            throw new Error(errorData.mensaje || `Error ${response.status}`);
        }

        // si sale todo ok, devolvemos el archivo como un 'blob'
        // 'reports.js' sabe como manejar esto
        return response.blob(); 
    }

    // ===== USUARIOS =====
    // (toda esta seccion de CRUD estaba perfecta, no se toca)
    async getUsuarios() {
        return this.request(CONSTANTS.API_ENDPOINTS.USUARIOS);
    }

    async getClientes() {
        return this.request(CONSTANTS.API_ENDPOINTS.CLIENTES);
    }

    async getUsuario(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.USUARIOS}/${id}`);
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
    // (toda esta seccion de CRUD estaba perfecta, no se toca)
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
    // (toda esta seccion de CRUD estaba perfecta, no se toca)
    async getSalones() {
        return this.request(CONSTANTS.API_ENDPOINTS.SALONES);
    }

    async getSalon(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SALONES}/${id}`);
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
    // (toda esta seccion de CRUD estaba perfecta, no se toca)
    async getServicios() {
        return this.request(CONSTANTS.API_ENDPOINTS.SERVICIOS);
    }

    async getServicio(id) {
        return this.request(`${CONSTANTS.API_ENDPOINTS.SERVICIOS}/${id}`);
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
    // (toda esta seccion de CRUD estaba perfecta, no se toca)
    async getTurnos() {
        return this.request(CONSTANTS.API_ENDPOINTS.TURNOS);
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
    // comentario: borramos todas las funciones viejas de reportes 
    // (getReporteReservas, getEstadisticasSalones, etc)
    // porque ahora usamos la nueva funcion 'getReport' que es mas simple
    // y funciona con el 'reports.js' que hicimos.
}

// Para compatibilidad con código existente
window.apiClient = new API();