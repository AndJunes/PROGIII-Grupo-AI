const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Reserva = sequelize.define('Reserva', {
  reserva_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  salon_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  foto_cumpleaniero: {
    type: DataTypes.STRING(255),
  },
  tematica: {
    type: DataTypes.STRING(255),
  },
  importe_salon: {
    type: DataTypes.DECIMAL(10, 2),
  },
  importe_total: {
    type: DataTypes.DECIMAL(10, 2),
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
  tableName: 'reservas',
  timestamps: false,
});

module.exports = Reserva;
