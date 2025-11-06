import SalonesService from '../../services/SalonesService.js';
import apicache from 'apicache';

class SalonesController {

    // Listar todos los salones (con filtros, paginación y orden)
    async getAll(req, res) {
        try {
            const { pagina = 1, limite = 10, orden, direccion, filtro_titulo } = req.query;

            const salones = await SalonesService.getAllWithFilters({
                pagina: Number(pagina) || 1,
                limite: Number(limite) || 10,
                orden,
                direccion,
                filtro_titulo
            });

            res.json(salones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al buscar salones' });
        }
    }

    // Consultar salones específicos por id
    async getById(req, res) {
        try {
            const salon = await SalonesService.getById(req.params.id);
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
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el salón' });
        }
    }

    // Actualizar un salón existente
    async update(req, res) {
        try {
            const salon = await SalonesService.update(req.params.id, req.body);
            // invalidar caché de grupo 'salones'
            apicache.clear('salones');
            res.json(salon);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el salón' });
        }
    }

    // Eliminar un salón
    async delete(req, res) {
        try {
            const salon = await SalonesService.delete(req.params.id);
            // invalidar caché de grupo 'salones'
            apicache.clear('salones');
            res.json(salon);
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar el salón" });
        }
    }

}

export default new SalonesController();
