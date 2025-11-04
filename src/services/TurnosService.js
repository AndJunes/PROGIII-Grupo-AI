import TurnosDAO from '../database/TurnosDAO.js';

class TurnosService {

    // Crear turno
    async create(data) {
        return TurnosDAO.create(data);
    }

    // Listar todos los turnos activos
    async getAll() {
        return TurnosDAO.getAll();
    }

    // Obtener turno por ID
    async getById(id) {
        return TurnosDAO.getById(id);
    }

    // Actualizar turno
    async update(id, data) {
        return TurnosDAO.update(id, data);
    }

    // Eliminar turno (soft delete)
    async delete(id) {
        return TurnosDAO.delete(id);
    }
}

export default new TurnosService();
