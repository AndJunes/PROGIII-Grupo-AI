import ServiciosService from '../../services/ServiciosService.js';

import apicache from 'apicache';
import AuditLogger from '../../utils/AuditLogger.js';
class ServiciosController {

    async getAll(req, res) {
        try {
            const propios = req.query.propios === 'true';
            const usuarioId = propios ? req.usuario.usuario_id : null;

            // Paginación
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const includeInactive = req.query.include_inactive === 'true';

            let servicios;

            if (propios) {
                servicios = await ServiciosService.getByUser(usuarioId);
                return res.json(servicios);
            } else {
                const { servicios: rows, total } = await ServiciosService.getAllWithFilters(limit, offset, includeInactive);

                const totalPaginas = Math.ceil(total / limit);

                return res.json({
                    pagina_actual: page,
                    total_paginas: totalPaginas,
                    total_registros: total,
                    servicios: rows
                });
            }

        } catch (error) {
            if (error.message === "no_services") {
                return res.json({ mensaje: "No tienes ningún servicio vinculado" });
            }
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar servicios' });
        }
    }

    async getById(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const servicio = await ServiciosService.getById(req.params.id, includeInactive);
            res.json(servicio);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: "Servicio no encontrado" });
            }
            console.error(error);
            res.status(500).json({ mensaje: 'Error al obtener servicio' });
        }
    }

    async create(req, res) {
        try {
            const nuevoServicio = await ServiciosService.create(req.body);
            res.status(201).json({
                mensaje: 'El servicio fue creado correctamente',
                servicio: nuevoServicio
            });
            // invalidar cache de grupo 'servicios'
            apicache.clear('servicios');
            // auditoría
            await AuditLogger.log({
                req,
                entity: 'servicios',
                entityId: nuevoServicio?.id || nuevoServicio?.servicio_id,
                action: 'create',
                changes: { after: nuevoServicio }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear servicio' });
        }
    }

    async update(req, res) {
        try {
            const before = await ServiciosService.getById(req.params.id, true);
            const servicio = await ServiciosService.update(req.params.id, req.body);
            res.json({
                mensaje: 'Servicio actualizado correctamente',
                servicio
            });
            // invalidar cache de grupo 'servicios'
            apicache.clear('servicios');
            // auditoría
            await AuditLogger.log({
                req,
                entity: 'servicios',
                entityId: Number(req.params.id),
                action: 'update',
                changes: { before, after: servicio }
            });
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: 'Servicio no encontrado' });
            }
            console.error(error);
            res.status(500).json({ mensaje: 'Error al actualizar servicio' });
        }
    }

    async delete(req, res) {
        try {
            const before = await ServiciosService.getById(req.params.id, true);
            const result = await ServiciosService.delete(req.params.id);
            res.json(result);
            // invalidar cache de grupo 'servicios'
            apicache.clear('servicios');
            // auditoría
            await AuditLogger.log({
                req,
                entity: 'servicios',
                entityId: Number(req.params.id),
                action: 'delete',
                changes: { before }
            });
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: 'Servicio no encontrado o ya eliminado' });
            }
            console.error(error);
            res.status(500).json({ mensaje: 'Error al eliminar servicio' });
        }
    }
}

export default new ServiciosController();
