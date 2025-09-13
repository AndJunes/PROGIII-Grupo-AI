const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('reservas', 'TU_USUARIO', 'TU_PASSWORD', {
  host: 'localhost',
  dialect: 'mysql',
});

const Reserva = require('./Reserva');
const ReservaServicio = require('./ReservaServicio');
const Usuario = require('./Usuario');
const Salon = require('./Salon');
const Servicio = require('./Servicio');
const Turno = require('./Turno');


Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });


Salon.hasMany(Reserva, { foreignKey: 'salon_id' });
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });


Turno.hasMany(Reserva, { foreignKey: 'turno_id' });
Reserva.belongsTo(Turno, { foreignKey: 'turno_id' });


Reserva.belongsToMany(Servicio, {
  through: ReservaServicio,
  foreignKey: 'reserva_id',
  otherKey: 'servicio_id',
});
Servicio.belongsToMany(Reserva, {
  through: ReservaServicio,
  foreignKey: 'servicio_id',
  otherKey: 'reserva_id',
});


module.exports = {
  sequelize,
  Usuario,
  Salon,
  Servicio,
  Turno,
  Reserva,
  ReservaServicio,
};
