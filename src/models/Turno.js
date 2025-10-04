import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const Turno = sequelize.define('Turno', {
    turno_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hora_desde: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    hora_hasta: {
        type: DataTypes.TIME,
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
    tableName: 'turnos',
    timestamps: false,
});

export default Turno;
