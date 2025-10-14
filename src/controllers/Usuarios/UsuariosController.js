import UsuariosService from '../../services/UsuariosService.js';

class UsuariosController {
    // Crear usuario
    static async create(req, res) {
        try {
            const usuario = await UsuariosService.crearUsuario(req.body);
            res.status(201).json({ mensaje: "usuario creado exitosamente", usuario });
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // Listar todos los usuarios activos
    static async getAll(req, res) {
        try {
            const usuarios = await UsuariosService.listarUsuarios();
            res.json(usuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    // Listar solo clientes (tipo_usuario = 1)
    static async getClientes(req, res) {
        try {
            const clientes = await UsuariosService.listarClientes();
            res.json(clientes);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ error: "Error al obtener clientes" });
        }
    }

    // Obtener usuario por ID
    static async getById(req, res) {
        try {
            const usuario = await UsuariosService.obtenerUsuarioPorId(req.params.id);
            if (!usuario) return res.status(404).json({ error: "usuario no encontrado" });
            res.json(usuario);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener el usuario" });
        }
    }

    // Actualizar usuario
    static async update(req, res) {
        try {
            const usuario = await UsuariosService.actualizarUsuario(req.params.id, req.body);
            if (!usuario) return res.status(404).json({ error: "usuario no encontrado" });
            res.json(usuario);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ error: "Error al actualizar el usuario" });
        }
    }

    // Eliminar usuario (soft delete)
    static async delete(req, res) {
        try {
            const ok = await UsuariosService.eliminarUsuario(req.params.id);
            if (!ok) return res.status(404).json({ error: "usuario no encontrado" });
            res.json({ message: "Usuario eliminado (soft delete)" });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario" });
        }
    }
}

export default UsuariosController;
