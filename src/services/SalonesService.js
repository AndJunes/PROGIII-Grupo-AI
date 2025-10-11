import Salones from '../models/Salon.js';
import ReservaServicio from "../models/ReservaServicio.js";


class SalonesService {
    async getALL() {
        return await Salones.findAll();
    }

    async getById(id) {
        const salon = await Salones.findByPk(id);
        if (!salon) throw new Error(`not_found`);
        return salon;
    }

    async create(data) {
        const { titulo, direccion, importe, capacidad, latitud, longitud } = data;
        return await Salones.create({ titulo, direccion, importe, capacidad, latitud, longitud });
    }

    async update(id, data) {
        const salon = await Salones.findByPk(id);
        if (!salon) throw new Error(`not_found`);
        await salon.update(data);
        return salon;
    }

    async delete(id) {
        const salon = await Salones.findByPk(id);
        if (!salon) throw new Error(`not_found`);

        //Obtener reservas asociadas al salon
        const reservas = await Salones.findAll({ where: { salon_id: id } });

        // Soft delete de reservas y reservas_servicios asociados
        for (const reserva of reservas) {
            await ReservaServicio.update(
                { activo: 0 },
                { where: { reserva_id: reserva.reserva_id } }
            );

            await reserva.update({ activo: 0 });
        }

        // Finalmente eliminar el salón (soft delete)
        await salon.update({ activo: 0 });

        return { message: "Salón y reservas asociadas eliminadas correctamente." };
    }
}

export default new SalonesService();