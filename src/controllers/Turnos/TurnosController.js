import Turno from "../../models/Turno.js";

class TurnosController {
    // Crear el turno
    static async create(req, res) {
        try {
            const turno = await Turno.create(req.body);
            res.status(201).send(turno);
        } catch (error) {
            console.error("error al crear turno:", error);
            res.status(500).json({ error: "error al crear el turno" });
        }
    }

    // Listamos todos los turnos
    static async getAll(req, res) {
        try {
            const turnos = await Turno.findAll({
                where: { activo: true },
                order: [["turno_id", "ASC"]],
            });
            res.json(turnos);
        } catch (error) {
            console.error("error al obtener turnos:", error);
            res.status(500).json({ error: "error al obtener turnos" });
        }
    }

    // Obtenemos los turnos por id
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const turno = await Turno.findByPk(id);
            if (!turno || !turno.activo) {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            res.json(turno);
        } catch (error) {
            console.error("error al obtener turno:", error);
            res.status(500).json({ error: "error al obtener el turno" });
        }
    }

    // Actualizamos el turno
    static async update(req, res) {
        try {
            const { id } = req.params;
            const turno = await Turno.findByPk(id);
            if (!turno || !turno.activo) {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            await turno.update(req.body);
            res.json(turno);
        } catch (error) {
            console.error("error al actualizar turno:", error);
            res.status(500).json({ error: "error al actualizar el turno" });
        }
    }

    // Eliminamos el turno (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const turno = await Turno.findByPk(id);
            if (!turno || !turno.activo) {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            await turno.update({ activo: false });
            res.json({ message: "turno eliminado (soft delete)" });
        } catch (error) {
            console.error("error al eliminar turno:", error);
            res.status(500).json({ error: "error al eliminar el turno" });
        }
    }
}

export default TurnosController;
