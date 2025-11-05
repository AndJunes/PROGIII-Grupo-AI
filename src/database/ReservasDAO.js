import pool from "../database/database.js";

class ReservaDAO {

    // Crear reserva
    async crearReserva(data, usuarioId) {
        const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total } = data;
        const [result] = await pool.query(
            `INSERT INTO reservas 
             (fecha_reserva, salon_id, turno_id, usuario_id, foto_cumpleaniero, tematica, importe_salon, importe_total, activo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [fecha_reserva, salon_id, turno_id, usuarioId, foto_cumpleaniero, tematica, importe_salon, importe_total]
        );
        return result.insertId;
    }

    // Asociar servicios a una reserva
    async asociarServicios(reservaId, servicios) {
        if (!servicios || servicios.length === 0) return;
        const serviciosInsert = servicios.map(s => [
            reservaId,
            s.servicio_id,
            s.importe || 0,
            new Date(),
            new Date()
        ]);
        await pool.query(
            `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado, modificado)
             VALUES ?`,
            [serviciosInsert]
        );
    }

    // Obtener reserva por ID
    async obtenerPorId(id) {
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta, u.nombre, u.nombre_usuario
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
             WHERE r.reserva_id = ? AND r.activo = 1`,
            [id]
        );
        return rows[0];
    }

    // Listar reservas por usuario
    async listarPorUsuario(usuarioId) {
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

    // Listar todas las reservas
    async listarTodas() {
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta, u.usuario_id, u.nombre, u.nombre_usuario
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
             WHERE r.activo = 1`
        );
        return rows;
    }

    // Actualizar reserva
    async actualizarReserva(id, data) {
        const { fecha_reserva, salon_id, turno_id, tematica, importe_total } = data;
        await pool.query(
            `UPDATE reservas 
             SET fecha_reserva=?, salon_id=?, turno_id=?, tematica=?, importe_total=?
             WHERE reserva_id=? AND activo=1`,
            [fecha_reserva, salon_id, turno_id, tematica, importe_total, id]
        );
    }

    // Eliminar reserva (soft delete)
    async eliminarReserva(id) {
        await pool.query(
            'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
            [id]
        );
    }

    // Ejecutar reportes
    async generarReporte(sql) {
        const [rows] = await pool.query(sql);
        return rows[0];
    }

    // Obtener información del usuario para notificaciones
    async obtenerUsuarioPorId(id) {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario
             FROM usuarios
             WHERE usuario_id = ? AND activo = 1`,
            [id]
        );
        return rows[0];
    }
}

export default new ReservaDAO();
