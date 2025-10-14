import express from 'express';
import apicache from 'apicache';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import TurnosController from '../controllers/Turnos/TurnosController.js';

const router = express.Router();
const cache = apicache.middleware;

// Turnos
router.get('/', cache('5 minutes'), auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getAll.bind(TurnosController));
router.get('/:id', cache('5 minutes'), auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getById.bind(TurnosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.create.bind(TurnosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.update.bind(TurnosController));
router.delete('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.delete.bind(TurnosController));

export default router;
