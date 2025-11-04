import pool from "../database/database.js";
import bcrypt from "bcryptjs";

class UsuariosService {
    // Crear usuario
    static async crearUsuario(datos) {
        const {
            nombre,
            apellido,
            nombre_usuario,
            contrasenia,
            tipo_usuario,
            celular,
            foto,
        } = datos;

        const hash = await bcrypt.hash(contrasenia.trim(), 10);

        const [result] = await pool.query(
            `INSERT INTO usuarios 
       (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, activo, creado, modificado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
            [nombre, apellido, nombre_usuario, hash, tipo_usuario, celular, foto]
        );

        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
       FROM usuarios WHERE usuario_id = ?`,
            [result.insertId]
        );

        return rows[0];
    }

    // Listar usuarios activos
    static async listarUsuarios() {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
       FROM usuarios WHERE activo = 1 ORDER BY usuario_id ASC`
        );
        return rows;
    }

    // Listar clientes
    static async listarClientes() {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
       FROM usuarios WHERE activo = 1 AND tipo_usuario = 3 ORDER BY usuario_id ASC`
        );
        return rows;
    }

    // Obtener usuario por ID
    static async obtenerUsuarioPorId(id) {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, foto 
       FROM usuarios WHERE usuario_id = ? AND activo = 1`,
            [id]
        );
        return rows[0];
    }

    // Actualizar usuario
    static async actualizarUsuario(id, data) {
    const campos = [];
    const valores = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        // 🔒 Si el campo es contrasenia, se hashea antes de guardar
        if (key === "contrasenia") {
          const hashedPassword = await bcrypt.hash(value, 10);
          campos.push(`${key} = ?`);
          valores.push(hashedPassword);
        } else {
          campos.push(`${key} = ?`);
          valores.push(value);
        }
      }
    }

    if (campos.length === 0) throw new Error("No hay campos para actualizar");

    valores.push(id);

    const [result] = await pool.query(
      `UPDATE usuarios 
       SET ${campos.join(", ")}, modificado = NOW() 
       WHERE usuario_id = ? AND activo = 1`,
      valores
    );

    if (result.affectedRows === 0)
      throw new Error("Usuario no encontrado o inactivo");

    const [updatedUser] = await pool.query(
      `SELECT usuario_id, nombre_usuario, tipo_usuario, activo, creado, modificado 
       FROM usuarios WHERE usuario_id = ?`,
      [id]
    );

    return updatedUser[0];
  }


    // Eliminar usuario (soft delete)
    static async eliminarUsuario(id) {
        await pool.query(
            `UPDATE usuarios SET activo=0, modificado=NOW() WHERE usuario_id=?`,
            [id]
        );
        return { message: "Usuario eliminado (soft delete)" };
    }
}

export default UsuariosService;
