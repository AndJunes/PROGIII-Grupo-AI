import SalonesService from '../../services/SalonesService.js';
import apicache from 'apicache';
import AuditLogger from '../../utils/AuditLogger.js';

class SalonesController {

    // Listar todos los salones (con filtros, paginación y orden)
    async getAll(req, res) {
        try {
            const { pagina = 1, limite = 10, orden, direccion, filtro_titulo } = req.query;
            const includeInactive = req.query.include_inactive === 'true';

            const salones = await SalonesService.getAllWithFilters({
                pagina: Number(pagina) || 1,
                limite: Number(limite) || 10,
                orden,
                direccion,
                filtro_titulo
            }, includeInactive);

            res.json(salones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al buscar salones' });
        }
    }

    // Consultar salones específicos por id
    async getById(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const salon = await SalonesService.getById(req.params.id, includeInactive);
            res.json(salon);
        } catch (error) {
            res.status(404).json({ error: "Salón no encontrado" });
        }
    }

    // Crear un nuevo salón
    async create(req, res) {
        try {
            const salon = await SalonesService.create(req.body);
            // invalidar caché de grupo 'salones'
            apicache.clear('salones');
            res.status(201).json(salon);
            await AuditLogger.log({
                req,
                entity: 'salones',
                entityId: salon?.id || salon?.salon_id,
                action: 'create',
                changes: { after: salon }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el salón' });
        }
    }

    // Actualizar un salón existente
    async update(req, res) {
        try {
            const before = await SalonesService.getById(req.params.id, true);
            const salon = await SalonesService.update(req.params.id, req.body);
            // invalidar caché de grupo 'salones'
            apicache.clear('salones');
            res.json(salon);
            await AuditLogger.log({
                req,
                entity: 'salones',
                entityId: Number(req.params.id),
                action: 'update',
                changes: { before, after: salon }
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el salón' });
        }
    }

    // Eliminar un salón
    async delete(req, res) {
        try {
            const before = await SalonesService.getById(req.params.id, true);
            const salon = await SalonesService.delete(req.params.id);
            // invalidar caché de grupo 'salones'
            apicache.clear('salones');
            res.json(salon);
            await AuditLogger.log({
                req,
                entity: 'salones',
                entityId: Number(req.params.id),
                action: 'delete',
                changes: { before }
            });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar el salón" });
        }
    }

}

export default new SalonesController();
