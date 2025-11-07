import { API } from '../api.js';
import { Helpers } from '../utils/helpers.js';

export default class AuditoriaManager {
  constructor() {
    this.api = new API();
    this.tableBody = document.getElementById('auditoriaTableBody');
    this.filters = {
      entity: document.getElementById('auditFilterEntity'),
      action: document.getElementById('auditFilterAction'),
      userId: document.getElementById('auditFilterUser'),
      from: document.getElementById('auditFilterFrom'),
      to: document.getElementById('auditFilterTo'),
    };
    this.pagination = {
      page: 1,
      limit: 20,
    };

    this.bind();
    // Carga inicial si ya estamos en la sección Auditoría
    const section = document.getElementById('auditoria-section');
    if (section && section.classList.contains('active')) {
      console.log('[Auditoria] Sección activa al iniciar, cargando...');
      this.reload();
    } else {
      console.log('[Auditoria] Inicializada, esperando cambio de sección...');
    }
  }

  bind() {
    const btn = document.getElementById('auditSearchBtn');
    if (btn) btn.addEventListener('click', () => this.reload());

    // open modal delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-audit]');
      if (!btn) return;
      const idx = btn.getAttribute('data-index');
      const item = this._items?.[idx];
      if (item) this.openChangesModal(item);
    });
  }

  async reload(page = 1) {
    this.pagination.page = page;
    this.showLoading();
    try {
      console.log('[Auditoria] Reload ejecutado');
      const params = {
        entity: this.filters.entity?.value || undefined,
        action: this.filters.action?.value || undefined,
        user_id: this.filters.userId?.value || undefined,
        from: this.filters.from?.value || undefined,
        to: this.filters.to?.value || undefined,
        page: this.pagination.page,
        limit: this.pagination.limit,
      };
      console.log('[Auditoria] Filtros:', params);
      const res = await this.api.getAuditoria(params);
      console.log('[Auditoria] Respuesta:', res);
      this._items = res.items || [];
      this.render(this._items);
      this.renderPagination(res.page, res.limit, res.total);
    } catch (err) {
      this.showError('Error cargando auditoría');
      console.error(err);
    }
  }

  showLoading() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando...</td></tr>';
  }
  showError(msg) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${msg}</td></tr>`;
  }

  formatIp(ip) {
    if (ip === '::1') return 'localhost';
    return ip || '';
  }

  render(items) {
    if (!this.tableBody) return;
    if (!items || items.length === 0) {
      this.tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Sin resultados</td></tr>';
      return;
    }

    const rows = items.map((it, idx) => {
      const fecha = Helpers.formatDateTime ? Helpers.formatDateTime(it.created_at) : new Date(it.created_at).toLocaleString();
      return `
        <tr>
          <td>${fecha}</td>
          <td>${it.user || it.username || ''}</td>
          <td>${it.tipo_usuario ?? ''}</td>
          <td>${it.entity}</td>
          <td>${it.entity_id}</td>
          <td>${it.action}</td>
          <td>${this.formatIp(it.ip)}</td>
          <td><button class="btn btn-sm btn-outline-primary" data-open-audit data-index="${idx}">Ver</button></td>
        </tr>
      `;
    }).join('');

    this.tableBody.innerHTML = rows;
  }

  renderPagination(page, limit, total) {
    const cont = document.getElementById('auditPagination');
    if (!cont) return;
    const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
    cont.innerHTML = '';
    const prev = document.createElement('button');
    prev.textContent = 'Anterior';
    prev.disabled = page <= 1;
    prev.className = 'btn btn-sm btn-secondary me-2';
    prev.onclick = () => this.reload(page - 1);

    const next = document.createElement('button');
    next.textContent = 'Siguiente';
    next.disabled = page >= totalPages;
    next.className = 'btn btn-sm btn-secondary';
    next.onclick = () => this.reload(page + 1);

    const info = document.createElement('span');
    info.textContent = ` Página ${page} de ${totalPages} `;
    info.className = 'me-2';

    cont.appendChild(prev);
    cont.appendChild(info);
    cont.appendChild(next);
  }

  openChangesModal(item) {
    const pretty = (obj) => JSON.stringify(obj, null, 2);
    const content = {
      id: item.id,
      fecha: item.created_at,
      usuario: item.user || item.username,
      entity: item.entity,
      entity_id: item.entity_id,
      action: item.action,
      ip: this.formatIp(item.ip),
      before: item.changes?.before || null,
      after: item.changes?.after || null,
    };

    const modalHTML = `
      <div class="modal-overlay active" id="auditModal">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Detalle de Auditoría</h3>
            <button class="modal-close" onclick="(window.crudManager? crudManager.closeModal(): (document.getElementById('modalContainer').innerHTML=''))">&times;</button>
          </div>
          <div class="modal-body">
            <pre style="max-height:60vh; overflow:auto; background:#0b1020; color:#eaeefb; padding:12px; border-radius:8px;">${Helpers.escapeHtml ? Helpers.escapeHtml(pretty(content)) : pretty(content)}</pre>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="auditCopyBtn">Copiar JSON</button>
            <button class="btn btn-outline" onclick="(window.crudManager? crudManager.closeModal(): (document.getElementById('modalContainer').innerHTML=''))">Cerrar</button>
          </div>
        </div>
      </div>`;

    const container = document.getElementById('modalContainer');
    if (container) {
      container.innerHTML = modalHTML;
    }

    // Bind copy to clipboard
    const copyBtn = document.getElementById('auditCopyBtn');
    if (copyBtn) {
      const raw = pretty(content);
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(raw);
          if (Helpers && typeof Helpers.showToast === 'function') {
            Helpers.showToast('JSON copiado al portapapeles', 'success');
          }
        } catch (e) {
          console.error('No se pudo copiar al portapapeles', e);
          if (Helpers && typeof Helpers.showToast === 'function') {
            Helpers.showToast('No se pudo copiar el JSON', 'error');
          }
        }
      });
    }
  }
}
