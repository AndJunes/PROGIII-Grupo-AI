import jwt from 'jsonwebtoken';
import pool from '../database/database.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Buscarlo directamente en la db
        const [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE usuario_id = ? AND activo = 1 LIMIT 1",
            [decoded.usuario_id]
        );

        const usuario = rows[0];
        if (!usuario) {
            return res.status(401).json({ error: 'Token inválido o usuario no encontrado' });
        }

        //guardamos el usuario en la request
        req.usuario = {
            usuario_id: usuario.usuario_id,
            tipo_usuario: usuario.tipo_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            nombre_usuario: usuario.nombre_usuario,
            email: usuario.email || null,
        };

        
        next();
    } catch (error) {
        console.error('Error en middleware auth: ', error);
        res.status(400).json({ error: 'Token inválido o expirado' });
    }
};

export default auth;
