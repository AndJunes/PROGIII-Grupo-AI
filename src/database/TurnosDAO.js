import pool from '../database/database.js';

class TurnosDAO {

    async create(turno) {
        const { orden, hora_desde, hora_hasta } = turno;
        const [result] = await pool.execute(
            `INSERT INTO turnos (orden, hora_desde, hora_hasta, activo)
             VALUES (?, ?, ?, 1)`,
            [orden, hora_desde, hora_hasta]
        );
        return { turno_id: result.insertId, orden, hora_desde, hora_hasta, activo: 1 };
    }

    async findAllWithPagination(limit, offset, includeInactive = false) {
        const whereClause = includeInactive ? '1 = 1' : 'activo = 1';
        // Obtener turnos activos con límite y desplazamiento
        const [rows] = await pool.query(
            `SELECT * FROM turnos WHERE ${whereClause} ORDER BY turno_id ASC LIMIT ? OFFSET ?`,
            [Number(limit), Number(offset)]
        );
        // Contar total de turnos activos
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM turnos WHERE ${whereClause}`
        );

        return { rows, total };
    }

    async getById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM turnos WHERE turno_id = ?`,
            [id]
        );
        if (rows.length === 0) throw new Error("not_found");
        return rows[0];
    }

    async update(id, data) {
        // Leemos TODOS los datos que llegan del frontend
        const { orden, hora_desde, hora_hasta, activo } = data;
        // Validamos que 'activo' sea 0 o 1
        const estadoActivo = (activo === 1 || activo === '1') ? 1 : 0;
        const [result] = await pool.execute(
            `UPDATE turnos 
             SET orden = ?, hora_desde = ?, hora_hasta = ?, activo = ? 
             WHERE turno_id = ?`,
            [
                orden, 
                hora_desde, 
                hora_hasta, 
                estadoActivo, 
                id
            ]
        );

        if (result.affectedRows === 0) {
            throw new Error("not_found");
        }
        // Devolvemos el objeto completo actualizado
        return { turno_id: id, orden, hora_desde, hora_hasta, activo: estadoActivo };
    }

    async delete(id) {
        const [result] = await pool.execute(
            `UPDATE turnos SET activo = 0 WHERE turno_id = ?`,
            [id]
        );
        if (result.affectedRows === 0 && result.changedRows === 0) {
            console.warn(`Se intentó eliminar el turno ${id} pero ya estaba eliminado o no existe.`);
        }
        return { message: "Turno eliminado correctamente (soft delete)" };
    }
}

export default new TurnosDAO();
