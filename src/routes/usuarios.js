const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');
const UsuariosController = require('../controllers/Usuarios/UsuariosController');

// Usuarios
router.get('/', auth, roleCheck([ADMINISTRADOR]), UsuariosController.getAll.bind(UsuariosController));
//Solo empleado o admin pueden listar clientes
router.get('/clientes', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), UsuariosController.getClientes.bind(UsuariosController));
router.get('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), UsuariosController.getById.bind(UsuariosController));
router.post('/', auth, roleCheck([ADMINISTRADOR]), UsuariosController.create.bind(UsuariosController));
router.put('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), UsuariosController.update.bind(UsuariosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), UsuariosController.delete.bind(UsuariosController));

module.exports = router;
