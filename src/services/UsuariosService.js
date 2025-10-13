import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import { CLIENTE } from "../constants/roles.js";

class UsuariosService {
    static async crearUsuario(data) {
        const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = data;

        if (!contrasenia) throw new Error("contraseña requerida");

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
        return usuarioPlano;
    }

    //Listar usuarios activos
    static async listarUsuarios() {
        const usuarios = await Usuario.findAll({
            where: { activo: 1 },
            attributes: { exclude: ['contrasenia'] },
            order: [['usuario_id', 'ASC']],
        });
        return usuarios;
    }

    //Listar Clientes
    static async listarClientes() {
        const clientes = await Usuario.findAll({
            where: { activo: 1, tipo_usuario: CLIENTE},
            attributes: { exclude: ['contrasenia'] },
            order: [['usuario_id', 'ASC']],
        });
    }

    //Listar usuario por ID
    static async obtenerPorId(id){
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['contrasenia'] },
        });
        if (!usuario || usuario.activo === 0) return null;
        return usuario;
    }

    //Actualizar usuario
    static async actualizarUsuario(id, datos){
        const usuario = await Usuario.findByPk(id);
        if (!usuario || usuario.activo === 0) return null;

        //Hasheamos la contraseña si existe
        if (datos.contrasenia) {
            datos.contrasenia = await bcrypt.hash(datos.contrasenia.trim(), 12);
        }

        await usuario.update(datos);

        const usuarioPlano = usuario.get({ plain: true });
        delete usuarioPlano.contrasenia;
        return usuarioPlano;
    }

    //Eliminamos con soft delete
    static async eliminarUsuario(id) {
        const usuario = await Usuario.findByPk(id);
        if (!usuario || usuario.activo === 0) return null;

        await usuario.update({ activo: 0 });
        return true;
    }
}

export default UsuariosService;

























