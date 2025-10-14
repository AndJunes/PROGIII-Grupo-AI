import pool from '../database/database.js';

class TurnosService {

    // Crear turno
    async create(data) {
        const { orden, hora_desde, hora_hasta } = data;
        const [result] = await pool.execute(
            `INSERT INTO turnos (orden, hora_desde, hora_hasta, activo) VALUES (?, ?, ?, 1)`,
            [orden, hora_desde, hora_hasta]
        );
        return { turno_id: result.insertId, orden, hora_desde, hora_hasta, activo: 1 };
    }

    // Listar todos los turnos activos
    async getAll() {
        const [rows] = await pool.execute(
            `SELECT * FROM turnos WHERE activo = 1 ORDER BY turno_id ASC`
        );
        return rows;
    }

    // Obtener turno por ID
    async getById(id) {
        const [rows] = await pool.execute(
            `SELECT * FROM turnos WHERE turno_id = ? AND activo = 1`,
            [id]
        );
        if (rows.length === 0) throw new Error("not_found");
        return rows[0];
    }

    // Actualizar turno
    async update(id, data) {
        const { hora_desde, hora_hasta } = data;
        const [result] = await pool.execute(
            `UPDATE turnos SET hora_desde = ?, hora_hasta = ? WHERE turno_id = ? AND activo = 1`,
            [hora_desde, hora_hasta, id]
        );
        if (result.affectedRows === 0) throw new Error("not_found");
        return { turno_id: id, hora_desde, hora_hasta, activo: 1 };
    }

    // Eliminar turno (soft delete)
    async delete(id) {
        const [result] = await pool.execute(
            `UPDATE turnos SET activo = 0 WHERE turno_id = ? AND activo = 1`,
            [id]
        );
        if (result.affectedRows === 0) throw new Error("not_found");
        return { message: "turno eliminado (soft delete)" };
    }
}

export default new TurnosService();
