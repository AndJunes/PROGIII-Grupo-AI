import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class AuthController {
    async login(req, res) {
        try {
            const { nombre_usuario, contrasenia } = req.body;

            if (!nombre_usuario || !contrasenia) {
                return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
            }

            const usuario = await Usuario.findOne({ where: { nombre_usuario } });

            if (!usuario || usuario.activo === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const passwordLimpia = contrasenia.trim();
            const hash = usuario.contrasenia;
            let esValida = false;

            // Detectar tipo de hash
            if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
                // bcrypt
                esValida = await bcrypt.compare(passwordLimpia, hash);

            } else if (hash.length === 32 && /^[a-f0-9]{32}$/i.test(hash)) {
                // MD5 antiguo
                const md5 = crypto.createHash('md5').update(passwordLimpia).digest('hex');
                esValida = md5 === hash;

                // Migrar a bcrypt si login correcto
                if (esValida) {
                    const nuevoHash = await bcrypt.hash(passwordLimpia, 12);

                    //probamos con update sin hooks para no rehashear
                    await usuario.update({ contrasenia: nuevoHash });
                    //console.log(`Usuario ${nombre_usuario} migrado a bcrypt`);
                }

            } else {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            if (!esValida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar JWT
            const token = jwt.sign(
                {
                    usuario_id: usuario.usuario_id,
                    nombre_usuario: usuario.nombre_usuario,
                    tipo_usuario: usuario.tipo_usuario
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                usuario: {
                    usuario_id: usuario.usuario_id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    nombre_usuario: usuario.nombre_usuario,
                    tipo_usuario: usuario.tipo_usuario,
                    celular: usuario.celular,
                    foto: usuario.foto
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
}

export default new AuthController();
