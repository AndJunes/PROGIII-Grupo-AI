import pool from "../database/database.js";

class UsuariosDAO {
    async crear(datos) {
        const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = datos;
        const [result] = await pool.query(
            `INSERT INTO usuarios 
             (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo, creado, modificado)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto]
        );
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
             FROM usuarios WHERE usuario_id = ?`,
            [result.insertId]
        );
        return rows[0];
    }

    async listar() {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
             FROM usuarios WHERE activo = 1 ORDER BY usuario_id ASC`
        );
        return rows;
    }

    async listarClientes() {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
             FROM usuarios WHERE activo = 1 AND tipo_usuario = 3 ORDER BY usuario_id ASC`
        );
        return rows;
    }

    async listarConFiltros({ limite = 10, offset = 0, orden = 'usuario_id', direccion = 'ASC' }) {
        const ordenCamposPermitidos = ['usuario_id', 'nombre', 'apellido', 'tipo_usuario'];
        const direccionPermitida = direccion.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const campoOrden = ordenCamposPermitidos.includes(orden) ? orden : 'usuario_id';

        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
            FROM usuarios 
            WHERE activo = 1 
            ORDER BY ${campoOrden} ${direccionPermitida}
            LIMIT ? OFFSET ?`,
            [Number(limite), Number(offset)]
        );

        const [[{ total }]] = await pool.query(
            `SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1`
        );

        return {
            total,
            usuarios: rows
        };
    }

    async obtenerPorId(id) {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
             FROM usuarios WHERE usuario_id = ? AND activo = 1`,
            [id]
        );
        return rows[0];
    }

    async actualizar(id, campos, valores) {
        valores.push(id);
        const [result] = await pool.query(
            `UPDATE usuarios SET ${campos.join(", ")}, modificado = NOW() WHERE usuario_id = ? AND activo = 1`,
            valores
        );
        if (result.affectedRows === 0) throw new Error("Usuario no encontrado o inactivo");
        const [updated] = await pool.query(
            `SELECT usuario_id, nombre_usuario, tipo_usuario, activo, creado, modificado 
             FROM usuarios WHERE usuario_id = ?`,
            [id]
        );
        return updated[0];
    }

    async eliminar(id) {
        await pool.query(
            `UPDATE usuarios SET activo = 0, modificado = NOW() WHERE usuario_id = ?`,
            [id]
        );
        return { message: "Usuario eliminado (soft delete)" };
    }
}

export default new UsuariosDAO();
