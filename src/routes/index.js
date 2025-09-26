const express = require('express');
const router = express.Router();

// Importar rutas por recurso
const salonesRoutes = require('./salones');
const reservasRoutes = require('./reservas');
const serviciosRoutes = require('./servicios');
const turnosRoutes = require('./turnos');
const usuariosRoutes = require('./usuarios');

// Enlazar cada grupo de rutas
router.use('/salones', salonesRoutes);
router.use('/reservas', reservasRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/turnos', turnosRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;
