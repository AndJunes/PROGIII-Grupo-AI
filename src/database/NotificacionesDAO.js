import pool from './database.js';

class NotificacionDAO {

    //busca el nombre de un salón por su ID.
    async getSalonInfo(salon_id) {
        try {
            const [rows] = await pool.query(
                'SELECT titulo FROM salones WHERE salon_id = ?',
                [salon_id]
            );
            return rows[0];
        } catch (error) {
            console.error("Error en NotificacionDAO.getSalonInfo:", error);
            return null;
        }
    }

    //busca las horas de un turno por su ID
    async getTurnoInfo(turno_id) {
        try {
            const [rows] = await pool.query(
                'SELECT hora_desde, hora_hasta FROM turnos WHERE turno_id = ?',
                [turno_id]
            );
            return rows[0];
        } catch (error) {
            console.error("Error en NotificacionDAO.getTurnoInfo:", error);
            return null;
        }
    }

    //obtiene la lista de correos de todos los admins activos.
    async getAdminEmails() {
        try {
            const [admins] = await pool.query(
                'SELECT nombre_usuario FROM usuarios WHERE tipo_usuario = 1 AND activo = 1'
            );
            return admins.map(a => a.nombre_usuario);
        } catch (error) {
            console.error("Error en NotificacionDAO.getAdminEmails:", error);
            return [];
        }
    }
}

export default new NotificacionDAO();