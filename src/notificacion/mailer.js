import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../database/database.js'

// __dirname equivalente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function enviarNotificacion(reserva, usuario, res = null) {
    try {
        const plantillaPath = path.join(__dirname, '../utils/plantilla.hbs');
        const archivoHbs = await readFile(plantillaPath, 'utf-8');
        const template = handlebars.compile(archivoHbs);

        //sacamos los datos del salon
        const [salonRows] = await pool.query('SELECT titulo FROM salones WHERE salon_id = ?', [reserva.salon_id]);
        const salon = salonRows[0];

        //sacamos los datos del turno
        const [turnoRows] = await pool.query('SELECT hora_desde, hora_hasta FROM turnos WHERE turno_id = ?', [reserva.turno_id]);
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

        const correoCliente = usuario.email;
        const correoAdmin = process.env.ADMIN_CORREO;

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
            to: correoAdmin,
            subject: 'Nueva reserva realizada',
            html
        };

        // Enviar al cliente solo si no es el admin
        if (correoCliente && correoCliente !== correoAdmin) {
            await transporter.sendMail(mailCliente);
        }

        // Enviar siempre al admin
        await transporter.sendMail(mailAdmin);

        console.log('Notificaciones enviadas correctamente');
    } catch (err) {
        console.error('Error al enviar notificación:', err);
        if (res) res.status(500).json({ error: "error al enviar notificacion"});

    }
}
