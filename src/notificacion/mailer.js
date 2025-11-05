import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function enviarNotificacion(reserva, usuario, res = null) {
    try {
        const plantillaPath = path.join(__dirname, '../utils/plantilla.hbs');
        const archivoHbs = await readFile(plantillaPath, 'utf-8');
        const template = handlebars.compile(archivoHbs);

        // Datos del salón
        const [salonRows] = await pool.query(
            'SELECT titulo FROM salones WHERE salon_id = ?',
            [reserva.salon_id]
        );
        const salon = salonRows[0];

        // Datos del turno
        const [turnoRows] = await pool.query(
            'SELECT hora_desde, hora_hasta FROM turnos WHERE turno_id = ?',
            [reserva.turno_id]
        );
        const turno = turnoRows[0];

        const html = template({
            fecha: reserva.fecha_reserva,
            salon: salon ? salon.titulo : 'Sin nombre',
            turno: turno ? `De ${turno.hora_desde}hs a ${turno.hora_hasta}hs` : 'Sin turno'
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        // Correo del cliente (aquí asumimos que nombre_usuario contiene el email)
        const correoCliente = usuario.nombre_usuario?.trim();
        if (!correoCliente) {
            console.log('El cliente no tiene un correo válido.');
        }

        // Correos de los administradores activos
        const [admins] = await pool.query(
            'SELECT nombre_usuario FROM usuarios WHERE tipo_usuario = 1 AND activo = 1'
        );
        const correosAdmins = admins.map(a => a.nombre_usuario);

        // Opciones del correo cliente
        const mailCliente = {
            from: process.env.USER,
            to: correoCliente,
            subject: 'Confirmación de tu reserva',
            html
        };

        // Opciones del correo admin
        const mailAdmin = {
            from: process.env.USER,
            to: correosAdmins.join(','),
            subject: 'Nueva reserva realizada',
            html
        };

        // Enviar al cliente solo si tiene correo y no es admin
        if (correoCliente && !correosAdmins.includes(correoCliente)) {
            console.log("Enviando correo al cliente:", correoCliente);
            await transporter.sendMail(mailCliente);
        } else {
            console.log("El cliente no tiene un correo válido o es admin, no se envía correo.");
        }

        // Enviar siempre a todos los administradores
        if (correosAdmins.length > 0) {
            console.log("Enviando correo a administradores:", correosAdmins.join(', '));
            await transporter.sendMail(mailAdmin);
        } else {
            console.warn('No hay administradores activos para notificación.');
        }

        console.log('Notificaciones enviadas correctamente');
    } catch (err) {
        console.error('Error al enviar notificación:', err);
        if (res) res.status(500).json({ error: "error al enviar notificacion" });
    }
}
