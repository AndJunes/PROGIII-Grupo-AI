const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  async login(req, res) {
    try {
      const { nombre_usuario, contrasenia } = req.body;

      if (!nombre_usuario || !contrasenia) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
      }

      const usuario = await Usuario.findOne({ where: { nombre_usuario } });

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const esContraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);

      if (!esContraseniaValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

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
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
}

module.exports = new AuthController();