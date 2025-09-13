require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

const createTestUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Usuarios de prueba
    const testUsers = [
      {
        nombre: 'Admin',
        apellido: 'Sistema',
        nombre_usuario: 'admin',
        contrasenia: 'admin123',
        tipo_usuario: 3,
        celular: '1234567890',
        activo: 1
      },
      {
        nombre: 'Empleado',
        apellido: 'Test',
        nombre_usuario: 'empleado',
        contrasenia: 'password123',
        tipo_usuario: 2,
        celular: '0987654321',
        activo: 1
      },
      {
        nombre: 'Cliente',
        apellido: 'Test',
        nombre_usuario: 'cliente',
        contrasenia: 'password123',
        tipo_usuario: 1,
        celular: '5555555555',
        activo: 1
      }
    ];

    for (const userData of testUsers) {
      // Verificar si el usuario ya existe
      const existingUser = await Usuario.findOne({ 
        where: { nombre_usuario: userData.nombre_usuario } 
      });

      if (existingUser) {
        console.log(`⚠️  Usuario ${userData.nombre_usuario} ya existe, actualizando...`);
        
        // Hashear la contraseña manualmente (porque el hook no se ejecuta en update)
        const hashedPassword = await bcrypt.hash(userData.contrasenia, 10);
        await existingUser.update({
          contrasenia: hashedPassword,
          activo: 1
        });
        
        console.log(`✅ Usuario ${userData.nombre_usuario} actualizado`);
      } else {
        console.log(`➕ Creando usuario: ${userData.nombre_usuario}`);
        
        // Crear nuevo usuario (el hook se ejecutará automáticamente)
        await Usuario.create(userData);
        console.log(`✅ Usuario ${userData.nombre_usuario} creado`);
      }
    }

    console.log('\n=== USUARIOS DE PRUEBA CREADOS ===');
    console.log('Administrador: admin / admin123');
    console.log('Empleado: empleado / password123');
    console.log('Cliente: cliente / password123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

createTestUsers();