import { enviarNotificacion } from "../notificacion/mailer.js";
import pool from "../database/database.js"


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

        const [result] = await pool.query(
            `INSERT INTO reservas 
            (fecha_reserva, salon_id, turno_id, usuario_id, foto_cumpleaniero, tematica, importe_salon, importe_total, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [fecha_reserva, salon_id, turno_id, usuario.usuario_id, foto_cumpleaniero, tematica, importe_salon, importe_total]
        );

        const nuevaReservaId = result.insertId;

        //traemos la reserva que se creo para devolverla
        const [rows] = await pool.query(
            'SELECT * FROM reservas WHERE reserva_id = ?',
            [nuevaReservaId]
        );

        const nuevaReserva = rows[0];

        //Enviar notificacion al administrador
        await enviarNotificacion(nuevaReserva, usuario);

        return nuevaReserva;
    }

    async listar(usuarioId) {
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             WHERE r.usuario_id = ? AND r.activo = 1`,
            [usuarioId]
        );

        return rows;
    }

    async obtenerPorId(id){
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta, u.nombre, u.nombre_usuario
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
             WHERE r.reserva_id = ? AND r.activo = 1`,
            [id]
        );

        const reserva = rows[0];
        if (!reserva) throw new Error("no se encontro");

        return reserva;
    }

    async actualizar(id, data) {
        const { fecha_reserva, salon_id, turno_id, tematica, importe_total } = data;

        //hay que verificar si existe
        const [checkRows] = await pool.query(
            'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1',
            [id]
        );
        if (checkRows.length === 0) throw new Error('no se encontro');

        await pool.query(
            `UPDATE reservas SET fecha_reserva=?, salon_id=?, turno_id=?, tematica=?, importe_total=? WHERE reserva_id = ?`,
            [fecha_reserva, salon_id, turno_id, tematica, importe_total, id]
        );

        return this.obtenerPorId(id);

    }

    async eliminar(id){
        const [checkRows] = await pool.query(
            'SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1',
            [id]
        );
        if(checkRows.length === 0) throw new Error('no se encontro');

        await pool.query(
            'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
            [id]
        );

        return { mensaje: "Reserva eliminada correctamente (soft delete)" };
    }

    async listarTodas(){
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta, u.usuario_id, u.nombre, u.nombre_usuario
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
             WHERE r.activo = 1`
        )

        return rows;
    }
}

export default new ReservaService();