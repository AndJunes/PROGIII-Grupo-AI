import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Salon from '../models/Salon.js';
import Servicio from '../models/Servicio.js';

// __dirname equivalente en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function enviarNotificacion(reserva, usuario) {
    try {
        const plantillaPath = path.join(__dirname, '../utils/plantilla.hbs');
        const archivoHbs = await readFile(plantillaPath, 'utf-8');
        const template = handlebars.compile(archivoHbs);

        const salon = await Salon.findByPk(reserva.salon_id);
        const turno = await Servicio.findByPk(reserva.turno_id);

        const html = template({
            fecha: reserva.fecha_reserva,
            salon: salon ? salon.titulo : 'Sin nombre',
            turno: turno ? turno.descripcion : 'Sin turno'
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });

        const correoCliente = usuario.email; // email del usuario que hizo la reserva
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
    }
}
