import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import SalonesController from '../controllers/Salones/SalonesController.js';

const router = express.Router();

// Salones
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getAll.bind(SalonesController));
router.get('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getById.bind(SalonesController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.create.bind(SalonesController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.update.bind(SalonesController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), SalonesController.delete.bind(SalonesController));

export default router;
