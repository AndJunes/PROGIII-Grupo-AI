import AuditoriaService from '../../services/AuditoriaService.js';

class AuditoriaController {
  async list(req, res) {
    try {
      const {
        entity,
        action,
        user_id: userId,
        from,
        to,
        page = 1,
        limit = 50,
      } = req.query;

      const result = await AuditoriaService.list({
        entity,
        action,
        userId,
        from,
        to,
        page,
        limit,
      });

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: 'Error al listar auditoría' });
    }
  }

  async getById(req, res) {
    try {
      const item = await AuditoriaService.getById(req.params.id);
      res.json(item);
    } catch (err) {
      if (err.message === 'not_found') {
        return res.status(404).json({ mensaje: 'Evento de auditoría no encontrado' });
      }
      console.error(err);
      res.status(500).json({ mensaje: 'Error al obtener auditoría' });
    }
  }
}

export default new AuditoriaController();
