import ServiciosDAO from "../database/ServiciosDAO.js";

class ServiciosService {

    async getAllWithFilters(limit, offset, includeInactive = false) {
        const { rows, total } = await ServiciosDAO.findAllWithFilters(limit, offset, includeInactive);
        return { servicios: rows, total };
    }

    async getByUser(usuarioId) {
        const rows = await ServiciosDAO.getByUser(usuarioId);
        if (rows.length === 0) throw new Error("no_services");
        return rows;
    }

    async getById(id, includeInactive = false) {
        const servicio = await ServiciosDAO.getById(id, includeInactive);
        if (!servicio) throw new Error("not_found");
        return servicio;
    }

    async create(data) {
        return await ServiciosDAO.create(data);
    }

    async update(id, data) {
        const updated = await ServiciosDAO.update(id, data);
        if (!updated) throw new Error("not_found");
        return updated;
    }

    async delete(id) {
        const servicio = await ServiciosDAO.getById(id);
        if (!servicio) throw new Error("not_found");
        return await ServiciosDAO.delete(id);
    }
}

export default new ServiciosService();
