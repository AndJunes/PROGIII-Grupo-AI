import ReservaDAO from "../database/ReservasDAO.js";
import { enviarNotificacion } from "../notificacion/mailer.js";
import InformeService from "./InformeService.js";

class ReservaService {

    async crear(data, usuarioId) {
        const nuevaReservaId = await ReservaDAO.crearReserva(data, usuarioId);
        await ReservaDAO.asociarServicios(nuevaReservaId, data.servicios);
        const nuevaReserva = await ReservaDAO.obtenerPorId(nuevaReservaId);
        const usuario = await ReservaDAO.obtenerUsuarioPorId(usuarioId);
        await enviarNotificacion(nuevaReserva, usuario);
        return nuevaReserva;
    }


    async listar(usuarioId) {
        return ReservaDAO.listarPorUsuario(usuarioId);
    }

    async obtenerPorId(id) {
        const reserva = await ReservaDAO.obtenerPorId(id);
        if (!reserva) throw new Error("no se encontro");
        return reserva;
    }

    async actualizar(id, data) {
        const existente = await ReservaDAO.obtenerPorId(id);
        if (!existente) throw new Error("no se encontro");
        await ReservaDAO.actualizarReserva(id, data);
        return this.obtenerPorId(id);
    }

    async eliminar(id) {
        const existente = await ReservaDAO.obtenerPorId(id);
        if (!existente) throw new Error("no se encontro");
        await ReservaDAO.eliminarReserva(id);
        return { mensaje: "Reserva eliminada correctamente (soft delete)" };
    }

    async listarTodas() {
        return ReservaDAO.listarTodas();
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
