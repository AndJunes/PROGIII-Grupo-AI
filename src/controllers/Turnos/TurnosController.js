import TurnosService from '../../services/TurnosService.js';

class TurnosController {

    async create(req, res) {
        try {
            const turno = await TurnosService.create(req.body);
            res.status(201).json({
                mensaje: "Turno creado correctamente",
                turno
            });
        } catch (error) {
            console.error("Error al crear turno:", error);
            res.status(500).json({ mensaje: "Error al crear turno" });
        }
    }

    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const includeInactive = req.query.include_inactive === 'true';
            const { turnos, total } = await TurnosService.getAllWithPagination(limit, offset, includeInactive);
            const totalPaginas = Math.ceil(total / limit);

            res.json({
                pagina_actual: page,
                total_paginas: totalPaginas,
                total_registros: total,
                turnos
            });
        } catch (error) {
            console.error("Error al obtener turnos:", error);
            res.status(500).json({ mensaje: "Error al obtener turnos" });
        }
    }

    async getById(req, res) {
        try {
            const turno = await TurnosService.getById(req.params.id);
            res.json(turno);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: "Turno no encontrado" });
            }
            console.error("Error al obtener turno:", error);
            res.status(500).json({ mensaje: "Error al obtener turno" });
        }
    }

    async update(req, res) {
        try {
            const turno = await TurnosService.update(req.params.id, req.body);
            res.json({
                mensaje: "Turno actualizado correctamente",
                turno
            });
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: "Turno no encontrado" });
            }
            console.error("Error al actualizar turno:", error);
            res.status(500).json({ mensaje: "Error al actualizar turno" });
        }
    }

    async delete(req, res) {
        try {
            const result = await TurnosService.delete(req.params.id);
            res.json(result);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: "Turno no encontrado" });
            }
            console.error("Error al eliminar turno:", error);
            res.status(500).json({ mensaje: "Error al eliminar turno" });
        }
    }
}

export default new TurnosController();
