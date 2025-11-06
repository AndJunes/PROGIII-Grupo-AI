import ReservaDAO from "../database/ReservasDAO.js";
import NotificacionesService from './NotificacionesService.js';
import InformeService from "./InformeService.js";

const notificacionesService = new NotificacionesService();

class ReservaService {

    async crear(data, usuarioId) {
        const nuevaReservaId = await ReservaDAO.crearReserva(data, usuarioId);
        await ReservaDAO.asociarServicios(nuevaReservaId, data.servicios);
        const nuevaReserva = await ReservaDAO.obtenerPorId(nuevaReservaId);
        const usuario = await ReservaDAO.obtenerUsuarioPorId(usuarioId);
        //notificaciones
        notificacionesService.enviarNotificacion(nuevaReserva, usuario);
        return nuevaReserva;
    }


    async listar(usuarioId, opciones = {}, includeInactive = false) {
        return ReservaDAO.listarPorUsuario(usuarioId, opciones, includeInactive);
    }

    async obtenerPorId(id, includeInactive = false) {
        const reserva = await ReservaDAO.obtenerPorId(id, includeInactive);
        if (!reserva) throw new Error("not_found");
        return reserva;
    }

    async actualizar(id, data) {
        const existente = await ReservaDAO.obtenerPorId(id, true);
        if (!existente) throw new Error("not_found");
        await ReservaDAO.actualizarReserva(id, data);
        return this.obtenerPorId(id, true);
    }

    async eliminar(id) {
        const existente = await ReservaDAO.obtenerPorId(id, true);
        if (!existente) throw new Error("not_found");
        await ReservaDAO.eliminarReserva(id);
        return { mensaje: "Reserva eliminada correctamente (soft delete)" };
    }

    async listarTodas(opciones = {}, includeInactive = false) {
        return ReservaDAO.listarTodas(opciones, includeInactive);
    }

    async generarReporteDetalle() {
        return ReservaDAO.generarReporte('CALL reporte_detalle_reservas();');
    }

    async generarReporteEstadisticoSalones() {
        return ReservaDAO.generarReporte('CALL reporte_estadistico_salones();');
    }

    async generarReporteEstadisticoServicios() {
        return ReservaDAO.generarReporte('CALL reporte_estadistico_servicios();');
    }

    async generarReporteEstadisticoTurnos() {
        return ReservaDAO.generarReporte('CALL reporte_estadistico_turnos();');
    }

    async generarInforme(formato) {
        const datos = await this.generarReporteDetalle();
        if (!datos || datos.length === 0) throw new Error("No hay datos para generar el informe");

        if (formato === 'pdf') {
            const pdfBuffer = await InformeService.informeReservasPdf(datos);
            return { buffer: pdfBuffer, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="reporte_reservas.pdf"' } };
        } else if (formato === 'csv') {
            const csvPath = await InformeService.informeReservasCsv(datos);
            return { path: csvPath, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="reporte_reservas.csv"' } };
        }
    }
}

export default new ReservaService();
