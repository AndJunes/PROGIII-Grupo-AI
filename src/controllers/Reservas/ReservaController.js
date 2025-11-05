import ReservaService from "../../services/ReservaService.js";
import InformeService from '../../services/InformeService.js';
import fs from 'fs';

class ReservaController {
    // POST -> crea una reserva (cliente)
    static async crear(req, res) {
    try {
        const nuevaReserva = await ReservaService.crear(req.body, req.usuario.usuario_id);
        res.status(201).json({
            mensaje: 'Reserva creada correctamente',
            reserva: nuevaReserva
        });
    } catch (error) {
        console.error('error al crear reserva:', error);
        res.status(500).json({ mensaje: 'error al crear reserva', error });
    }
}


    // GET -> listar reservas del usuario logueado
static async listar(req, res) {
    try {
        const { tipo_usuario, usuario_id } = req.usuario;

        // Convertimos a number por seguridad
        const usuarioIdNum = Number(usuario_id);
        
        let reservas;

        if (tipo_usuario === 3) {
            // CLIENTE → siempre solo sus reservas
            reservas = await ReservaService.listar(usuarioIdNum);
        } else {
            // EMPLEADO / ADMIN → por defecto solo sus reservas
            reservas = await ReservaService.listar(usuarioIdNum);
        }

        if (!reservas || reservas.length === 0) {
            return res.json({ mensaje: "No hay reservas disponibles para este usuario" });
        }

        res.json(reservas);
    } catch (error) {
        console.error('Error al listar reservas:', error);
        res.status(500).json({ mensaje: 'Error al listar reservas', error });
    }
}


