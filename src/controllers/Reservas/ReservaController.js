import ReservaService from "../../services/ReservaService.js";
import fs from 'fs';

const formatosPermitidos = ['pdf', 'csv'];

class ReservaController {
    // POST -> crea una reserva (cliente)
    static async crear(req, res) {
        try {
            const nuevaReserva = await ReservaService.crear(req.body, req.usuario);
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

            if (!formato || !formatosPermitidos.includes(formato)) {
                return res.status(400).json({
                    mensaje: "Formato inválido. Debe ser 'pdf' o 'csv'."
                });
            }

            const { buffer, path, headers } = await ReservaService.generarInforme(formato);
            
            res.set(headers);
            //formato pdf
            if (formato === 'pdf') {
                res.status(200).end(buffer);
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
}

export default ReservaController;
