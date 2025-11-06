import pool from "../database/database.js";

class SalonesDAO {
    async findAllWithFilters({ pagina = 1, limite = 10, orden = 'salon_id', direccion = 'ASC', filtro_titulo = '' }) {
        let sql = `SELECT * FROM salones WHERE activo = 1`;
        const params = [];

        if (filtro_titulo) {
            sql += ` AND titulo LIKE ?`;
            params.push(`%${filtro_titulo}%`);
        }

        const columnasPermitidas = ['salon_id', 'titulo', 'importe', 'capacidad'];
        const direccionPermitida = direccion.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const ordenFinal = columnasPermitidas.includes(orden) ? orden : 'salon_id';
        sql += ` ORDER BY ${ordenFinal} ${direccionPermitida}`;

        const limit = Number(limite);
        const offset = (Number(pagina) - 1) * limit;

        if (Number.isFinite(limit) && Number.isFinite(offset)) {
            sql += ` LIMIT ${limit} OFFSET ${offset}`;
        }

        const [rows] = await pool.execute(sql, params);
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
