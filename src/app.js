const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: __dirname + '/../.env' });

const routes = require('./routes/index');
const authRoutes = require('./routes/auth');

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
const key = fs.readFileSync(__dirname + '../../certs/server.key');
const cert = fs.readFileSync(__dirname + '../../certs/server.crt');

const PORT = process.env.PORT || 3006;

https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASS:', process.env.DB_PASS);
});
