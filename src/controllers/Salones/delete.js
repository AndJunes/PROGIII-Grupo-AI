const Salones = require("../../models/Salon");
const Reservas = require("../../models/Reserva");

module.exports = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const salon = await Salones.findByPk(id);
        if (!salon) {
            return res.status(404).json({ error: "salon no encontrado" });
        }

        const reservasAsociadas = await Reservas.count({ where: { salon_id: id } });
        if (reservasAsociadas > 0) {
            return res.status(400).json({
                error: "no se puede eliminar el salón porque tiene reservas asociadas."
            });
        }

        await salon.destroy();
        res.json({ message: `salon con id ${id} eliminado correctamente.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "error al eliminar el salon" });
    }
};
