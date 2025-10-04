import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa');
    } catch (error) {
        console.error('Error en la conexión', error);
    }
}

testConnection();

export default sequelize;
