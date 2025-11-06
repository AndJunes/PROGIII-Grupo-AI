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

    async findAllWithPagination(limit, offset) {
        // Obtener turnos activos con límite y desplazamiento
        const [rows] = await pool.query(
            `SELECT * FROM turnos WHERE activo = 1 ORDER BY turno_id ASC LIMIT ? OFFSET ?`,
            [Number(limit), Number(offset)]
        );

        // Contar total de turnos activos
        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM turnos WHERE activo = 1`
        );

        return { rows, total };
    }

    async getById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM turnos WHERE turno_id = ? AND activo = 1`,
            [id]
        );
        if (rows.length === 0) throw new Error("not_found");
        return rows[0];
    }

    async update(id, data) {
        const { hora_desde, hora_hasta } = data;
        const [result] = await pool.execute(
            `UPDATE turnos SET hora_desde = ?, hora_hasta = ? WHERE turno_id = ? AND activo = 1`,
            [hora_desde, hora_hasta, id]
        );
        if (result.affectedRows === 0) throw new Error("not_found");
        return { turno_id: id, hora_desde, hora_hasta, activo: 1 };
    }

    async delete(id) {
        const [result] = await pool.execute(
            `UPDATE turnos SET activo = 0 WHERE turno_id = ? AND activo = 1`,
            [id]
        );
        if (result.affectedRows === 0) throw new Error("not_found");
        return { message: "Turno eliminado correctamente (soft delete)" };
    }
}

export default new TurnosDAO();
