import { SalonesManager } from './salones-manager.js';
import { ServiciosManager } from './servicios-manager.js';
import { TurnosManager } from './turnos-manager.js';
import { UsuariosManager } from './usuarios-manager.js';
import { ReservasManager } from './reservas-manager.js';

export class CRUDManager {
    constructor() {
        this.managers = {
            salones: new SalonesManager(),
            servicios: new ServiciosManager(),
            turnos: new TurnosManager(),
            usuarios: new UsuariosManager(),
            reservas: new ReservasManager()
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupEventDelegation();
        this.loadInitialData();
    }

    bindEvents() {
        // Delegar eventos a los managers específicos
        document.getElementById('addReservaBtn')?.addEventListener('click', () => this.showReservaModal());
        document.getElementById('addSalonBtn')?.addEventListener('click', () => this.showSalonModal());
        document.getElementById('addServicioBtn')?.addEventListener('click', () => this.showServicioModal());
        document.getElementById('addTurnoBtn')?.addEventListener('click', () => this.showTurnoModal());
        document.getElementById('addUsuarioBtn')?.addEventListener('click', () => this.showUsuarioModal());
    }

    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Botones de editar
            if (e.target.closest('.edit-btn')) {
                const button = e.target.closest('.edit-btn');
                const id = parseInt(button.getAttribute('data-id'));
                const entity = button.getAttribute('data-entity');
                this.handleEditClick(id, entity);
            }
            
            // Botones de eliminar
            if (e.target.closest('.delete-btn')) {
                const button = e.target.closest('.delete-btn');
                const id = parseInt(button.getAttribute('data-id'));
                const entity = button.getAttribute('data-entity');
                this.handleDeleteClick(id, entity);
            }
        });
    }

    handleEditClick(id, entity) {
        console.log(`Editando ${entity} con ID:`, id);
        
        const entityMap = {
            'salon': { manager: 'salones', method: 'editSalon' },
            'servicio': { manager: 'servicios', method: 'editServicio' },
            'turno': { manager: 'turnos', method: 'editTurno' },
            'usuario': { manager: 'usuarios', method: 'editUsuario' },
            'reserva': { manager: 'reservas', method: 'editReserva' }
        };
        
        const config = entityMap[entity];
        if (config && this.managers[config.manager] && this.managers[config.manager][config.method]) {
            this.managers[config.manager][config.method](id);
        } else {
            console.error(`No se encontró el método para editar ${entity}`);
            this.showNotification(`Error: No se puede editar ${entity}`, 'error');
        }
    }

    handleDeleteClick(id, entity) {
        console.log(`Eliminando ${entity} con ID:`, id);
        
        const entityMap = {
            'salon': { manager: 'salones', method: 'deleteSalon' },
            'servicio': { manager: 'servicios', method: 'deleteServicio' },
            'turno': { manager: 'turnos', method: 'deleteTurno' },
            'usuario': { manager: 'usuarios', method: 'deleteUsuario' },
            'reserva': { manager: 'reservas', method: 'deleteReserva' }
        };
        
        const config = entityMap[entity];
        if (config && this.managers[config.manager] && this.managers[config.manager][config.method]) {
            this.managers[config.manager][config.method](id);
        } else {
            console.error(`No se encontró el método para eliminar ${entity}`);
            this.showNotification(`Error: No se puede eliminar ${entity}`, 'error');
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadReservas(),
                this.loadSalones(),
                this.loadServicios(),
                this.loadTurnos(),
                this.loadUsuarios()
            ]);
            console.log('Datos iniciales cargados correctamente');
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error al cargar datos iniciales', 'error');
        }
    }

    // Métodos delegados a los managers específicos
    async loadReservas() { 
        try {
            return await this.managers.reservas.loadReservas(); 
        } catch (error) {
            console.error('Error loading reservas:', error);
            throw error;
        }
    }
    
    async loadSalones() { 
        try {
            return await this.managers.salones.loadSalones(); 
        } catch (error) {
            console.error('Error loading salones:', error);
            throw error;
        }
    }
    
    async loadServicios() { 
        try {
            return await this.managers.servicios.loadServicios(); 
        } catch (error) {
            console.error('Error loading servicios:', error);
            throw error;
        }
    }
    
    async loadTurnos() { 
        try {
            return await this.managers.turnos.loadTurnos(); 
        } catch (error) {
            console.error('Error loading turnos:', error);
            throw error;
        }
    }
    
    async loadUsuarios() { 
        try {
            return await this.managers.usuarios.loadUsuarios(); 
        } catch (error) {
            console.error('Error loading usuarios:', error);
            throw error;
        }
    }

    showReservaModal(reserva = null) { 
        return this.managers.reservas.showReservaModal(reserva); 
    }
    
    showSalonModal(salon = null) { 
        return this.managers.salones.showSalonModal(salon); 
    }
    
    showServicioModal(servicio = null) { 
        return this.managers.servicios.showServicioModal(servicio); 
    }
    
    showTurnoModal(turno = null) { 
        return this.managers.turnos.showTurnoModal(turno); 
    }
    
    showUsuarioModal(usuario = null) { 
        return this.managers.usuarios.showUsuarioModal(usuario); 
    }

    saveReserva() { 
        return this.managers.reservas.saveReserva(); 
    }
    
    saveSalon() { 
        return this.managers.salones.saveSalon(); 
    }
    
    saveServicio() { 
        return this.managers.servicios.saveServicio(); 
    }
    
    saveTurno() { 
        return this.managers.turnos.saveTurno(); 
    }
    
    saveUsuario() { 
        return this.managers.usuarios.saveUsuario(); 
    }

    editReserva(id) { 
        return this.managers.reservas.editReserva(id); 
    }
    
    editSalon(id) { 
        return this.managers.salones.editSalon(id); 
    }
    
    editServicio(id) { 
        return this.managers.servicios.editServicio(id); 
    }
    
    editTurno(id) { 
        return this.managers.turnos.editTurno(id); 
    }
    
    editUsuario(id) { 
        return this.managers.usuarios.editUsuario(id); 
    }

    deleteReserva(id) { 
        return this.managers.reservas.deleteReserva(id); 
    }
    
    deleteSalon(id) { 
        return this.managers.salones.deleteSalon(id); 
    }
    
    deleteServicio(id) { 
        return this.managers.servicios.deleteServicio(id); 
    }
    
    deleteTurno(id) { 
        return this.managers.turnos.deleteTurno(id); 
    }
    
    deleteUsuario(id) { 
        return this.managers.usuarios.deleteUsuario(id); 
    }

    // Métodos comunes
    closeModal() {
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            modalContainer.innerHTML = '';
        }
        // Resetear estado en todos los managers
        Object.values(this.managers).forEach(manager => {
            if (manager.currentEditingId !== undefined) {
                manager.currentEditingId = null;
            }
            if (manager.currentEntity !== undefined) {
                manager.currentEntity = null;
            }
        });
    }

    showNotification(message, type = 'info') {
        // Usar el manager de salones para mostrar notificación
        if (this.managers.salones && this.managers.salones.showNotification) {
            this.managers.salones.showNotification(message, type);
        } else {
            // Fallback básico si no hay manager disponible
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Método para refrescar datos específicos
    refreshData(entity) {
        const managerMap = {
            'reservas': 'reservas',
            'salones': 'salones',
            'servicios': 'servicios',
            'turnos': 'turnos',
            'usuarios': 'usuarios'
        };

        const managerName = managerMap[entity];
        if (managerName && this.managers[managerName]) {
            const methodName = `load${managerName.charAt(0).toUpperCase() + managerName.slice(1)}`;
            if (this.managers[managerName][methodName]) {
                return this.managers[managerName][methodName]();
            }
        }
        
        console.warn(`No se encontró manager para la entidad: ${entity}`);
        return this.loadInitialData();
    }

    // Método para obtener un manager específico
    getManager(entity) {
        return this.managers[entity];
    }

    // Método para limpiar recursos
    destroy() {
        // Limpiar managers si tienen método destroy
        Object.values(this.managers).forEach(manager => {
            if (manager.destroy && typeof manager.destroy === 'function') {
                manager.destroy();
            }
        });
        
        // Limpiar event listeners
        document.removeEventListener('click', this.handleEditClick);
        document.removeEventListener('click', this.handleDeleteClick);
    }
}

// Inicializar CRUD Manager
document.addEventListener('DOMContentLoaded', () => {
    window.crudManager = new CRUDManager();
});

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    if (window.crudManager) {
        window.crudManager.showNotification('Ha ocurrido un error inesperado', 'error');
    }
});