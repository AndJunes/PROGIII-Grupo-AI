import UsuariosService from '../../services/UsuariosService.js';
import apicache from 'apicache';
import AuditLogger from '../../utils/AuditLogger.js';

class UsuariosController {
    scrubUser(user) {
        if (!user) return user;
        const { password, contrasenia, hash, ...rest } = user;
        return rest;
    }
    // Crear usuario
    async create(req, res) {
        try {
            const usuario = await UsuariosService.crearUsuario(req.body);
            res.status(201).json({ mensaje: "usuario creado exitosamente", usuario });
            apicache.clear('usuarios');
            await AuditLogger.log({
                req,
                entity: 'usuarios',
                entityId: usuario?.id || usuario?.usuario_id,
                action: 'create',
                changes: { after: this.scrubUser(usuario) }
            });
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // Listar todos los usuarios activos
    async getAll(req, res) {
        try {
            const { pagina = 1, limite = 10, orden, direccion } = req.query;
            const includeInactive = req.query.include_inactive === 'true';
            const resultado = await UsuariosService.listarUsuariosConFiltros({
                pagina: Number(pagina),
                limite: Number(limite),
                orden,
                direccion
            }, includeInactive);
            res.json(resultado);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    // Listar solo clientes (tipo_usuario = 1)
    async getClientes(req, res) {
        try {
            const clientes = await UsuariosService.listarClientes();
            res.json(clientes);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ error: "Error al obtener clientes" });
        }
    }

    // Obtener usuario por ID
    async getById(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const usuario = await UsuariosService.obtenerUsuarioPorId(req.params.id, includeInactive);
            if (!usuario) return res.status(404).json({ error: "usuario no encontrado" });
            res.json(usuario);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener el usuario" });
        }
    }

    // Actualizar usuario
    async update(req, res) {
        try {
            const before = await UsuariosService.obtenerUsuarioPorId(req.params.id, true);
            const usuario = await UsuariosService.actualizarUsuario(req.params.id, req.body);
            if (!usuario) return res.status(404).json({ error: "usuario no encontrado" });
            res.json(usuario);
            apicache.clear('usuarios');
            await AuditLogger.log({
                req,
                entity: 'usuarios',
                entityId: Number(req.params.id),
                action: 'update',
                changes: { before: this.scrubUser(before), after: this.scrubUser(usuario) }
            });
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ error: "Error al actualizar el usuario" });
        }
    }

    // Eliminar usuario (soft delete)
    async delete(req, res) {
        try {
            const before = await UsuariosService.obtenerUsuarioPorId(req.params.id, true);
            const ok = await UsuariosService.eliminarUsuario(req.params.id);
            if (!ok) return res.status(404).json({ error: "usuario no encontrado" });
            res.json({ message: "Usuario eliminado (soft delete)" });
            apicache.clear('usuarios');
            await AuditLogger.log({
                req,
                entity: 'usuarios',
                entityId: Number(req.params.id),
                action: 'delete',
                changes: { before: this.scrubUser(before) }
            });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario" });
        }
    }
}
export default new UsuariosController();
