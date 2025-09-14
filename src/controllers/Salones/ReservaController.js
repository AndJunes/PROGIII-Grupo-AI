const Reserva = require ('../../models/Reserva');
const Salon = require('../../models/Salon');
const Servicio = require('../../models/Servicio');

//Relacion Sequelize
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });
Reserva.belongsTo(Servicio, { foreignKey: 'turno_id' });

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
}

module.exports = ReservaController;