    // GET -> obtener una reserva específica por ID
    static async obtenerPorId(req, res) {
        try {
            const reserva = await ReservaService.obtenerPorId(req.params.id);
            res.json(reserva);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: "reserva no encontrada"});
            }
            console.error('error al obtener reserva:', error);
            res.status(500).json({ mensaje: 'error al obtener reserva', error });
        }
    }

    // PUT -> actualizar reservas (solo admin)
    static async actualizar(req, res) {
        try {
            const reserva = await ReservaService.actualizar(req.params.id, req.body);
            res.json({ mensaje: 'reserva actualizada correctamente', reserva });
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: 'reserva no encontrada'});
            }
            console.error('error al actualizar reservas:', error);
            res.status(500).json({ mensaje: 'error al actualizar reserva', error });
        }
    }

    // DELETE -> eliminar reserva (soft delete, solo admin)
    static async eliminar(req, res) {
        try {
            const resultado = await ReservaService.eliminar(req.params.id);
            res.json(resultado);
        } catch (error) {
            if (error.message === "not_found") {
                return res.status(404).json({ mensaje: 'reserva no encontrada o ya eliminada'});
            }
            console.error('error al eliminar reservas:', error);
            res.status(500).json({ mensaje: 'error al eliminar reservas', error });
        }
    }

    // GET -> listar todas las reservas (solo admin o empleado)
    static async listarTodas(req, res) {
        try {
            const reservas = await ReservaService.listarTodas();
            res.json(reservas);
        } catch (error) {
            console.error('error al listar todas las reservas:', error);
            res.status(500).json({ mensaje: 'error al listar todas las reservas', error });
        }
    }

    static async informe(req, res) {
        try {
            // Lee el formato de la URL
            const formato = req.query.formato;
            const { buffer, path, headers } = await ReservaService.generarInforme(formato);
            res.set(headers);
            //formato pdf
            if (formato === 'pdf') {
                res.setHeader('Content-Disposition', 'attachment; filename="reporte_reservas.pdf"');
                res.status(200).send(buffer);
            //formato csv
            } else if (formato === 'csv') {
                res.status(200).download(path, (err) => {
                    if (err) {
                        console.error('Error al enviar el archivo CSV:', err);
                        res.status(500).json({
                            mensaje: "No se pudo descargar el informe."
                        });
                    }
                    try {
                        fs.unlinkSync(path);
                    } catch (unlinkErr) {
                        console.error("Error al borrar el archivo temporal CSV:", unlinkErr);
                    }
                });
            }

        } catch (error) {
            console.error('Error en ReservaController.informe:', error);
            res.status(500).json({ mensaje: 'Error interno al generar el informe', error });
        }
    }

    static async estadisticaSalones(req, res) {
        try {
            const formato = req.query.formato;
            // sacamos los datos del procedure
            const datos = await ReservaService.generarReporteEstadisticoSalones();
            if (!datos || datos.length === 0) {
                return res.status(404).json({ mensaje: "No hay datos para el informe de salones" });
            }
            if (formato === 'csv') { // Ahora es 'if' en lugar de 'else if'
                const csvPath = await InformeService.informeEstadisticoSalonesCsv(datos);
                res.status(200).download(csvPath, "reporte_salones.csv", (err) => {
                    if (err) {
                        console.error('Error al enviar el CSV de salones:', err);
                    }
                    // se borra el archivo temporal
                    try {
                        fs.unlinkSync(csvPath);
                    } catch (unlinkErr) {
                        console.error("Error al borrar el CSV temporal:", unlinkErr);
                    }
                });
            
            } else {
                // si no pide formate, se devuelve el JSON
                res.json(datos);
            }
            // --- FIN DEL CAMBIO ---

        } catch (error) {
            console.error('Error en ReservaController.estadisticaSalones:', error);
            res.status(500).json({ mensaje: 'Error interno al generar la estadística', error: error.message });
        }
    }

    // GET -> Devuelve la estadística de Servicios (JSON o CSV)
    static async estadisticaServicios(req, res) {
        try {
            const formato = req.query.formato;
            const datos = await ReservaService.generarReporteEstadisticoServicios();
            
            if (!datos || datos.length === 0) {
                return res.json({ mensaje: "No hay datos para la estadística de servicios" });
            }
            // logica para csv
            if (formato === 'csv') {
                const csvPath = await InformeService.informeEstadisticoServiciosCsv(datos);
                res.status(200).download(csvPath, "reporte_servicios.csv", (err) => {
                    if (err) {
                        console.error('Error al enviar el CSV de servicios:', err);
                    }
                    // se borra el archivo temporal
                    try {
                        fs.unlinkSync(csvPath);
                    } catch (unlinkErr) {
                        console.error("Error al borrar el CSV temporal:", unlinkErr);
                    }
                });
            } else {
                // si no, devuelve json
                res.json(datos);
            }

        } catch (error) {
            console.error('Error en ReservaController.estadisticaServicios:', error);
            res.status(500).json({ mensaje: 'Error interno al generar la estadística', error: error.message });
        }
    }

    // GET -> Devuelve la estadística de Turnos (JSON o CSV)
    static async estadisticaTurnos(req, res) {
        try {
            const formato = req.query.formato;
            const datos = await ReservaService.generarReporteEstadisticoTurnos();
            
            if (!datos || datos.length === 0) {
                return res.json({ mensaje: "No hay datos para la estadística de turnos" });
            }

            // logica para csv
            if (formato === 'csv') {
                const csvPath = await InformeService.informeEstadisticoTurnosCsv(datos);
                res.status(200).download(csvPath, "reporte_turnos.csv", (err) => {
                    if (err) {
                        console.error('Error al enviar el CSV de turnos:', err);
                    }
                    // se borra el archivo temporal
                    try {
                        fs.unlinkSync(csvPath);
                    } catch (unlinkErr) {
                        console.error("Error al borrar el CSV temporal:", unlinkErr);
                    }
                });
            } else {
                // si no, devuelve json
                res.json(datos);
            }

        } catch (error) {
            console.error('Error en ReservaController.estadisticaTurnos:', error);
            res.status(500).json({ mensaje: 'Error interno al generar la estadística', error: error.message });
        }
    }
}

export default ReservaController;
