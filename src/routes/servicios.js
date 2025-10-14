import express from 'express';
import apicache from 'apicache';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import ServiciosController from '../controllers/Servicios/ServiciosController.js';

const router = express.Router();
const cache = apicache.middleware;

// Servicios
router.get('/', cache('5 minutes'), auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ServiciosController.getAll.bind(ServiciosController));
router.get('/:id', cache('5 minutes'), auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.getById.bind(ServiciosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.create.bind(ServiciosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.update.bind(ServiciosController));
router.delete('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.delete.bind(ServiciosController));

export default router;
