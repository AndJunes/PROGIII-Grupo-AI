import ServiciosService from '../../services/ServiciosService.js';

class ServiciosController {


    async getAll(req, res) {
        try {
            const servicios = await ServiciosService.getAll();
            res.json(servicios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar servicios' });
        }
    }

    async getByUser(req, res) {
        try {
            const usuarioId = req.usuario.usuario_id;
            const servicios = await ServiciosService.getByUser(usuarioId);
            res.json(servicios);
        } catch (error) {
            if (error.message === "no_services") {
                return res.json({ mensaje: "No tienes ningún servicio vinculado" });
            }
            console.error(error);
            res.status(500).json({ mensaje: 'Error al listar servicios del usuario' });
        }
    }

    async getById(req, res) {
        try {
            const servicio = await ServiciosService.getById(req.params.id);
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
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al crear servicio' });
        }
    }

    async update(req, res) {
        try {
            const servicio = await ServiciosService.update(req.params.id, req.body);
            res.json({
                mensaje: 'Servicio actualizado correctamente',
                servicio
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
            const result = await ServiciosService.delete(req.params.id);
            res.json(result);
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
