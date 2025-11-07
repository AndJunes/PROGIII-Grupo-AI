import AuditoriaDAO from '../database/AuditoriaDAO.js';

class AuditoriaService {
  async insert(entry) {
    return AuditoriaDAO.insert(entry);
  }

  async getById(id) {
    const item = await AuditoriaDAO.getById(id);
    if (!item) throw new Error('not_found');
    return item;
  }

  async list({ entity, action, userId, from, to, page = 1, limit = 50 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (p - 1) * l;

    const { items, total } = await AuditoriaDAO.list({
      entity,
      action,
      userId,
      from,
      to,
      limit: l,
      offset,
    });

    return { items, page: p, limit: l, total };
  }
}

export default new AuditoriaService();
