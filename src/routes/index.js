import express from 'express';

import salonesRoutes from './salones.js';
import reservasRoutes from './reservas.js';
import serviciosRoutes from './servicios.js';
import turnosRoutes from './turnos.js';
import usuariosRoutes from './usuarios.js';
import auditoriaRoutes from './auditoria.js';

const router = express.Router();

// Enlazar cada grupo de rutas
router.use('/salones', salonesRoutes);
router.use('/reservas', reservasRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/turnos', turnosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/auditoria', auditoriaRoutes);

export default router;
