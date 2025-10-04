const Reserva = require ('../../models/Reserva');
const Salon = require('../../models/Salon');
const Servicio = require('../../models/Servicio');
const Usuario = require('../../models/Usuario')
const { enviarNotificacion } = require('../../notificacion/mailer');


//Relacion Sequelize
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });
Reserva.belongsTo(Servicio, { foreignKey: 'turno_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

class ReservaController {
    //POST -> crea una reserva (cliente)
    static async crear(req, res) {
        try {
            const {
                fecha_reserva,
                salon_id,
                turno_id,
                foto_cumpleaniero,
                tematica,
                importe_salon,
                importe_total,
            } = req.body;

            //Crea una nueva reserva
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
            await enviarNotificacion(nuevaReserva, { email: 'reymanaos22@gmail.com', nombre_usuario: 'Test' });


            res.status(201).json({
                mensaje: 'Reserva creada correctamente',
                reserva: nuevaReserva
            });
        } catch (error) {
            console.error('error al crear reserva:', error);
            res.status(500).json({ mensaje: 'error al buscar salones', error });
        }
    }

    //GET -> listar reservas del cliente autenticado
    //Listaremos las reservas del cliente
    static async listar(req, res) {
        try {
            const reservas = await Reserva.findAll({
                where: { usuario_id: req.usuario.usuario_id },
                include: [
                    { model: Salon },
                    { model: Servicio }
                ]
            });

            res.json(reservas);
        } catch (error) {
            //console.error(error); Debbug
            console.error('error al listar reservas:', error);
            res.status(500).json({ mensaje: 'error al buscar listar', error });
        }
    }

    //PUT -> actualizar reservas (solo admin)
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { fecha_reserva, salon_id, turno_id, tematica, importe_total } = req.body;

            const reserva = await Reserva.findByPk(id);
            //console.log('Buscando reserva con id:', id); Debugg

            if (!reserva || reserva.activo === 0) {
                return res.status(404).json({ mensaje: 'reserva no encontrada'});
            }

            await reserva.update({
                fecha_reserva,
                salon_id,
                turno_id,
                tematica,
                importe_total
            });

            res.json({ mensaje: 'reserva actualizada correctamnete', reserva });
        } catch (error) {
            console.error('error al actualizar reservas:', error);
            res.status(500).json({ mensaje: 'error al actualizar reserva', error });
        }
    }

    //Delete -> eliminar reserva (con soft delete, solo admin)
    static async eliminar (req, res) {
        try {
            const { id } = req.params;

            const reserva = await Reserva.findByPk(id);
            if (!reserva || reserva.activo === 0) {
                return res.status(404).json({ mensaje: 'reserva no encontrada o ya eliminada' });
            }

            await reserva.update({ activo: 0})

            res.json({ mensaje: 'reserva eliminada correcta (soft delete)' });
        } catch (error) {
            console.error('error al eliminar reservas:', error);
            res.status(500).json({ mensaje: 'error al eliminar reservas', error });
        }
    }

    //GET -> solo para admin o empleado
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

module.exports = ReservaController;
