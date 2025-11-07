// Constantes de la aplicación
export const CONSTANTS = {
    USER_TYPES: {
        ADMIN: 1,
        EMPLOYEE: 2,
        CLIENT: 3
    },
    
    STATUS: {
        ACTIVE: 1,
        INACTIVE: 0
    },

    REPORT_FORMATS: {
        PDF: 'pdf',
        CSV: 'csv',
        EXCEL: 'excel'
    },

    API_ENDPOINTS: {
        LOGIN: '/auth/login',
        USUARIOS: '/usuarios',
        CLIENTES: '/usuarios/clientes',
        RESERVAS: '/reservas',
        RESERVAS_ALL: '/reservas/all',
        SALONES: '/salones',
        SERVICIOS: '/servicios',
        TURNOS: '/turnos',
        AUDITORIA: '/auditoria',
        REPORTE_RESERVAS: '/reservas/informe',
        ESTADISTICAS_SALONES: '/reservas/estadisticas/salones',
        ESTADISTICAS_SERVICIOS: '/reservas/estadisticas/servicios',
        ESTADISTICAS_TURNOS: '/reservas/estadisticas/turnos'
    },

    NOTIFICATION_TYPES: {
        RESERVA: 'reserva',
        USUARIO: 'usuario',
        SISTEMA: 'sistema',
        ERROR: 'error'
    },

    LOCAL_STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        USER_DATA: 'userData',
        REMEMBERED_USER: 'rememberedUser',
        SIDEBAR_STATE: 'sidebarCollapsed'
    }
};