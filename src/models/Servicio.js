const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Servicio = sequelize.define('Servicio', {
  servicio_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
  tableName: 'servicios',
  timestamps: false,
});

module.exports = Servicio;
