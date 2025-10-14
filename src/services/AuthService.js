import pool from "../database/database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

class AuthService {
    static async login(nombre_usuario, contrasenia) {
        //Validación básica
        if (!nombre_usuario || !contrasenia) {
            throw new Error("usuario y contraseña son requeridos");
        }

        //Buscar usuario por nombre_usuario
        const [rows] = await pool.query(
            `SELECT * FROM usuarios WHERE nombre_usuario = ? LIMIT 1`,
            [nombre_usuario]
        );
        const usuario = rows[0];

        if (!usuario || usuario.activo === 0) {
            throw new Error("credenciales inválidas");
        }

        const passwordLimpia = contrasenia.trim();
        const hash = usuario.contrasenia;
        let esValida = false;

        // Determinar tipo de hash
        if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
            //bcrypt
            esValida = await bcrypt.compare(passwordLimpia, hash);

        } else if (hash.length === 32 && /^[a-f0-9]{32}$/i.test(hash)) {
            //MD5 antiguo
            const md5 = crypto.createHash("md5").update(passwordLimpia).digest("hex");
            esValida = md5 === hash;

            //Si coincide el MD5, migrar a bcrypt
            if (esValida) {
                const nuevoHash = await bcrypt.hash(passwordLimpia, 12);
                await pool.query(`UPDATE usuarios SET contrasenia = ? WHERE usuario_id = ?`, [
                    nuevoHash,
                    usuario.usuario_id,
                ]);
                console.log(`usuario ${nombre_usuario} migrado a bcrypt`);
            }

        } else {
            throw new Error("credenciales inválidas");
        }

        if (!esValida) {
            throw new Error("credenciales inválidas");
        }

        // Generar JWT
        const token = jwt.sign(
            {
                usuario_id: usuario.usuario_id,
                nombre_usuario: usuario.nombre_usuario,
                tipo_usuario: usuario.tipo_usuario,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Excluir contraseña del objeto de retorno
        delete usuario.contrasenia;

        return { token, usuario };
    }
}

export default AuthService;
