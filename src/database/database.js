import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

try {
    const conn = await pool.getConnection();
    console.log("Conexión MySQL exitosa");
    conn.release();
} catch (error) {
    console.error("Error conectando a MySQL:", error);
}

export default pool;
