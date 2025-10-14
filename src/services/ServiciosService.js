import pool from "../database/database.js"

class ServiciosService {

    // Obtener todos los servicios activos
    async getAll() {
        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE activo = 1 ORDER BY servicio_id ASC`
        );
        return rows;
    }

    // Obtener servicios vinculados al usuario
    async getByUser(usuarioId) {
        const [rows] = await pool.query(
            `SELECT DISTINCT s.servicio_id, s.descripcion, s.importe
             FROM reservas_servicios rs
             INNER JOIN reservas r ON rs.reserva_id = r.reserva_id
             INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
             WHERE r.usuario_id = ? AND r.activo = 1 AND s.activo = 1`,
            [usuarioId]
        );

        if (rows.length === 0) throw new Error("no_services");

        return rows;
    }

    // Obtener un servicio por ID
    async getById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1`,
            [id]
        );

        const servicio  = rows[0];
        if (!servicio) throw new Error("no se encontro");
        return servicio;
    }

    // Crear un servicio
    async create(data) {
        const { descripcion, importe } = data;

        const [result] = await pool.query(
            `INSERT INTO servicios (descripcion, importe, activo) VALUES (?, ?, 1)`,
            [descripcion, importe]
        );

        const nuevoId = result.insertId;

        const [rows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ?`,
            [nuevoId]
        );

        return rows[0];

    }

    // Actualizar un servicio
    async update(id, data) {
        // Verificar que exista y esté activo
        const [checkRows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1`,
            [id]
        );

        if (checkRows.length === 0) throw new Error("No se encontró el servicio");

        // Construir query dinámica
        const campos = [];
        const valores = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        }

        if (campos.length === 0) throw new Error("No hay campos para actualizar");

        valores.push(id);

        // Ejecutar update
        const [result] = await pool.execute(
            `UPDATE servicios SET ${campos.join(", ")} WHERE servicio_id = ?`,
            valores
        );

        if (result.affectedRows === 0) throw new Error("No se actualizó el servicio");

        // Devolver registro actualizado
        const [updateRows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ?`,
            [id]
        );

        return updateRows[0];
    }

    // Eliminar (soft delete)
    async delete(id) {
        const [checkRows] = await pool.query(
            `SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1`,
            [id]
        );

        if(checkRows.length === 0) throw new Error("no se encontro");

        await pool.query(
            `UPDATE servicios SET activo = 0 WHERE servicio_id = ?`,
            [id]
        );

        return { message: "Servicio eliminado correctamente (soft delete)" };
    }
}

export default new ServiciosService();
