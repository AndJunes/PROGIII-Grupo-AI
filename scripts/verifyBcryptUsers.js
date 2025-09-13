require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const verifyBcryptUsers = async () => {
  try {
    await sequelize.authenticate();

    // Verificar usuarios de prueba
    const testUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'empleado', password: 'password123' },
      { username: 'cliente', password: 'password123' }
    ];

    console.log('=== VERIFICACIÓN DE USUARIOS BCRYPT ===');

    for (const test of testUsers) {
      const usuario = await Usuario.findOne({ where: { nombre_usuario: test.username } });
      
      if (!usuario) {
        console.log(`❌ Usuario ${test.username} no encontrado`);
        continue;
      }

      console.log(`\n🔍 Verificando: ${test.username}`);
      console.log(`   Hash almacenado: ${usuario.contrasenia}`);
      console.log(`   Longitud hash: ${usuario.contrasenia.length}`);

      const isValid = await bcrypt.compare(test.password, usuario.contrasenia);
      
      if (isValid) {
        console.log(`✅ ${test.username} / ${test.password} -> CORRECTO`);
      } else {
        console.log(`❌ ${test.username} / ${test.password} -> INCORRECTO`);
      }
    }

    // Verificar algunos usuarios existentes
    console.log('\n=== VERIFICACIÓN DE USUARIOS EXISTENTES ===');
    const existingUsers = await Usuario.findAll({ limit: 3 });
    
    for (const usuario of existingUsers) {
      console.log(`\n🔍 Usuario: ${usuario.nombre_usuario}`);
      console.log(`   Hash: ${usuario.contrasenia}`);
      console.log(`   Longitud: ${usuario.contrasenia.length}`);
      
      const isValid = await bcrypt.compare('password123', usuario.contrasenia);
      console.log(`   Contraseña "password123" válida: ${isValid ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

verifyBcryptUsers();