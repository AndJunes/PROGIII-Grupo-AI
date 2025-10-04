import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import routes from './routes/index.js';
import authRoutes from './routes/auth.js';

// __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de dotenv
dotenv.config({ path: __dirname + '/../.env' });

const app = express();

// Seguridad
app.use(helmet());

// Parseo de JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs
app.use(morgan('dev'));

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/api', routes);

// HTTPS credentials (archivos locales)
const key = fs.readFileSync(path.join(__dirname, '../certs/server.key'));
const cert = fs.readFileSync(path.join(__dirname, '../certs/server.crt'));

const PORT = process.env.PORT || 3006;

https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASS:', process.env.DB_PASS);
});
