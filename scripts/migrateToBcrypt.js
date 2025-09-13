require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const migrateToBcrypt = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Obtener todos los usuarios
    const usuarios = await Usuario.findAll();

    console.log(`Migrando ${usuarios.length} usuarios a bcrypt...`);

    for (const usuario of usuarios) {
      // Si la contraseña tiene 32 caracteres (MD5), resetearla
      if (usuario.contrasenia && usuario.contrasenia.length === 32) {
        const newPassword = 'password123'; // Contraseña por defecto
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await usuario.update({
          contrasenia: hashedPassword
        });

        console.log(`✅ ${usuario.nombre_usuario} migrado a bcrypt`);
        console.log(`   Nueva contraseña: ${newPassword}`);
      }
    }

    console.log('\n=== MIGRACIÓN COMPLETADA ===');
    console.log('Todos los usuarios ahora usan: password123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

migrateToBcrypt();