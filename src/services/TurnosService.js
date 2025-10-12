// services/TurnosService.js
import Turno from "../models/Turno.js";

class TurnosService {
    // Crear turno
    async create(data) {
        return await Turno.create(data);
    }

    // Listar todos los turnos activos
    async getAll() {
        return await Turno.findAll({
            where: { activo: true },
            order: [["turno_id", "ASC"]],
        });
    }

    // Obtener turno por ID
    async getById(id) {
        const turno = await Turno.findByPk(id);
        if (!turno || !turno.activo) throw new Error("not_found");
        return turno;
    }

    // Actualizar turno
    async update(id, data) {
        const turno = await Turno.findByPk(id);
        if (!turno || !turno.activo) throw new Error("not_found");
        await turno.update(data);
        return turno;
    }

    // Eliminar turno (soft delete)
    async delete(id) {
        const turno = await Turno.findByPk(id);
        if (!turno || !turno.activo) throw new Error("not_found");
        await turno.update({ activo: false });
        return { message: "turno eliminado (soft delete)" };
    }
}

export default new TurnosService();
