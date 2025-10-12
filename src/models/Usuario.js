import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import bcrypt from 'bcryptjs';

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
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.contrasenia) {
                //const salt = await bcrypt.genSalt(10);
                usuario.contrasenia = await bcrypt.hash(usuario.contrasenia, 10);
            }
        },
        //Esto tenia conflictos a la hora de migrar el hasheo de MD5 a Bcrypt
        /*beforeUpdate: async (usuario) => {
            if (usuario.changed('contrasenia')) {
                const salt = await bcrypt.genSalt(10);
                usuario.contrasenia = await bcrypt.hash(usuario.contrasenia, salt);
            }
        }*/
    }
});

export default Usuario;
