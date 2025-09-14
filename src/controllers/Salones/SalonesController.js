const Salones = require("../../models/Salon");
const Reservas = require("../../models/Reserva");
const ReservaServicio = require('../../models/ReservaServicio');


class SalonesController {

    //Listar todos los salones
    async getAll(req, res) {
        try {
            const salones = await Salones.findAll();
            res.json(salones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al buscar salones' });
        }
    }

    //Crear un nuevo salón
    async create(req, res) {
        try {
            const { titulo, direccion, importe, capacidad, latitud, longitud } = req.body;
            const salon = await Salones.create({ titulo, direccion, importe, capacidad, latitud, longitud });
            res.status(201).json(salon);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al crear el salon' });
        }
    }

    //Actualizar un salón existente
    async update(req, res) {
        try {
            const id = req.params.id;
            const { titulo, direccion, importe, capacidad, latitud, longitud } = req.body;

            const salon = await Salones.findByPk(id);
            if (!salon) return res.status(404).json({ error: "salon no encontrado" });

            await salon.update({ titulo, direccion, importe, capacidad, latitud, longitud });
            res.json(salon);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al actualizar el salon' });
        }
    }

    //Eliminar un salón
    async delete(req, res) {
        try {
            const id = req.params.id;
            const salon = await Salones.findByPk(id);
            if (!salon) {
                return res.status(404).json({ error: "salón no encontrado" });
            }

            //Obtener reservas asociadas al salón
            const reservas = await Reservas.findAll({ where: { salon_id: id } });

            //Soft delete de reservas y reservas_servicios asociados
            for (const reserva of reservas) {
                await ReservaServicio.update(
                    { activo: 0 },
                    { where: { reserva_id: reserva.reserva_id } }
                );

                await reserva.update({ activo: 0 });
            }

            //Finalmente eliminar el salón (soft delete)
            await salon.update({ activo: 0 });

            res.json({ message: "Salón y reservas asociadas eliminadas correctamente." });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar el salón" });
        }
    }

}

module.exports = new SalonesController();
