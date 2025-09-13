const Salones = require("../../models/Salon");

module.exports = async (req, res) => {
    try {
        // Convertir id a número
        const id = parseInt(req.params.id, 10);

        //DEBUG
        //console.log("ID recibido:", id);

        // Buscar el salon por PK
        const salon = await Salones.findByPk(id);

        //DEBUG
        //console.log("Salón encontrado:", salon);

        if (!salon) {
            return res.status(404).json({ error: "salon no encontrado" });
        }

        const { titulo, direccion, capacidad, importe } = req.body || {};

        if (!titulo && !direccion && !capacidad && !importe) {
            return res.status(400).json({ error: "no se enviaron datos para actualizar" });
        }

        await salon.update({
            titulo: titulo ?? salon.titulo,
            direccion: direccion ?? salon.direccion,
            capacidad: capacidad ?? salon.capacidad,
            importe: importe ?? salon.importe
        });

        res.json(salon);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "error al actualizar el salon" });
    }
};
