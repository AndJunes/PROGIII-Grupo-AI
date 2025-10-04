import { Sequelize } from 'sequelize';
import Reserva from './Reserva.js';
import ReservaServicio from './ReservaServicio.js';
import Usuario from './Usuario.js';
import Salon from './Salon.js';
import Servicio from './Servicio.js';
import Turno from './Turno.js';

const sequelize = new Sequelize('reservas', 'TU_USUARIO', 'TU_PASSWORD', {
    host: 'localhost',
    dialect: 'mysql',
});

// Relaciones Usuario ↔ Reserva
Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Relaciones Salon ↔ Reserva
Salon.hasMany(Reserva, { foreignKey: 'salon_id' });
Reserva.belongsTo(Salon, { foreignKey: 'salon_id' });

// Relaciones Turno ↔ Reserva
Turno.hasMany(Reserva, { foreignKey: 'turno_id' });
Reserva.belongsTo(Turno, { foreignKey: 'turno_id' });

// Relaciones Reserva ↔ Servicio (muchos a muchos)
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

export {
    sequelize,
    Usuario,
    Salon,
    Servicio,
    Turno,
    Reserva,
    ReservaServicio,
};
