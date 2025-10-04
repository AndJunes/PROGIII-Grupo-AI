import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const ReservaServicio = sequelize.define('ReservaServicio', {
    reserva_servicio_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reserva_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    servicio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    importe: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
    tableName: 'reservas_servicios',
    timestamps: false,
});

export default ReservaServicio;
