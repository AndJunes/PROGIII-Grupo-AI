import pool from "../database/database.js"


class SalonesService {
    async getALL() {
        const [rows] = await pool.execute('SELECT * FROM Salones WHERE activo = 1');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.execute('SELECT * FROM Salones WHERE salon_id = ? AND activo = 1', [id]);
        if (rows.length === 0) throw new Error('no se encontro o esta eliminado');
        return rows[0];
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

        if (campos.length === 0) throw new Error("No hay campos para actualizar");

        valores.push(id);

        const [result] = await pool.execute(
            `UPDATE salones SET ${campos.join(", ")} WHERE salon_id = ?`,
            valores
        );

        if (result.affectedRows === 0) throw new Error("No se encontró el salón");
        return { salon_id: id, ...data };
    }



    async delete(id) {
        //soft delete
        await pool.execute('UPDATE salones SET activo = 0 WHERE salon_id = ?', [id]);

        //soft delete para reservas que esten asociadas
        await pool.execute('UPDATE reservas SET activo = 0 WHERE salon_id = ?', [id]);

        return { message: "Salón y reservas asociadas eliminadas correctamente." };
    }
}

export default new SalonesService();