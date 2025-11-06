// Reports Manager - Generación de reportes PDF, CSV, Excel
class ReportsManager {
    constructor() {
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadReportTemplates();
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

        // Configurar fechas por defecto (últimos 30 días)
        this.setDefaultDateRange();
    }

    setDefaultDateRange() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        document.getElementById('fechaInicio').value = thirtyDaysAgo.toISOString().split('T')[0];
        document.getElementById('fechaFin').value = today.toISOString().split('T')[0];
        
        this.updateFilters();
    }

    updateFilters() {
        this.currentFilters = {
            fechaInicio: document.getElementById('fechaInicio').value,
            fechaFin: document.getElementById('fechaFin').value,
            tipoReporte: document.getElementById('tipoReporte').value
        };
    }

    async generateReport(reportType, format) {
        try {
            this.showReportLoading(true, reportType, format);
            
            const reportData = await this.fetchReportData(reportType);
            const fileName = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}`;

            switch (format) {
                case 'pdf':
                    await this.generatePDF(reportType, reportData, fileName);
                    break;
                case 'csv':
                    this.generateCSV(reportType, reportData, fileName);
                    break;
                case 'excel':
                    this.generateExcel(reportType, reportData, fileName);
                    break;
                default:
                    throw new Error(`Formato no soportado: ${format}`);
            }

            this.showReportSuccess(reportType, format);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showReportError(reportType, format, error.message);
        } finally {
            this.showReportLoading(false);
        }
    }

    async fetchReportData(reportType) {
        // Simular datos de reporte - en producción vendrían de la API
        switch (reportType) {
            case 'reservas':
                return await this.fetchReservasReport();
            case 'financiero':
                return await this.fetchFinancieroReport();
            case 'usuarios':
                return await this.fetchUsuariosReport();
            default:
                throw new Error(`Tipo de reporte no válido: ${reportType}`);
        }
    }

    async fetchReservasReport() {
        // En producción, esto haría una llamada a la API con los filtros
        const reservas = await apiClient.request('/reservas/all').catch(() => []);
        
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

    async fetchFinancieroReport() {
        const reservas = await apiClient.request('/reservas/all').catch(() => []);
        const ingresosTotales = reservas.reduce((sum, r) => sum + (r.importe_total || 0), 0);
        
        return {
            titulo: 'Reporte Financiero',
            periodo: this.getPeriodoTexto(),
            datos: reservas,
            metricas: {
                ingresosTotales: ingresosTotales,
                reservasTotales: reservas.length,
                promedioPorReserva: reservas.length > 0 ? ingresosTotales / reservas.length : 0,
                reservasActivas: reservas.filter(r => r.activo).length
            },
            ingresosPorCategoria: {
                'Salones': ingresosTotales * 0.7,
                'Servicios': ingresosTotales * 0.25,
                'Extras': ingresosTotales * 0.05
            }
        };
    }

    async fetchUsuariosReport() {
        const usuarios = await apiClient.getUsuarios().catch(() => []);
        
        return {
            titulo: 'Reporte de Usuarios',
            periodo: this.getPeriodoTexto(),
            datos: usuarios,
            columnas: [
                { key: 'usuario_id', titulo: 'ID' },
                { key: 'nombre', titulo: 'Nombre' },
                { key: 'apellido', titulo: 'Apellido' },
                { key: 'nombre_usuario', titulo: 'Usuario' },
                { key: 'tipo_usuario', titulo: 'Tipo', formatter: this.formatTipoUsuario },
                { key: 'celular', titulo: 'Teléfono' }
            ],
            estadisticas: {
                totalUsuarios: usuarios.length,
                porTipo: this.agruparPorTipo(usuarios)
            }
        };
    }

    async generatePDF(reportType, reportData, fileName) {
        const { jsPDF } = window.jspdf;
        
        // Crear documento PDF
        const doc = new jsPDF();
        let yPosition = 20;

        // Encabezado
        doc.setFontSize(20);
        doc.setTextColor(0, 217, 255);
        doc.text(reportData.titulo, 20, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Período: ${reportData.periodo}`, 20, yPosition);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 20, yPosition + 5);

        yPosition += 20;

        if (reportType === 'reservas' || reportType === 'usuarios') {
            // Tabla de datos
            const headers = reportData.columnas.map(col => col.titulo);
            const rows = reportData.datos.map(item => 
                reportData.columnas.map(col => {
                    const value = item[col.key];
                    if (col.formatter) {
                        return col.formatter(value);
                    }
                    if (col.tipo === 'moneda') {
                        return this.formatCurrency(value);
                    }
                    return value || '';
                })
            );

            doc.autoTable({
                head: [headers],
                body: rows,
                startY: yPosition,
                theme: 'grid',
                headStyles: {
                    fillColor: [0, 217, 255],
                    textColor: 255
                },
                styles: {
                    fontSize: 8
                }
            });

            // Totales
            if (reportData.totales) {
                const finalY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Reservas: ${reportData.totales.totalReservas}`, 20, finalY);
                doc.text(`Total Ingresos: ${this.formatCurrency(reportData.totales.totalIngresos)}`, 20, finalY + 10);
            }
        } else if (reportType === 'financiero') {
            // Métricas financieras
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Ingresos Totales: ${this.formatCurrency(reportData.metricas.ingresosTotales)}`, 20, yPosition);
            doc.text(`Reservas Totales: ${reportData.metricas.reservasTotales}`, 20, yPosition + 10);
            doc.text(`Promedio por Reserva: ${this.formatCurrency(reportData.metricas.promedioPorReserva)}`, 20, yPosition + 20);
            doc.text(`Reservas Activas: ${reportData.metricas.reservasActivas}`, 20, yPosition + 30);
        }

        // Guardar PDF
        doc.save(`${fileName}.pdf`);
    }

    generateCSV(reportType, reportData, fileName) {
        let csvContent = '';
        
        if (reportType === 'reservas' || reportType === 'usuarios') {
            // Encabezados
            const headers = reportData.columnas.map(col => col.titulo);
            csvContent += headers.join(',') + '\n';

            // Datos
            reportData.datos.forEach(item => {
                const row = reportData.columnas.map(col => {
                    const value = item[col.key];
                    if (col.formatter) {
                        return `"${col.formatter(value)}"`;
                    }
                    if (col.tipo === 'moneda') {
                        return this.formatCurrency(value, false);
                    }
                    return `"${value || ''}"`;
                });
                csvContent += row.join(',') + '\n';
            });
        } else if (reportType === 'financiero') {
            csvContent = 'Métrica,Valor\n';
            Object.entries(reportData.metricas).forEach(([key, value]) => {
                const metrica = this.formatMetricaNombre(key);
                csvContent += `"${metrica}","${value}"\n`;
            });
        }

        this.downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
    }

    generateExcel(reportType, reportData, fileName) {
        // Para Excel simple, podemos generar CSV con extensión .xls
        // En producción, usar una librería como SheetJS para Excel real
        this.generateCSV(reportType, reportData, fileName.replace('.csv', '.xls'));
    }

    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Utilidades
    getPeriodoTexto() {
        const inicio = document.getElementById('fechaInicio').value;
        const fin = document.getElementById('fechaFin').value;
        
        if (inicio && fin) {
            return `${inicio} al ${fin}`;
        }
        return 'Todo el período';
    }

    formatCurrency(amount, withSymbol = true) {
        if (withSymbol) {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS'
            }).format(amount);
        }
        return new Intl.NumberFormat('es-AR').format(amount);
    }

    formatTipoUsuario(tipo) {
        const tipos = {
            1: 'Administrador',
            2: 'Empleado',
            3: 'Cliente'
        };
        return tipos[tipo] || 'Desconocido';
    }

    agruparPorTipo(usuarios) {
        return usuarios.reduce((acc, usuario) => {
            const tipo = this.formatTipoUsuario(usuario.tipo_usuario);
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
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
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Reporte Generado',
                message: `Reporte de ${reportType} en formato ${format.toUpperCase()} descargado correctamente`,
                type: 'success'
            });
        }
    }

    showReportError(reportType, format, error) {
        if (window.notificationsManager) {
            window.notificationsManager.addNotification({
                title: 'Error Generando Reporte',
                message: `Error al generar reporte de ${reportType} en formato ${format.toUpperCase()}: ${error}`,
                type: 'error'
            });
        }
    }

    loadReportTemplates() {
        // Cargar plantillas de reporte si es necesario
        console.log('Report templates loaded');
    }
}

// Inicializar Reports Manager
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});