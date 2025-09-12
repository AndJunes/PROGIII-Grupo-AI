const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Usuario = sequelize.define('Usuario', {
  usuario_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  nombre_usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  contrasenia: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tipo_usuario: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  celular: {
    type: DataTypes.STRING(20),
  },
  foto: {
    type: DataTypes.STRING(255),
  },
  activo: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  creado: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  modificado: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;
