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
            let fileName;

            switch (reportType) {
                case 'reservas':
                    reportData = await this.generateReservasReport(format);
                    fileName = `reporte-reservas-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'financiero':
                    reportData = await this.generateFinancieroReport();
                    fileName = `reporte-financiero-${new Date().toISOString().split('T')[0]}`;
                    break;
                case 'usuarios':
                    reportData = await this.generateUsuariosReport();
                    fileName = `reporte-usuarios-${new Date().toISOString().split('T')[0]}`;
                    break;
                default:
                    throw new Error(`Tipo de reporte no soportado: ${reportType}`);
            }

            this.downloadReport(reportData, fileName, format);
            this.showReportSuccess(reportType, format);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showReportError(reportType, format, error.message);
        } finally {
            this.showReportLoading(false);
        }
    }

    async generateReservasReport(format) {
        if (format === 'pdf' || format === 'csv') {
            // Usar el endpoint del backend
            return await this.api.getReporteReservas(format);
        } else {
            // Generar localmente para otros formatos
            const reservas = await this.api.getAllReservas();
            return this.processReservasData(reservas);
        }
    }

    async generateFinancieroReport() {
        const [reservas, estadisticasSalones, estadisticasServicios] = await Promise.all([
            this.api.getAllReservas(),
            this.api.getEstadisticasSalones(),
            this.api.getEstadisticasServicios()
        ]);

        return {
            titulo: 'Reporte Financiero',
            periodo: this.getPeriodoTexto(),
            datos: reservas,
            metricas: this.calculateMetricasFinancieras(reservas),
            estadisticas: {
                salones: estadisticasSalones,
                servicios: estadisticasServicios
            }
        };
    }

    async generateUsuariosReport() {
        const usuarios = await this.api.getUsuarios();
        return {
            titulo: 'Reporte de Usuarios',
            periodo: this.getPeriodoTexto(),
            datos: usuarios,
            estadisticas: this.calculateEstadisticasUsuarios(usuarios)
        };
    }

    processReservasData(reservas) {
        return {
            titulo: 'Reporte de Reservas',
            periodo: this.getPeriodoTexto(),
            datos: reservas,
            columnas: [
                { key: 'id', titulo: 'ID' },
                { key: 'fecha_reserva', titulo: 'Fecha' },
                { key: 'salon_nombre', titulo: 'Salón' },
                { key: 'turno_nombre', titulo: 'Turno' },
                { key: 'tematica', titulo: 'Temática' },
                { key: 'importe_total', titulo: 'Importe Total', tipo: 'moneda' }
            ],
            totales: {
                totalReservas: reservas.length,
                totalIngresos: reservas.reduce((sum, r) => sum + (r.importe_total || 0), 0)
            }
        };
    }

    calculateMetricasFinancieras(reservas) {
        const ingresosTotales = reservas.reduce((sum, r) => sum + (r.importe_total || 0), 0);
        return {
            ingresosTotales: ingresosTotales,
            reservasTotales: reservas.length,
            promedioPorReserva: reservas.length > 0 ? ingresosTotales / reservas.length : 0,
            reservasActivas: reservas.filter(r => r.activo).length
        };
    }

    calculateEstadisticasUsuarios(usuarios) {
        const porTipo = usuarios.reduce((acc, usuario) => {
            const tipo = Helpers.getTipoUsuario(usuario.tipo_usuario);
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});

        return {
            totalUsuarios: usuarios.length,
            porTipo: porTipo
        };
    }

    downloadReport(reportData, fileName, format) {
        if (format === 'pdf' && reportData instanceof Blob) {
            this.downloadBlob(reportData, `${fileName}.pdf`, 'application/pdf');
        } else if (format === 'csv' && typeof reportData === 'string') {
            this.downloadBlob(new Blob([reportData], { type: 'text/csv' }), `${fileName}.csv`, 'text/csv');
        } else {
            // Generar reporte localmente
            const content = this.generateLocalReport(reportData, format);
            const mimeType = this.getMimeType(format);
            this.downloadBlob(new Blob([content], { type: mimeType }), `${fileName}.${format}`, mimeType);
        }
    }

    generateLocalReport(reportData, format) {
        switch (format) {
            case 'csv':
                return this.generateCSV(reportData);
            case 'pdf':
                return this.generatePDF(reportData);
            default:
                return JSON.stringify(reportData, null, 2);
        }
    }

    generateCSV(reportData) {
        let csvContent = '';
        
        if (reportData.columnas) {
            // Reporte tabular
            const headers = reportData.columnas.map(col => col.titulo);
            csvContent += headers.join(',') + '\n';

            reportData.datos.forEach(item => {
                const row = reportData.columnas.map(col => {
                    let value = item[col.key];
                    if (col.tipo === 'moneda') {
                        value = Helpers.formatCurrency(value, false);
                    }
                    return `"${value || ''}"`;
                });
                csvContent += row.join(',') + '\n';
            });
        } else if (reportData.metricas) {
            // Reporte de métricas
            csvContent = 'Métrica,Valor\n';
            Object.entries(reportData.metricas).forEach(([key, value]) => {
                const metrica = this.formatMetricaNombre(key);
                csvContent += `"${metrica}","${value}"\n`;
            });
        }

        return csvContent;
    }

    generatePDF(reportData) {
        // En una implementación real, usaríamos jsPDF
        // Por ahora devolvemos un string simple
        return `PDF Report: ${reportData.titulo}\nPeríodo: ${reportData.periodo}\n\nEste es un reporte PDF generado localmente.`;
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

    getMimeType(format) {
        const mimeTypes = {
            'pdf': 'application/pdf',
            'csv': 'text/csv',
            'excel': 'application/vnd.ms-excel',
            'json': 'application/json'
        };
        return mimeTypes[format] || 'text/plain';
    }

    getPeriodoTexto() {
        const { fechaInicio, fechaFin } = this.currentFilters;
        
        if (fechaInicio && fechaFin) {
            return `${fechaInicio} al ${fechaFin}`;
        }
        return 'Todo el período';
    }

    formatMetricaNombre(key) {
        const nombres = {
            ingresosTotales: 'Ingresos Totales',
            reservasTotales: 'Reservas Totales',
            promedioPorReserva: 'Promedio por Reserva',
            reservasActivas: 'Reservas Activas'
        };
        return nombres[key] || key;
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