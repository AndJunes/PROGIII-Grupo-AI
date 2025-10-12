import express from 'express';
import apicache from 'apicache';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import ReservaController from '../controllers/Reservas/ReservaController.js';

const router = express.Router();
const cache = apicache.middleware;

// Reservas
router.post('/', auth, roleCheck([ADMINISTRADOR, CLIENTE]), ReservaController.crear.bind(ReservaController));
router.get('/', cache('5 minutes'), auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ReservaController.listar.bind(ReservaController));
router.get('/all', cache('5 minutes'), auth, roleCheck([ADMINISTRADOR, EMPLEADO]), ReservaController.listarTodas.bind(ReservaController));
router.get('/:id', cache('5 minutes'), auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ReservaController.obtenerPorId.bind(ReservaController));
router.put('/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.actualizar.bind(ReservaController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.eliminar.bind(ReservaController));

export default router;
