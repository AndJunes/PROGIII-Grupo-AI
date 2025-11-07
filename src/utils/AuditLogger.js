import AuditoriaService from '../services/AuditoriaService.js';

class AuditLogger {
  async log({ req, entity, entityId, action, changes }) {
    try {
      const user = req?.usuario || {};
      const fullName = [user.nombre, user.apellido].filter(Boolean).join(' ').trim();
      const displayUsername = fullName || user.username || user.nombre_usuario || user.email || user.nombre || null;
      const normalized = this._normalizeChanges(changes);
      const entry = {
        entity,
        entity_id: Number(entityId) || null,
        action,
        user_id: user.usuario_id || null,
        username: displayUsername,
        tipo_usuario: user.tipo_usuario || null,
        changes: normalized,
        ip: this._mapIp(req?.ip || (req?.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || null),
        user_agent: req?.headers?.['user-agent'] || null,
      };
      await AuditoriaService.insert(entry);
    } catch (err) {
      console.error('Audit log error:', err?.message || err);
    }
  }

  _isDecimalString(s) {
    return typeof s === 'string' && /^-?\d+\.\d+$/.test(s);
  }

  _normalizeValue(key, val) {
    if (val == null) return val;
    if (typeof val === 'string') {
      // keep ISO dates as string
      if (this._isDecimalString(val)) return Number(val);
      // *_id should be numeric if string digits
      if (/_id$/.test(key) && /^\d+$/.test(val)) return Number(val);
      return val;
    }
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) return val.map((v) => this._normalizeValue(key, v));
    if (typeof val === 'object') return this._normalizeObject(val);
    return val;
  }

  _normalizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = this._normalizeValue(k, v);
    }
    return out;
  }

  _normalizeChanges(changes) {
    if (!changes || typeof changes !== 'object') return changes || null;
    const out = {};
    if ('before' in changes) out.before = this._normalizeObject(changes.before);
    if ('after' in changes) out.after = this._normalizeObject(changes.after);
    return out;
  }

  _mapIp(ip) {
    if (!ip) return ip;
    if (ip === '::1') return '127.0.0.1';
    return ip;
  }
}

export default new AuditLogger();
