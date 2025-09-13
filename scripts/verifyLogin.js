require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const verifyLogin = async () => {
  try {
    await sequelize.authenticate();
    
    const testUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'empleado1', password: 'password123' },
      { username: 'cliente1', password: 'password123' }
    ];

    console.log('=== VERIFICACIÓN DE LOGIN ===');

    for (const test of testUsers) {
      const usuario = await Usuario.findOne({ where: { nombre_usuario: test.username } });
      
      if (!usuario) {
        console.log(`❌ Usuario ${test.username} no encontrado`);
        continue;
      }

      const isValid = await bcrypt.compare(test.password, usuario.contrasenia);
      
      if (isValid) {
        console.log(`✅ ${test.username} / ${test.password} -> CORRECTO`);
      } else {
        console.log(`❌ ${test.username} / ${test.password} -> INCORRECTO`);
        console.log(`   Hash almacenado: ${usuario.contrasenia}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

verifyLogin();