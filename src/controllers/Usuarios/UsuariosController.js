import Usuario from "../../models/Usuario.js";
import bcrypt from "bcryptjs";

class UsuariosController {
    // Crear usuario
    static async create(req, res) {
        try {
            const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;

            if (!contrasenia) {
                return res.status(400).json({ error: "Contraseña requerida" });
            }

            const usuario = await Usuario.create({
                nombre,
                apellido,
                nombre_usuario,
                //Se hashea directamente en el hook
                contrasenia: contrasenia.trim(),
                tipo_usuario,
                celular,
                foto,
                activo: 1
            });

            // Convertir a objeto plano y eliminar la contraseña
            const usuarioPlano = usuario.get({ plain: true });
            delete usuarioPlano.contrasenia;

            res.status(201).json({
                mensaje: "Usuario creado exitosamente",
                usuario: usuarioPlano
            });

        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(500).json({ error: "Error al crear el usuario" });
        }
    }

    // Listar todos los usuarios activos
    static async getAll(req, res) {
        try {
            const usuarios = await Usuario.findAll({
                where: { activo: 1 },
                attributes: { exclude: ["contrasenia"] },
                order: [["usuario_id", "ASC"]],
            });
            res.json(usuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }

    // Listar solo clientes (tipo_usuario = 1)
    static async getClientes(req, res) {
        try {
            const clientes = await Usuario.findAll({
                where: { activo: 1, tipo_usuario: 1 },
                attributes: { exclude: ["contrasenia"] },
                order: [["usuario_id", "ASC"]],
            });
            res.json(clientes);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ error: "Error al obtener clientes" });
        }
    }

    // Obtener usuario por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id, {
                attributes: { exclude: ["contrasenia"] },
            });
            if (!usuario || usuario.activo === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener el usuario" });
        }
    }

    // Actualizar usuario
    static async update(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario || usuario.activo === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Si se manda nueva contraseña, encriptarla
            if (req.body.contrasenia) {
                req.body.contrasenia = await bcrypt.hash(req.body.contrasenia, 12);
            }

            await usuario.update(req.body);

            const usuarioPlano = usuario.get({ plain: true });
            delete usuarioPlano.contrasenia;

            res.json(usuarioPlano);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(500).json({ error: "Error al actualizar el usuario" });
        }
    }

    // Eliminar usuario (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario || usuario.activo === 0) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await usuario.update({ activo: 0 });
            res.json({ message: "Usuario eliminado (soft delete)" });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ error: "Error al eliminar el usuario" });
        }
    }
}

export default UsuariosController;
