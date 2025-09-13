const Salones = require("../../models/Salon");
const Reservas = require("../../models/Reserva");

class SalonesController {

    // Listar todos los salones
    async getAll(req, res) {
        try {
            const salones = await Salones.findAll();
            res.json(salones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al buscar salones' });
        }
    }

    // Crear un nuevo salón
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

    // Actualizar un salón existente
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

    // Eliminar un salón
    async delete(req, res) {
        try {
            const id = req.params.id;
            const salon = await Salones.findByPk(id);
            if (!salon) return res.status(404).json({ error: "salon no encontrado" });

            // Validación: no eliminar si tiene reservas
            const reservasAsociadas = await Reservas.count({ where: { salon_id: id } });
            if (reservasAsociadas > 0) {
                return res.status(400).json({ error: "no se puede eliminar el salon porque tiene reservas asociadas." });
            }

            await salon.destroy();
            res.json({ message: `salon con id ${id} eliminado correctamente.` });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al eliminar el salon' });
        }
    }
}

module.exports = new SalonesController();
