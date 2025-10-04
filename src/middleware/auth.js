import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findByPk(decoded.usuario_id);

        if (!usuario) {
            return res.status(401).json({ error: 'Token inválido.' });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};

export default auth;
