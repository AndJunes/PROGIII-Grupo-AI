import TurnosDAO from '../database/TurnosDAO.js';

class TurnosService {

    async create(data) {
        return await TurnosDAO.create(data);
    }

    async getAllWithPagination(limit, offset, includeInactive) {
        const { rows, total } = await TurnosDAO.findAllWithPagination(limit, offset, includeInactive);
        return { turnos: rows, total };
    }

    async getById(id) {
        return await TurnosDAO.getById(id);
    }

    async update(id, data) {
        return await TurnosDAO.update(id, data);
    }

    async delete(id) {
        return await TurnosDAO.delete(id);
    }
}

export default new TurnosService();
