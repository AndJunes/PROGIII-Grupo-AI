import pool from './database.js';

class AuditoriaDAO {
  async insert(entry) {
    const sql = `
      INSERT INTO auditoria
      (entity, entity_id, action, user_id, username, tipo_usuario, changes, ip, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?)
    `;
    const params = [
      entry.entity,
      entry.entity_id,
      entry.action,
      entry.user_id,
      entry.username,
      entry.tipo_usuario,
      entry.changes ? JSON.stringify(entry.changes) : null,
      entry.ip,
      entry.user_agent,
    ];
    const [result] = await pool.query(sql, params);
    return { id: result.insertId, ...entry, created_at: new Date() };
  }

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT id, entity, entity_id, action, user_id, username, tipo_usuario,
              changes,
              ip, user_agent, created_at
       FROM auditoria WHERE id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      changes: normalizeChanges(row.changes),
    };
  }

  async list({ entity, action, userId, from, to, limit = 50, offset = 0 }) {
    const where = [];
    const params = [];
    if (entity) { where.push('entity = ?'); params.push(entity); }
    if (action) { where.push('action = ?'); params.push(action); }
    if (userId) { where.push('user_id = ?'); params.push(userId); }
    if (from) { where.push('created_at >= ?'); params.push(from); }
    if (to) { where.push('created_at <= ?'); params.push(to); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT id, entity, entity_id, action, user_id, username, tipo_usuario,
              changes,
              ip, user_agent, created_at
       FROM auditoria
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const items = rows.map(r => ({
      ...r,
      changes: normalizeChanges(r.changes),
    }));

    // total exacto (puede ser costoso, pero la tabla será chica inicialmente)
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM auditoria ${whereSql}`,
      params
    );

    return { items, total: countRows[0]?.total || 0 };
  }
}

function normalizeChanges(val) {
  try {
    if (val == null) return null;
    if (Buffer.isBuffer(val)) {
      const s = val.toString('utf8');
      return s ? JSON.parse(s) : null;
    }
    if (typeof val === 'string') {
      return val ? JSON.parse(val) : null;
    }
    if (typeof val === 'object') {
      // MySQL JSON type may already be a JS object
      return val;
    }
    return null;
  } catch (_) {
    return null;
  }
}

export default new AuditoriaDAO();
