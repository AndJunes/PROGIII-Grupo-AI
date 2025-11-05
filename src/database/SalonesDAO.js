import pool from "../database/database.js";

class SalonesDAO {
    async findAll() {
        const [rows] = await pool.execute('SELECT * FROM salones WHERE activo = 1');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM salones WHERE salon_id = ? AND activo = 1',
            [id]
        );
        return rows[0] || null;
    }

    async create(data) {
        const { titulo, direccion, importe, capacidad, latitud, longitud } = data;
        const [result] = await pool.execute(
            'INSERT INTO salones (titulo, direccion, importe, capacidad, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo, direccion, importe, capacidad, latitud, longitud]
        );
        return { salon_id: result.insertId, ...data };
    }

    async update(id, data) {
        const campos = [];
        const valores = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        }

        if (campos.length === 0) return null;

        valores.push(id);

        const [result] = await pool.execute(
            `UPDATE salones SET ${campos.join(", ")} WHERE salon_id = ?`,
            valores
        );

        return result.affectedRows > 0 ? { salon_id: id, ...data } : null;
    }

    async softDelete(id) {
        await pool.execute('UPDATE salones SET activo = 0 WHERE salon_id = ?', [id]);
        await pool.execute('UPDATE reservas SET activo = 0 WHERE salon_id = ?', [id]);
        return { message: "Salón y reservas asociadas eliminadas correctamente." };
    }
}

export default new SalonesDAO();
