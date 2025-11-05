import pool from "../database/database.js";

class ServiciosDAO {

    async getAll() {
        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE activo = 1 ORDER BY servicio_id ASC`
        );
        return rows;
    }

    async getByUser(usuarioId) {
        const [rows] = await pool.query(
            `SELECT DISTINCT s.servicio_id, s.descripcion, s.importe
             FROM reservas_servicios rs
             INNER JOIN reservas r ON rs.reserva_id = r.reserva_id
             INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
             WHERE r.usuario_id = ? AND r.activo = 1 AND s.activo = 1`,
            [usuarioId]
        );
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1`,
            [id]
        );
        return rows[0];
    }

    async create(data) {
        const { descripcion, importe } = data;
        const [result] = await pool.query(
            `INSERT INTO servicios (descripcion, importe, activo) VALUES (?, ?, 1)`,
            [descripcion, importe]
        );

        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    async update(id, data) {
        const campos = [];
        const valores = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        }

        if (campos.length === 0) return null;

        valores.push(id);

        await pool.execute(
            `UPDATE servicios SET ${campos.join(", ")} WHERE servicio_id = ?`,
            valores
        );

        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ?`,
            [id]
        );

        return rows[0];
    }

    async delete(id) {
        await pool.query(
            `UPDATE servicios SET activo = 0 WHERE servicio_id = ?`,
            [id]
        );
        return { message: "Servicio eliminado correctamente (soft delete)" };
    }
}

export default new ServiciosDAO();
