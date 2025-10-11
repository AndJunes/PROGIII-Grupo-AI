// services/ServiciosService.js
import Servicio from "../models/Servicio.js";
import Reserva from "../models/Reserva.js";
import ReservaServicio from "../models/ReservaServicio.js";

// Relaciones Sequelize
ReservaServicio.belongsTo(Reserva, { foreignKey: 'reserva_id' });
ReservaServicio.belongsTo(Servicio, { foreignKey: 'servicio_id' });

class ServiciosService {

    // Obtener todos los servicios activos
    async getAll() {
        return await Servicio.findAll({
            where: { activo: 1 },
            order: [['servicio_id', 'ASC']]
        });
    }

    // Obtener servicios vinculados al usuario
    async getByUser(usuarioId) {
        const reservasServicios = await ReservaServicio.findAll({
            include: [
                {
                    model: Reserva,
                    where: { usuario_id: usuarioId, activo: 1 },
                    attributes: []
                },
                {
                    model: Servicio,
                    attributes: ['servicio_id', 'descripcion', 'importe']
                }
            ]
        });

        const servicios = reservasServicios.map(rs => rs.Servicio);
        const serviciosUnicos = Array.from(new Map(servicios.map(s => [s.servicio_id, s])).values());

        if (serviciosUnicos.length === 0) throw new Error("no_services");

        return serviciosUnicos;
    }

    // Obtener un servicio por ID
    async getById(id) {
        const servicio = await Servicio.findByPk(id);
        if (!servicio || servicio.activo === 0) throw new Error("not_found");
        return servicio;
    }

    // Crear un servicio
    async create(data) {
        const { descripcion, importe } = data;
        return await Servicio.create({
            descripcion,
            importe,
            activo: 1
        });
    }

    // Actualizar un servicio
    async update(id, data) {
        const servicio = await Servicio.findByPk(id);
        if (!servicio || servicio.activo === 0) throw new Error("not_found");

        await servicio.update({
            descripcion: data.descripcion,
            importe: data.importe
        });

        return servicio;
    }

    // Eliminar (soft delete)
    async delete(id) {
        const servicio = await Servicio.findByPk(id);
        if (!servicio || servicio.activo === 0) throw new Error("not_found");

        await servicio.update({ activo: 0 });
        return { message: "Servicio eliminado correctamente (soft delete)" };
    }
}

export default new ServiciosService();
