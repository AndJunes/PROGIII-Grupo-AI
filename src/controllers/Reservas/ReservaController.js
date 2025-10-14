import ReservaService from "../../services/ReservaService.js";

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

    // GET -> listar reservas
    static async listar(req, res) {
        try {
            const propios = req.query.propias === 'true';
            const usuarioId = propios ? req.usuario.usuario_id : null;

            let reservas;
            if (propios) {
                reservas = await ReservaService.listar(usuarioId);
            } else {
                reservas = await ReservaService.listarTodas();
            }

            if (reservas.length === 0) {
                return res.json({ mensaje: propios ? "No tienes ninguna reserva" : "No hay reservas disponibles" });
            }

            res.json(reservas);
        } catch (error) {
            console.error('error al listar reservas:', error);
            res.status(500).json({ mensaje: 'error al listar reservas', error });
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
}

export default ReservaController;
