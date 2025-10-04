import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const Salon = sequelize.define('Salon', {
    salon_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 8),
    },
    longitud: {
        type: DataTypes.DECIMAL(11, 8),
    },
    capacidad: {
        type: DataTypes.INTEGER,
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
    tableName: 'salones',
    timestamps: false,
});

export default Salon;
