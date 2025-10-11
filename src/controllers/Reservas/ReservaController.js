import Reserva from '../../models/Reserva.js';
import Salon from '../../models/Salon.js';
import Servicio from '../../models/Servicio.js';
import Usuario from '../../models/Usuario.js';

import ReservaService from "../../services/ReservaService.js";
import reservaService from "../../services/ReservaService.js";

// Relaciones Sequelize
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });
Reserva.belongsTo(Servicio, { foreignKey: 'turno_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

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

    // GET -> listar reservas del cliente autenticado
    static async listar(req, res) {
        try {
            const reservas = await ReservaService.listar(req.usuario.usuario_id);
            if (reservas.length === 0) {
                return res.json({ mensaje: "No tienes ninguna reserva" });
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
            const reserva = await reservaService.actualizar(req.params.id, req.body);
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
