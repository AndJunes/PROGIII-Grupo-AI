import { API } from '../api.js';
import { CONSTANTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class ReportsManager {
    constructor() {
        this.api = new API();
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultDateRange();
    }

    bindEvents() {
        // Botones de generación de reportes
        document.addEventListener('click', (e) => {
            const reportBtn = e.target.closest('[data-report]');
            if (reportBtn) {
                e.preventDefault();
                const reportType = reportBtn.dataset.report;
                const format = reportBtn.dataset.format;
                this.generateReport(reportType, format);
            }
        });

        // Filtros de reportes
        const filterInputs = ['fechaInicio', 'fechaFin', 'tipoReporte'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateFilters());
            }
        });
    }

    setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        
        if (fechaInicio && fechaFin) {
            fechaInicio.value = thirtyDaysAgo.toISOString().split('T')[0];
            fechaFin.value = today.toISOString().split('T')[0];
            this.updateFilters();
        }
    }

    updateFilters() {
        this.currentFilters = {
            fechaInicio: document.getElementById('fechaInicio')?.value || '',
            fechaFin: document.getElementById('fechaFin')?.value || '',
            tipoReporte: document.getElementById('tipoReporte')?.value || 'completo'
        };
    }

    async generateReport(reportType, format) {
        try {
            this.showReportLoading(true, reportType, format);
            
            let reportData;
            let fileName = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}`;

            // Filtros (por ahora no los usamos, pero los dejamos para el futuro)
            // const filters = this.currentFilters; 

            switch (reportType) {
                case 'reservas':
                    // Llama a la API de informe de reservas (PDF o CSV)
                    reportData = await this.api.getReporteReservas(format);
                    break;
                case 'salones':
                    // Llama a la API de estadísticas de salones (solo CSV)
                    reportData = await this.api.getEstadisticasSalones(format);
                    break;
                case 'servicios':
                    // Llama a la API de estadísticas de servicios (solo CSV)
                    reportData = await this.api.getEstadisticasServicios(format);
                    break;
                case 'turnos':
                    // Llama a la API de estadísticas de turnos (solo CSV)
                    reportData = await this.api.getEstadisticasTurnos(format);
                    break;
                default:
                    throw new Error(`Tipo de reporte no soportado: ${reportType}`);
            }

            // El backend ya nos da el archivo listo (Blob o texto CSV)
            this.downloadReport(reportData, fileName, format);
            this.showReportSuccess(reportType, format);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showReportError(reportType, format, error.message);
        } finally {
            this.showReportLoading(false, reportType, format);
        }
    }


    downloadReport(reportData, fileName, format) {
        if (format === 'pdf' && reportData instanceof Blob) {
            // Descarga directa de Blob para PDF
            this.downloadBlob(reportData, `${fileName}.pdf`, 'application/pdf');
        
        } else if (format === 'csv' && typeof reportData === 'string') {
            // Descarga de texto plano como CSV
            this.downloadBlob(new Blob([reportData], { type: 'text/csv' }), `${fileName}.csv`, 'text/csv');
        
        } else {
            console.error('Formato de reporte no esperado recibido del backend:', reportData);
            throw new Error('El backend devolvió un formato de archivo desconocido.');
        }
    }

    downloadBlob(blob, fileName, mimeType) {
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

    // Estados de UI
    showReportLoading(show, reportType = '', format = '') {
        const buttons = document.querySelectorAll(`[data-report="${reportType}"][data-format="${format}"]`);
        
        buttons.forEach(button => {
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
        });
    }

    showReportSuccess(reportType, format) {
        Helpers.showToast(`Reporte de ${reportType} en formato ${format.toUpperCase()} generado exitosamente`, 'success');
    }

    showReportError(reportType, format, error) {
        Helpers.showToast(`Error generando reporte de ${reportType}: ${error}`, 'error');
    }
}