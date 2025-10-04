import Reserva from '../../models/Reserva.js';
import Salon from '../../models/Salon.js';
import Servicio from '../../models/Servicio.js';
import Usuario from '../../models/Usuario.js';
import { enviarNotificacion } from '../../notificacion/mailer.js';

// Relaciones Sequelize
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });
Reserva.belongsTo(Servicio, { foreignKey: 'turno_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

class ReservaController {
    // POST -> crea una reserva (cliente)
    static async crear(req, res) {
        try {
            const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total } = req.body;

            const nuevaReserva = await Reserva.create({
                fecha_reserva,
                salon_id,
                turno_id,
                usuario_id: req.usuario.usuario_id,
                foto_cumpleaniero,
                tematica,
                importe_salon,
                importe_total,
                activo: 1
            });

            await enviarNotificacion(nuevaReserva, req.usuario);

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
            const reservas = await Reserva.findAll({
                where: { usuario_id: req.usuario.usuario_id },
                include: [
                    { model: Salon },
                    { model: Servicio }
                ]
            });

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
            const { id } = req.params;

            const reserva = await Reserva.findByPk(id, {
                include: [
                    { model: Salon },
                    { model: Servicio },
                    { model: Usuario, attributes: ['usuario_id', 'nombre', 'nombre_usuario'] }
                ]
            });

            if (!reserva || reserva.activo === 0) {
                return res.status(404).json({ mensaje: 'reserva no encontrada' });
            }

            res.json(reserva);
        } catch (error) {
            console.error('error al obtener reserva:', error);
            res.status(500).json({ mensaje: 'error al obtener reserva', error });
        }
    }

    // PUT -> actualizar reservas (solo admin)
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { fecha_reserva, salon_id, turno_id, tematica, importe_total } = req.body;

            const reserva = await Reserva.findByPk(id);

            if (!reserva || reserva.activo === 0) {
                return res.status(404).json({ mensaje: 'reserva no encontrada' });
            }

            await reserva.update({ fecha_reserva, salon_id, turno_id, tematica, importe_total });

            res.json({ mensaje: 'reserva actualizada correctamente', reserva });
        } catch (error) {
            console.error('error al actualizar reservas:', error);
            res.status(500).json({ mensaje: 'error al actualizar reserva', error });
        }
    }

    // DELETE -> eliminar reserva (soft delete, solo admin)
    static async eliminar(req, res) {
        try {
            const { id } = req.params;

            const reserva = await Reserva.findByPk(id);
            if (!reserva || reserva.activo === 0) {
                return res.status(404).json({ mensaje: 'reserva no encontrada o ya eliminada' });
            }

            await reserva.update({ activo: 0 });

            res.json({ mensaje: 'reserva eliminada correctamente (soft delete)' });
        } catch (error) {
            console.error('error al eliminar reservas:', error);
            res.status(500).json({ mensaje: 'error al eliminar reservas', error });
        }
    }

    // GET -> listar todas las reservas (solo admin o empleado)
    static async listarTodas(req, res) {
        try {
            const reservas = await Reserva.findAll({
                where: { activo: 1 },
                include: [
                    { model: Salon },
                    { model: Servicio },
                    { model: Usuario, attributes: ['usuario_id', 'nombre', 'nombre_usuario'] }
                ]
            });

            res.json(reservas);
        } catch (error) {
            console.error('error al listar todas las reservas:', error);
            res.status(500).json({ mensaje: 'error al listar todas las reservas', error });
        }
    }
}

export default ReservaController;
