class ApiClient {
    constructor() {
        this.baseURL = 'https://localhost:3006/api';
        this.token = localStorage.getItem('authToken');
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

        try {
            console.log(`Haciendo request a: ${url}`);
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.replace('./index.html?auth=failed');
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getUsuarios() {
        return this.request('/usuarios');
    }

    async getClientes() {
        return this.request('/clientes');
    }
}

const apiClient = new ApiClient();