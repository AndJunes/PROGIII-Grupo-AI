import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import ServiciosController from '../controllers/Servicios/ServiciosController.js';

const router = express.Router();

// Servicios
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ServiciosController.getByUser.bind(ServiciosController));
router.get('/all', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.getAll.bind(ServiciosController));
router.get('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.getById.bind(ServiciosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.create.bind(ServiciosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.update.bind(ServiciosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), ServiciosController.delete.bind(ServiciosController));

export default router;
