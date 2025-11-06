import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import NotificacionesDAO from "../database/NotificacionesDAO.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class NotificacionService {

    async enviarNotificacion(reserva, usuario) {
        try {
            // prepara la plantilla
            const plantillaPath = path.join(__dirname, '../utils/plantilla.hbs');
            const archivoHbs = await readFile(plantillaPath, 'utf-8');
            const template = handlebars.compile(archivoHbs);

            // buscamos los datos
            const salon = await NotificacionesDAO.getSalonInfo(reserva.salon_id);
            const turno = await NotificacionesDAO.getTurnoInfo(reserva.turno_id);
            const correosAdmins = await NotificacionesDAO.getAdminEmails();

            // html
            const html = template({
                fecha: reserva.fecha_reserva,
                salon: salon ? salon.titulo : 'Salón no encontrado',
                turno: turno ? `De ${turno.hora_desde}hs a ${turno.hora_hasta}hs` : 'Turno no encontrado'
            });

            // nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                }
            });

            const correoCliente = usuario.nombre_usuario?.trim();
            if (!correoCliente) {
                console.log('El cliente no tiene un correo válido.');
            }

            const mailCliente = {
                from: process.env.USER,
                to: correoCliente,
                subject: 'Confirmación de tu reserva',
                html
            };

            const mailAdmin = {
                from: process.env.USER,
                to: correosAdmins.join(','),
                subject: 'Nueva reserva realizada',
                html
            };

            // envía al cliente
            if (correoCliente && !correosAdmins.includes(correoCliente)) {
                await transporter.sendMail(mailCliente);
                console.log("Enviando correo al cliente:", correoCliente);
            } else {
                console.log("El cliente no tiene un correo válido o es admin, no se envía correo.");
            }

            // envía a Admins
            if (correosAdmins.length > 0) {
                await transporter.sendMail(mailAdmin);
                console.log("Enviando correo a administradores:", correosAdmins.join(', '));
            } else {
                console.warn('No hay administradores activos para notificación.');
            }

        } catch (err) {
            console.error('Error al enviar notificación:', err);
        }
    }

    enviarMensaje = async (datos) => {} 
    enviarWhatsapp = async (datos) => {} 
}