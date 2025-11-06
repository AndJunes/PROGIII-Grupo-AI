import { API } from '../api.js';
import { Helpers } from '../utils/helpers.js';

export class ReportsManager {
    constructor() {
        // Asumo que 'api.js' existe y maneja el fetch y los tokens
        this.api = new API();
        this.bindEvents();
        console.log("Reports Manager inicializado.");
    }

    /**
     * Escucha los clics en los botones que tengan 'data-report'
     */
    bindEvents() {
        document.addEventListener('click', (e) => {
            const reportBtn = e.target.closest('[data-report]');
            
            if (reportBtn) {
                e.preventDefault();
                const reportType = reportBtn.dataset.report; // ej: "reservas", "salones", "servicios", "turnos"
                const format = reportBtn.dataset.format;     // ej: "pdf", "csv"
                
                if (!reportType || !format) {
                    console.error('Botón de reporte mal configurado. Faltan data-report o data-format.');
                    return;
                }
                
                this.generateReport(reportBtn, reportType, format);
            }
        });
    }

    /**
     * Llama al endpoint correcto de la API y descarga el archivo.
     */
    async generateReport(button, reportType, format) {
        let endpoint = '';
        let fileName = '';
        const today = new Date().toISOString().split('T')[0];

        // 1. Armamos la URL correcta según el botón que se tocó
        switch (reportType) {
            case 'reservas':
                // Este es tu "Reporte de Reservas" (PDF o CSV)
                endpoint = `/api/reservas/informe?formato=${format}`;
                fileName = `reporte-reservas-${today}.${format}`;
                break;
            case 'salones':
                // Este es tu "Informe Estadístico" de Salones (solo CSV)
                endpoint = '/api/reservas/estadisticas/salones?formato=csv';
                fileName = `estadisticas-salones-${today}.csv`;
                break;
            case 'servicios':
                // Informe Estadístico de Servicios (solo CSV)
                endpoint = '/api/reservas/estadisticas/servicios?formato=csv';
                fileName = `estadisticas-servicios-${today}.csv`;
                break;
            case 'turnos':
                // Informe Estadístico de Turnos (solo CSV)
                endpoint = '/api/reservas/estadisticas/turnos?formato=csv';
                fileName = `estadisticas-turnos-${today}.csv`;
                break;
            default:
                Helpers.showToast(`Tipo de reporte '${reportType}' no reconocido.`, 'error');
                return;
        }

        // 2. Mostramos el 'Cargando...'
        this.showReportLoading(button, true);

        try {
            // 3. Llamamos a la API para que nos dé el archivo
            // (Asumo que tu api.js tiene un método 'getReport' que descarga archivos)
            const blob = await this.api.getReport(endpoint);

            // 4. Usamos la lógica de descarga del navegador
            this.downloadBlob(blob, fileName);
            Helpers.showToast('Reporte descargado', 'success');

        } catch (error) {
            console.error('Error al generar reporte:', error);
            Helpers.showToast(`Error: ${error.message || 'No se pudo generar el reporte'}`, 'error');
        } finally {
            // 5. Devolvemos el botón a la normalidad
            this.showReportLoading(button, false);
        }
    }

    /**
     * Crea un link temporal y simula un clic para descargar el archivo (Blob)
     */
    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Muestra/Oculta el estado de "cargando" en un botón
     * (Copiado de tu archivo original)
     */
    showReportLoading(button, show) {
        if (show) {
            button.disabled = true;
            const originalText = button.innerHTML;
            button.innerHTML = '<span class="spinner"></span> Generando...';
            button.setAttribute('data-original-text', originalText);
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
        }
    }
}