import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createObjectCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// logica del informe
class InformeService {

    async informeReservasCsv(datos) {
        
        const filePath = path.join(__dirname, '..', 'utils', 'reporte_temporal.csv');

        // configura las columnas del CSV 
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'fecha_reserva', title: 'Fecha Reserva' },
                { id: 'tematica', title: 'Temática' },
                { id: 'hora_desde', title: 'Desde' },
                { id: 'hora_hasta', title: 'Hasta' },
                { id: 'salon_titulo', title: 'Salón' },
                { id: 'salon_direccion', title: 'Dirección' },
                { id: 'cliente_nombre', title: 'Cliente Nombre' },
                { id: 'cliente_apellido', title: 'Cliente Apellido' },
                { id: 'servicio_descripcion', title: 'Servicio' },
                { id: 'servicio_importe', title: 'Importe Servicio' },
            ]
        });

        await csvWriter.writeRecords(datos);
        return filePath;
    }

    async informeReservasPdf(datos) {
        try {
            const plantillaPath = path.join(__dirname, '..', 'utils', 'informe.hbs');
            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            
            // handlebars compila
            const template = handlebars.compile(plantillaHtml);
            const htmlCompleto = template({ reservas: datos });

            // pupeteer
            const browser = await puppeteer.launch({ 
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // cargamos los datos
            await page.setContent(htmlCompleto, { waitUntil: 'networkidle0' });

            // va el pdf
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            return pdfBuffer;

        } catch (error) {
            console.error("Error generando PDF con Puppeteer:", error);
            throw new Error("Error al generar el PDF");
        }
    }
}

export default new InformeService();