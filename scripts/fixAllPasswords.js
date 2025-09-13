require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const fixAllPasswords = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Lista de usuarios a actualizar
    const usersToUpdate = [
      { username: 'admin', password: 'admin123', type: 3 },
      { username: 'empleado1', password: 'password123', type: 2 },
      { username: 'cliente1', password: 'password123', type: 1 }
    ];

    for (const user of usersToUpdate) {
      let usuario = await Usuario.findOne({ where: { nombre_usuario: user.username } });
      
      if (!usuario) {
        console.log(`Creando usuario: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        usuario = await Usuario.create({
          nombre: user.username.charAt(0).toUpperCase() + user.username.slice(1),
          apellido: 'Usuario',
          nombre_usuario: user.username,
          contrasenia: hashedPassword,
          tipo_usuario: user.type,
          celular: '000000000',
          activo: 1
        });
        
        console.log(`✅ Usuario ${user.username} creado`);
      } else {
        console.log(`Actualizando usuario: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await usuario.update({
          contrasenia: hashedPassword,
          activo: 1
        });
        console.log(`✅ Contraseña de ${user.username} actualizada`);
      }

      // Verificar que la contraseña funciona
      const isValid = await bcrypt.compare(user.password, usuario.contrasenia);
      console.log(`🔐 Contraseña verificada: ${isValid ? '✅' : '❌'}`);
    }

    console.log('\n=== CREDENCIALES FINALES ===');
    console.log('Administrador: admin / admin123');
    console.log('Empleado: empleado1 / password123');
    console.log('Cliente: cliente1 / password123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

fixAllPasswords();