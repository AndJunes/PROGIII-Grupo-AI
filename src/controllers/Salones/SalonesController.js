import Salones from "../../models/Salon.js";
import SalonesService from '../../services/SalonesService.js';

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

    // Consultar salones específicos por id
    async getById(req, res) {
        try {
            const salon = await SalonesService.getById(req.params.id);
            res.json(salon);
        } catch (error) {
            if (error.code === "not_found") {
                return res.status(404).json({ error: "Salon no encontrado"})
            }
            console.error(error);
            res.status(500).json({ error: 'error al buscar el salón' });
        }
    }

    // Crear un nuevo salón
    async create(req, res) {
        try {
            const salon = await SalonesService.create(req.body);
            res.status(201).json(salon);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'error al crear el salon' });
        }
    }

    // Actualizar un salón existente
    async update(req, res) {
        try {
            const salon = await SalonesService.update(req.params.id, req.body);
            res.json(salon);
        } catch (error) {
            if (error.code === "not_found") {
                return res.status(404).json({ error: "Salon no encontrado"})
            }
            console.error(error);
            res.status(500).json({ error: 'error al actualizar el salon' });
        }
    }

    // Eliminar un salón
    async delete(req, res) {
        try {
            const salon = await SalonesService.delete(req.params.id);
            res.json(salon);
        } catch (error) {
            if (error.code === "not_found") {
                return res.status(404).json({ error: "Salon no encontrado"})
            }
            console.error(error);
            res.status(500).json({ error: "Error al eliminar el salón" });
        }
    }

}

export default new SalonesController();
