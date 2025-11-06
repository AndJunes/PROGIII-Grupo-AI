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

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadReservas(),
                this.loadSalones(),
                this.loadServicios(),
                this.loadTurnos(),
                this.loadUsuarios()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error al cargar datos iniciales', 'error');
        }
    }

    // Métodos delegados a los managers específicos
    async loadReservas() { return this.managers.reservas.loadReservas(); }
    async loadSalones() { return this.managers.salones.loadSalones(); }
    async loadServicios() { return this.managers.servicios.loadServicios(); }
    async loadTurnos() { return this.managers.turnos.loadTurnos(); }
    async loadUsuarios() { return this.managers.usuarios.loadUsuarios(); }

    showReservaModal(reserva = null) { return this.managers.reservas.showReservaModal(reserva); }
    showSalonModal(salon = null) { return this.managers.salones.showSalonModal(salon); }
    showServicioModal(servicio = null) { return this.managers.servicios.showServicioModal(servicio); }
    showTurnoModal(turno = null) { return this.managers.turnos.showTurnoModal(turno); }
    showUsuarioModal(usuario = null) { return this.managers.usuarios.showUsuarioModal(usuario); }

    saveReserva() { return this.managers.reservas.saveReserva(); }
    saveSalon() { return this.managers.salones.saveSalon(); }
    saveServicio() { return this.managers.servicios.saveServicio(); }
    saveTurno() { return this.managers.turnos.saveTurno(); }
    saveUsuario() { return this.managers.usuarios.saveUsuario(); }

    editReserva(id) { return this.managers.reservas.editReserva(id); }
    editSalon(id) { return this.managers.salones.editSalon(id); }
    editServicio(id) { return this.managers.servicios.editServicio(id); }
    editTurno(id) { return this.managers.turnos.editTurno(id); }
    editUsuario(id) { return this.managers.usuarios.editUsuario(id); }

    deleteReserva(id) { return this.managers.reservas.deleteReserva(id); }
    deleteSalon(id) { return this.managers.salones.deleteSalon(id); }
    deleteServicio(id) { return this.managers.servicios.deleteServicio(id); }
    deleteTurno(id) { return this.managers.turnos.deleteTurno(id); }
    deleteUsuario(id) { return this.managers.usuarios.deleteUsuario(id); }

    // Métodos comunes
    closeModal() {
        document.getElementById('modalContainer').innerHTML = '';
        // Resetear estado en todos los managers
        Object.values(this.managers).forEach(manager => {
            manager.currentEditingId = null;
            manager.currentEntity = null;
        });
    }

    showNotification(message, type = 'info') {
        // Usar el primer manager para mostrar notificación
        this.managers.salones.showNotification(message, type);
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
            return this.managers[managerName][`load${managerName.charAt(0).toUpperCase() + managerName.slice(1)}`]();
        }
        
        return this.loadInitialData();
    }
}

// Inicializar CRUD Manager
document.addEventListener('DOMContentLoaded', () => {
    window.crudManager = new CRUDManager();
});