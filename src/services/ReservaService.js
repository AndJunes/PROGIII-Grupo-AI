import Reserva from "../models/Reserva.js";
import Salon from "../models/Salon.js";
import Servicio from "../models/Servicio.js";
import Usuario from "../models/Usuario.js";
import { enviarNotificacion } from "../notificacion/mailer.js";

// Relaciones Sequelize (importantes si no están definidas globalmente)
Reserva.belongsTo(Salon, { foreignKey: "salon_id" });
Reserva.belongsTo(Servicio, { foreignKey: "turno_id" });
Reserva.belongsTo(Usuario, { foreignKey: "usuario_id" });


class ReservaService {

    async crear(data, usuario) {
        const {
            fecha_reserva,
            salon_id,
            turno_id,
            foto_cumpleaniero,
            tematica,
            importe_salon,
            importe_total,
        } = data;

        const nuevaReserva = await Reserva.create({
            fecha_reserva,
            salon_id,
            turno_id,
            usuario_id: usuario.usuario_id,
            foto_cumpleaniero,
            tematica,
            importe_salon,
            importe_total,
            activo: 1
        });

        //Enviar notificacion al administrador
        await enviarNotificacion(nuevaReserva, usuario);

        return nuevaReserva;
    }

    async listar(usuarioId) {
        const reservas = await Reserva.findAll({
            where: { usuario_id: usuarioId },
            include: [{ model: Salon }, {model: Servicio}],
        });

        return reservas;
    }

    async obtenerPorId(id){
        const reserva = await Reserva.findByPk(id, {
            include: [
                { model: Salon },
                { model: Servicio },
                { model: Usuario, atributes: ["usuario_id", "nombre", "nomre_usuario"] },
            ],
        });

        if (!reserva || reserva.activo === 0) throw new Error("not_found");
        return reserva;
    }

    async actualizar(id, data) {
        const reserva = await Reserva.findByPk(id);
        if (!reserva || reserva.activo === 0) throw new Error("not_found");

        const { fecha_reserva, salon_id, turno_id, tematica, importe_total } = data;
        await reserva.update({ fecha_reserva, salon_id, turno_id, tematica, importe_total });

        return reserva;
    }

    async eliminar(id){
        const reserva = await Reserva.findByPk(id);
        if (!reserva || reserva.activo === 0) throw new Error("not_found");

        await reserva.update({ activo: 0 });
        return { mensaje: "Reserva eliminada correctamente (soft delete)" };
    }

    async listarTodas(){
        const reservas = await Reserva.findAll({
            where: { activo: 1 },
            include: [
                { model: Salon },
                { model: Servicio },
                { model: Usuario, attributes: ["usuario_id", "nombre", "nombre_usuario"] },
            ],
        });

        return reservas;
    }
}

export default new ReservaService();