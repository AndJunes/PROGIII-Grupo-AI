import { Auth } from '../auth.js';
import { API } from '../api.js';
import { Helpers } from '../utils/helpers.js';
import { SidebarManager } from '../modules/sidebar.js';
import { CRUDManager } from '../modules/crud/index.js';

class EmpleadoDashboard {
  constructor() {
    this.auth = new Auth();
    this.api = new API();
    this.crud = null; // Lazy init para CRUD (salones/servicios/turnos)
    this.init();
  }

  // ===== Reportes =====
  async loadReportes() {
    try {
      const data = await this.api.getAllReservas({ pagina: 1, limite: 1000 });
      const reservas = Array.isArray(data) ? data : (Array.isArray(data?.reservas) ? data.reservas : []);
      const todayStr = new Date().toISOString().slice(0, 10);

      // Agenda diaria (hoy)
      const agenda = reservas.filter(r => String(r.fecha_reserva || '').slice(0,10) === todayStr);
      this.renderAgenda(agenda);

      // Próximas reservas (siguientes 10)
      const now = new Date();
      const proximas = reservas
        .filter(r => new Date(r.fecha_reserva) >= new Date(todayStr))
        .sort((a,b) => new Date(a.fecha_reserva) - new Date(b.fecha_reserva))
        .slice(0, 10);
      this.renderProximas(proximas);

      // Ocupación por salón (hoy y semana)
      const semanaIni = new Date();
      semanaIni.setHours(0,0,0,0);
      const dow = semanaIni.getDay(); // 0=Dom
      const diffToMon = (dow + 6) % 7; // días desde Lunes
      semanaIni.setDate(semanaIni.getDate() - diffToMon);
      const semanaFin = new Date(semanaIni);
      semanaFin.setDate(semanaIni.getDate() + 6);

      const enRango = (d) => {
        const x = new Date(String(d).slice(0,10));
        return x >= new Date(semanaIni.toISOString().slice(0,10)) && x <= new Date(semanaFin.toISOString().slice(0,10));
      };

      const porSalonHoy = this.groupCountBy(reservas.filter(r => String(r.fecha_reserva || '').slice(0,10) === todayStr), (r) => r.salon || r.salon_id);
      const porSalonSemana = this.groupCountBy(reservas.filter(r => enRango(r.fecha_reserva)), (r) => r.salon || r.salon_id);
      this.renderOcupacion({ hoy: porSalonHoy, semana: porSalonSemana });

      // Uso de servicios (conteo simple)
      const uso = {};
      reservas.forEach(r => {
        const list = Array.isArray(r.servicios) ? r.servicios : [];
        list.forEach(s => {
          const key = s.descripcion || s.servicio || s.servicio_id;
          uso[key] = (uso[key] || 0) + 1;
        });
      });
      this.renderUsoServicios(uso);

      // Guardar en estado para CSV
      this._reportData = { agenda, proximas, porSalonHoy, porSalonSemana, uso };
      this.bindReportButtons();
    } catch (e) {
      console.error('Error cargando reportes:', e);
      const setErr = (id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p class="error">Error cargando reporte</p>`;
      };
      ['reporte-agenda','reporte-proximas','reporte-ocupacion','reporte-servicios'].forEach(setErr);
    }
  }

  groupCountBy(list, keyFn) {
    const map = {};
    list.forEach(item => {
      const key = keyFn(item) ?? 'N/A';
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }

  renderAgenda(items) {
    const el = document.getElementById('reporte-agenda');
    if (!el) return;
    if (!items.length) { el.innerHTML = '<p>Sin reservas hoy</p>'; return; }
    el.innerHTML = `<ul>${items.map(r => `<li>#${r.reserva_id} - ${r.salon || r.salon_id} - ${String(r.hora_desde||'').slice(0,5)}-${String(r.hora_hasta||'').slice(0,5)} - ${r.nombre||''}</li>`).join('')}</ul>`;
  }

  renderProximas(items) {
    const el = document.getElementById('reporte-proximas');
    if (!el) return;
    if (!items.length) { el.innerHTML = '<p>Sin próximas reservas</p>'; return; }
    el.innerHTML = `<ul>${items.map(r => `<li>${String(r.fecha_reserva).slice(0,10)} - #${r.reserva_id} - ${r.salon || r.salon_id}</li>`).join('')}</ul>`;
  }

  renderOcupacion(data) {
    const el = document.getElementById('reporte-ocupacion');
    if (!el) return;
    const toList = (obj) => Object.entries(obj).map(([k,v]) => `<li>${Helpers.escapeHtml?Helpers.escapeHtml(String(k)):k}: ${v}</li>`).join('');
    el.innerHTML = `
      <div class="grid-2">
        <div><strong>Hoy</strong><ul>${toList(data.hoy)}</ul></div>
        <div><strong>Semana</strong><ul>${toList(data.semana)}</ul></div>
      </div>
    `;
  }

  renderUsoServicios(uso) {
    const el = document.getElementById('reporte-servicios');
    if (!el) return;
    const entries = Object.entries(uso);
    if (!entries.length) { el.innerHTML = '<p>Sin servicios utilizados</p>'; return; }
    el.innerHTML = `<ul>${entries.map(([k,v]) => `<li>${Helpers.escapeHtml?Helpers.escapeHtml(String(k)):k}: ${v}</li>`).join('')}</ul>`;
  }

  bindReportButtons() {
    const byId = (id) => document.getElementById(id);
    byId('csv-agenda')?.addEventListener('click', () => this.exportCSV('agenda', this._reportData?.agenda || []));
    byId('csv-proximas')?.addEventListener('click', () => this.exportCSV('proximas', this._reportData?.proximas || []));
    byId('csv-ocupacion')?.addEventListener('click', () => this.exportCSVObject('ocupacion', { hoy: this._reportData?.porSalonHoy || {}, semana: this._reportData?.porSalonSemana || {} }));
    byId('csv-servicios')?.addEventListener('click', () => this.exportCSVObject('uso_servicios', this._reportData?.uso || {}));
  }

  exportCSV(name, rows) {
    if (!Array.isArray(rows)) rows = [];
    if (!rows.length) { Helpers.showToast && Helpers.showToast('Sin datos para exportar', 'info'); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    this.downloadCSV(`${name}.csv`, csv);
  }

  exportCSVObject(name, obj) {
    const rows = [];
    const flatten = (prefix, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([k,v]) => flatten(`${prefix}${prefix?'.':''}${k}`, v));
      } else {
        rows.push({ key: prefix, value });
      }
    };
    flatten('', obj);
    const csv = ['key,value'].concat(rows.map(r => `${JSON.stringify(r.key)},${JSON.stringify(r.value)}`)).join('\n');
    this.downloadCSV(`${name}.csv`, csv);
  }

  downloadCSV(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Helpers.showToast && Helpers.showToast('CSV generado', 'success');
  }
  async init() {
    try {
      // Asegurar rol empleado
      const user = this.auth.userData || {};
      if (parseInt(user.tipo_usuario) !== 2) {
        this.auth.redirectToDashboard(user.tipo_usuario || 1);
        return;
      }

      // Inicializar sidebar (layout como admin)
      this.sidebar = new SidebarManager();

      // Cargar UI inicial
      await Promise.all([
        this.loadClientes(),
        this.loadReservas()
      ]);

      await this.loadReportes();
      this.bindEvents();

      // Establecer sección por defecto en sidebar (mostrar Reportes)
      this.sidebar?.setActiveSection?.('reportes');
    } catch (e) {
      console.error('Error inicializando dashboard empleado:', e);
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ver-reserva]');
      if (btn) {
        const data = btn._reservaData;
        if (data) this.openReservaModal(data);
      }
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.auth.logOut();
    });

    // Recargar datos al cambiar de sección desde el sidebar
    document.addEventListener('sectionChanged', async (e) => {
      const section = e?.detail?.section;
      try {
        switch (section) {
          case 'reservas':
            await this.loadReservas();
            break;
          case 'clientes':
            await this.loadClientes();
            break;
          case 'reportes':
            await this.loadReportes();
            break;
          case 'salones':
            if (!this.crud) this.crud = new CRUDManager();
            await this.crud.loadSalones();
            break;
          case 'servicios':
            if (!this.crud) this.crud = new CRUDManager();
            await this.crud.loadServicios();
            break;
          case 'turnos':
            if (!this.crud) this.crud = new CRUDManager();
            await this.crud.loadTurnos();
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error actualizando sección', section, err);
      }
    });
  }

  async loadClientes() {
    const cont = document.getElementById('clientes-list');
    if (!cont) return;
    cont.innerHTML = '<p>Cargando clientes...</p>';
    try {
      const resp = await this.api.getClientes();
      const clientes = Array.isArray(resp?.usuarios) ? resp.usuarios : (Array.isArray(resp) ? resp : []);
      if (!clientes.length) {
        cont.innerHTML = '<p>No hay clientes registrados</p>';
        return;
      }
      // Render como tabla estilo admin
      const table = document.createElement('table');
      table.className = 'data-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');
      clientes.forEach(c => {
        const tr = document.createElement('tr');
        const nombre = Helpers.escapeHtml ? Helpers.escapeHtml(`${c.nombre || ''} ${c.apellido || ''}`.trim()) : `${c.nombre || ''} ${c.apellido || ''}`;
        tr.innerHTML = `
          <td>${c.usuario_id ?? ''}</td>
          <td>${nombre}</td>
          <td>${c.nombre_usuario || ''}</td>
          <td>${c.celular || ''}</td>
        `;
        tbody.appendChild(tr);
      });
      cont.innerHTML = '';
      cont.appendChild(table);
    } catch (e) {
      console.error('Error cargando clientes:', e);
      cont.innerHTML = `<p class="error">Error cargando clientes: ${e.message || e}</p>`;
    }
  }

  async loadReservas() {
    const cont = document.getElementById('reservas-list');
    if (!cont) return;
    cont.innerHTML = '<p>Cargando reservas...</p>';
    try {
      const resp = await this.api.getReservas({ pagina: 1, limite: 1000 });
      const reservas = Array.isArray(resp) ? resp : (Array.isArray(resp?.reservas) ? resp.reservas : []);
      if (!reservas.length) {
        cont.innerHTML = '<p>No hay reservas registradas</p>';
        return;
      }
      // Render tabla estilo admin
      const table = document.createElement('table');
      table.className = 'data-table';
      table.innerHTML = `
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Salón</th>
            <th>Turno</th>
            <th>Cliente</th>
            <th>Temática</th>
            <th>Importe Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');
      reservas.forEach(r => {
        const fecha = Helpers.formatDate ? Helpers.formatDate(r.fecha_reserva) : (r.fecha_reserva || '');
        const horario = (r.hora_desde && r.hora_hasta) ? `${String(r.hora_desde).slice(0,5)} - ${String(r.hora_hasta).slice(0,5)}` : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.reserva_id}</td>
          <td>${fecha}</td>
          <td>${r.salon || r.salon_id || ''}</td>
          <td>${horario}</td>
          <td>${r.nombre || ''}</td>
          <td>${r.tematica || ''}</td>
          <td>${r.importe_total != null ? r.importe_total : ''}</td>
          <td><button class="btn btn-outline" data-ver-reserva>Ver</button></td>
        `;
        const btn = tr.querySelector('[data-ver-reserva]');
        if (btn) btn._reservaData = r;
        tbody.appendChild(tr);
      });
      cont.innerHTML = '';
      cont.appendChild(table);
    } catch (e) {
      console.error('Error cargando reservas:', e);
      cont.innerHTML = `<p class="error">Error cargando reservas: ${e.message || e}</p>`;
    }
  }

  openReservaModal(reserva) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;
    const pretty = (obj) => JSON.stringify(obj, null, 2);
    const safe = (s) => (Helpers.escapeHtml ? Helpers.escapeHtml(s) : s);

    const detalle = {
      id: reserva.reserva_id,
      fecha: reserva.fecha_reserva,
      salon: reserva.salon || reserva.salon_id,
      turno: {
        desde: reserva.hora_desde,
        hasta: reserva.hora_hasta
      },
      cliente: {
        nombre: reserva.nombre,
        telefono: reserva.telefono
      },
      importe_total: reserva.importe_total,
      servicios: reserva.servicios || []
    };

    const html = `
      <div class="modal-overlay active" id="reservaDetalleModal">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>Detalle de Reserva</h3>
            <button class="modal-close" onclick="(document.getElementById('modalContainer').innerHTML='')">&times;</button>
          </div>
          <div class="modal-body">
            <pre style="max-height:60vh; overflow:auto; background:#0b1020; color:#eaeefb; padding:12px; border-radius:8px;">${safe(pretty(detalle))}</pre>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="copyReservaJSON">Copiar JSON</button>
            <button class="btn btn-outline" onclick="(document.getElementById('modalContainer').innerHTML='')">Cerrar</button>
          </div>
        </div>
      </div>`;

    modalContainer.innerHTML = html;
    const copyBtn = document.getElementById('copyReservaJSON');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pretty(detalle));
          if (Helpers.showToast) Helpers.showToast('JSON copiado al portapapeles', 'success');
        } catch (e) {
          console.error('No se pudo copiar JSON', e);
          if (Helpers.showToast) Helpers.showToast('No se pudo copiar el JSON', 'error');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Iniciar dashboard empleado
  new EmpleadoDashboard();
});
