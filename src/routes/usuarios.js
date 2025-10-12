import express from 'express';
import apicache from 'apicache';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import UsuariosController from '../controllers/Usuarios/UsuariosController.js';

const router = express.Router();
const cache = apicache.middleware;

// Usuarios
router.get('/', cache('5 minutes'), auth, roleCheck([ADMINISTRADOR]), UsuariosController.getAll.bind(UsuariosController));
// Solo empleado o admin pueden listar clientes
router.get('/clientes', cache('5 minutes'), auth, roleCheck([EMPLEADO, ADMINISTRADOR]), UsuariosController.getClientes.bind(UsuariosController));
router.get('/:id', cache('5 minutes'), auth, roleCheck([ADMINISTRADOR]), UsuariosController.getById.bind(UsuariosController));
router.post('/', auth, roleCheck([ADMINISTRADOR]), UsuariosController.create.bind(UsuariosController));
router.put('/:id', auth, roleCheck([ADMINISTRADOR]), UsuariosController.update.bind(UsuariosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), UsuariosController.delete.bind(UsuariosController));

export default router;
