const Usuario = require("../../models/Usuario");
const bcrypt = require("bcryptjs");

class UsuariosController {
    // Crear usuario
    static async create(req, res) {
        try {
            const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;

            const hashedPassword = await bcrypt.hash(contrasenia, 10);

            const usuario = await Usuario.create({
                nombre,
                apellido,
                nombre_usuario,
                contrasenia: hashedPassword,
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
            console.error("error al crear usuario:", error);
            res.status(500).json({ error: "error al crear el usuario" });
        }
    }

    // Listar todos los usuarios
    static async getAll(req, res) {
        try {
            const usuarios = await Usuario.findAll({
                where: { activo: true },
                attributes: { exclude: ["password"] },
                order: [["usuario_id", "ASC"]],
            });
            res.json(usuarios);
        } catch (error) {
            console.error("error al obtener usuarios:", error);
            res.status(500).json({ error: "error al obtener usuarios" });
        }
    }

    // Obtener usuario por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id, {
                attributes: { exclude: ["password"] },
            });
            if (!usuario || !usuario.activo) {
                return res.status(404).json({ error: "usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            console.error("error al obtener usuario:", error);
            res.status(500).json({ error: "error al obtener el usuario" });
        }
    }

    // Actualizar usuario
    static async update(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario || !usuario.activo) {
                return res.status(404).json({ error: "usuario no encontrado" });
            }

            // Si se manda nueva password, encriptarla
            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10);
            }

            await usuario.update(req.body);
            res.json(usuario);
        } catch (error) {
            console.error("error al actualizar usuario:", error);
            res.status(500).json({ error: "error al actualizar el usuario" });
        }
    }

    // Eliminar usuario (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.findByPk(id);
            if (!usuario || !usuario.activo) {
                return res.status(404).json({ error: "usuario no encontrado" });
            }
            await usuario.update({ activo: false });
            res.json({ message: "usuario eliminado (soft delete)" });
        } catch (error) {
            console.error("error al eliminar usuario:", error);
            res.status(500).json({ error: "error al eliminar el usuario" });
        }
    }
}

module.exports = UsuariosController;
