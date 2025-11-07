import SalonesDAO from '../database/SalonesDAO.js';

class SalonesService {
    async getAllWithFilters(params, includeInactive = false) {
        return await SalonesDAO.findAllWithFilters(params, includeInactive);
    }

    async getById(id, includeInactive = false) {
        const salon = await SalonesDAO.findById(id, includeInactive);
        if (!salon) throw new Error('Salon no encontrado');
        return salon;
    }

    async create(data) {
        return await SalonesDAO.create(data);
    }

    async update(id, data) {
        const salon = await SalonesDAO.update(id, data);
        if (!salon) throw new Error('Salon no encontrado o no hay campos para actualizar');
        return salon;
    }

    async delete(id) {
        return await SalonesDAO.softDelete(id);
    }
}

export default new SalonesService();
