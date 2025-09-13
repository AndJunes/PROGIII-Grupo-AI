require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../src/database/database');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcryptjs');

// Definir constantes de roles aquí mismo para evitar problemas de importación
const ROLES = {
  CLIENTE: 1,
  EMPLEADO: 2,
  ADMINISTRADOR: 3
};

const createAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Verificar si ya existe un administrador
    const adminExists = await Usuario.findOne({ 
      where: { tipo_usuario: ROLES.ADMINISTRADOR } 
    });

    if (adminExists) {
      console.log('Ya existe un usuario administrador.');
      return;
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await Usuario.create({
      nombre: 'Admin',
      apellido: 'Istrador',
      nombre_usuario: 'admin',
      contrasenia: hashedPassword,
      tipo_usuario: ROLES.ADMINISTRADOR,
      celular: '000000000',
      activo: 1
    });

    console.log('Usuario administrador creado:');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    console.log('¡Cambia la contraseña después del primer inicio de sesión!');
  } catch (error) {
    console.error('Error al crear usuario administrador:', error);
  } finally {
    await sequelize.close();
  }
};

createAdminUser();