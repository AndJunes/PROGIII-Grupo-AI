import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import cors from "cors";

import routes from './routes/index.js';
import authRoutes from './routes/auth.js';

// __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de dotenv
dotenv.config({ path: __dirname + '/../.env' });

const app = express();
// Configurar CORS - MÁS FLEXIBLE PARA DESARROLLO
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'https://localhost:3006', 'http://localhost:3006'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


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
    //console.log('DB_USER:', process.env.DB_USER);
    //console.log('DB_PASS:', process.env.DB_PASS);
});
