require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const debugPasswords = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Obtener todos los usuarios con sus contraseñas
    const usuarios = await Usuario.findAll({
      attributes: ['usuario_id', 'nombre', 'apellido', 'nombre_usuario', 'contrasenia', 'tipo_usuario']
    });

    console.log('\n=== DEBUG DE CONTRASEÑAS ===');
    
    for (const usuario of usuarios) {
      console.log('\n---');
      console.log('Usuario:', usuario.nombre_usuario);
      console.log('Contraseña en DB:', usuario.contrasenia);
      console.log('Longitud hash:', usuario.contrasenia ? usuario.contrasenia.length : 'null');
      
      // Probar con diferentes contraseñas
      const passwordsToTest = ['admin123', 'password123', '123456', 'admin', 'password'];
      
      for (const password of passwordsToTest) {
        const isValid = usuario.contrasenia ? await bcrypt.compare(password, usuario.contrasenia) : false;
        if (isValid) {
          console.log(`✅ Contraseña correcta encontrada: "${password}"`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

debugPasswords();