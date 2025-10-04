import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import TurnosController from '../controllers/Turnos/TurnosController.js';

const router = express.Router();

// Turnos
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getAll.bind(TurnosController));
router.get('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getById.bind(TurnosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.create.bind(TurnosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.update.bind(TurnosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), TurnosController.delete.bind(TurnosController));

export default router;
