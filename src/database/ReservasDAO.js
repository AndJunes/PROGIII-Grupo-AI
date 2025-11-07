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

    // Reemplazar servicios asociados a una reserva (delete + bulk insert)
    async reemplazarServicios(reservaId, servicios) {
        await pool.query('DELETE FROM reservas_servicios WHERE reserva_id = ?', [reservaId]);
        if (servicios && servicios.length > 0) {
            const rows = servicios.map(s => [
                reservaId,
                s.servicio_id,
                s.importe || 0,
                new Date(),
                new Date()
            ]);
            await pool.query(
                `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado, modificado)
                 VALUES ?`,
                [rows]
            );
        }
    }

    // Obtener reserva por ID
    async obtenerPorId(id, includeInactive = false) {
        const where = includeInactive ? 'r.reserva_id = ?' : 'r.reserva_id = ? AND r.activo = 1';
        const [rows] = await pool.query(
            `SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta, u.nombre, u.nombre_usuario
             FROM reservas r
             LEFT JOIN salones s ON r.salon_id = s.salon_id
             LEFT JOIN turnos t ON r.turno_id = t.turno_id
             LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
             WHERE ${where}`,
            [id]
        );
        return rows[0];
    }

    //Listar por usuario
    async listarPorUsuario(usuarioId, { pagina = 1, limite = 10, orden = 'fecha_reserva', direccion = 'ASC' }, includeInactive = false) {
        let query = `
            SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta
            FROM reservas r
            LEFT JOIN salones s ON r.salon_id = s.salon_id
            LEFT JOIN turnos t ON r.turno_id = t.turno_id
            WHERE r.usuario_id = ? ${includeInactive ? '' : 'AND r.activo = 1'}
        `;

        const params = [usuarioId];

        const columnasValidas = ['fecha_reserva', 'importe_total', 'salon_id'];
        if (!columnasValidas.includes(orden)) orden = 'fecha_reserva';
        if (direccion.toUpperCase() !== 'DESC') direccion = 'ASC';
        query += ` ORDER BY ${orden} ${direccion}`;

        const offset = (pagina - 1) * limite;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }


    // Listar todas las reservas con filtrado, paginación y ordenación
    async listarTodas({ pagina = 1, limite = 10, orden = 'fecha_reserva', direccion = 'ASC', filtro_salon, filtro_usuario }, includeInactive = false) {
        let query = `
            SELECT r.*, s.titulo AS salon, t.hora_desde, t.hora_hasta,
                u.usuario_id, u.nombre, u.nombre_usuario
            FROM reservas r
            LEFT JOIN salones s ON r.salon_id = s.salon_id
            LEFT JOIN turnos t ON r.turno_id = t.turno_id
            LEFT JOIN usuarios u ON r.usuario_id = u.usuario_id
            WHERE ${includeInactive ? '1=1' : 'r.activo = 1'}
        `;

        const params = [];

        // --- FILTRADO ---
        if (filtro_salon) {
            query += " AND r.salon_id = ?";
            params.push(filtro_salon);
        }

        if (filtro_usuario) {
            query += " AND r.usuario_id = ?";
            params.push(filtro_usuario);
        }

        // --- ORDENACIÓN ---
        const columnasValidas = ['fecha_reserva', 'importe_total', 'salon_id', 'usuario_id'];
        if (!columnasValidas.includes(orden)) orden = 'fecha_reserva';
        if (direccion.toUpperCase() !== 'DESC') direccion = 'ASC';
        query += ` ORDER BY ${orden} ${direccion}`;

        // --- PAGINACIÓN ---
        const offset = (pagina - 1) * limite;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows;
    }


    // Actualizar reserva
    async actualizarReserva(id, data) {
        const campos = [];
        const valores = [];

        const permitidos = ['fecha_reserva', 'salon_id', 'turno_id', 'tematica', 'importe_total', 'activo'];
        for (const key of permitidos) {
            if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(data[key]);
            }
        }

        if (campos.length === 0) return; // nada que actualizar

        valores.push(id);
        await pool.query(
            `UPDATE reservas SET ${campos.join(', ')} WHERE reserva_id = ?`,
            valores
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

    // Obtener servicios asociados a una reserva
    async obtenerServiciosPorReserva(reservaId) {
        const [rows] = await pool.query(
            `SELECT rs.servicio_id, rs.importe
             FROM reservas_servicios rs
             WHERE rs.reserva_id = ?
             ORDER BY rs.reserva_servicio_id ASC`,
            [reservaId]
        );
        return rows;
    }
}

export default new ReservaDAO();
