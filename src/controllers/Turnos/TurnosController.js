import TurnosService from '../../services/TurnosService.js';

class TurnosController {
    // Crear turno
    async create(req, res) {
        try {
            const turno = await TurnosService.create(req.body);
            res.status(201).json(turno);
        } catch (error) {
            console.error("error al crear turno:", error);
            res.status(500).json({ error: "error al crear el turno" });
        }
    }

    // Listar todos los turnos activos
    async getAll(req, res) {
        try {
            const turnos = await TurnosService.getAll();
            res.json(turnos);
        } catch (error) {
            console.error("error al obtener turnos:", error);
            res.status(500).json({ error: "error al obtener turnos" });
        }
    }

    // Obtener turno por ID
    async getById(req, res) {
        try {
            const turno = await TurnosService.getById(req.params.id);
            res.json(turno);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            console.error("error al obtener turno:", error);
            res.status(500).json({ error: "error al obtener el turno" });
        }
    }

    // Actualizar turno
    async update(req, res) {
        try {
            const turno = await TurnosService.update(req.params.id, req.body);
            res.json(turno);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            console.error("error al actualizar turno:", error);
            res.status(500).json({ error: "error al actualizar el turno" });
        }
    }

    // Eliminar turno (soft delete)
    async delete(req, res) {
        try {
            const result = await TurnosService.delete(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ error: "turno no encontrado" });
            }
            console.error("error al eliminar turno:", error);
            res.status(500).json({ error: "error al eliminar el turno" });
        }
    }
}

export default new TurnosController();
