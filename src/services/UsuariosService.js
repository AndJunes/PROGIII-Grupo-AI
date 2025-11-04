import bcrypt from "bcryptjs";
import UsuariosDAO from "../database/UsuariosDAO.js";

class UsuariosService {
    static async crearUsuario(datos) {
        const hash = await bcrypt.hash(datos.contrasenia.trim(), 10);
        return UsuariosDAO.crear({ ...datos, contrasenia: hash });
    }

    static async listarUsuarios() {
        return UsuariosDAO.listar();
    }

    static async listarClientes() {
        return UsuariosDAO.listarClientes();
    }

    static async obtenerUsuarioPorId(id) {
        return UsuariosDAO.obtenerPorId(id);
    }

    static async actualizarUsuario(id, data) {
        const campos = [];
        const valores = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                if (key === "contrasenia") {
                    const hash = await bcrypt.hash(value, 10);
                    campos.push(`${key} = ?`);
                    valores.push(hash);
                } else {
                    campos.push(`${key} = ?`);
                    valores.push(value);
                }
            }
        }

        if (campos.length === 0) throw new Error("No hay campos para actualizar");

        return UsuariosDAO.actualizar(id, campos, valores);
    }

    static async eliminarUsuario(id) {
        return UsuariosDAO.eliminar(id);
    }
}

export default UsuariosService;
