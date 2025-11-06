import SalonesDAO from '../database/SalonesDAO.js';

class SalonesService {
    async getAllWithFilters(params) {
        return await SalonesDAO.findAllWithFilters(params);
    }

    async getById(id) {
        const salon = await SalonesDAO.findById(id);
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
