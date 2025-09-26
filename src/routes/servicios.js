const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');
const ServiciosController = require('../controllers/Servicios/ServiciosController');

// Servicios
router.get('/all', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.getAll.bind(ServiciosController));
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ServiciosController.getByUser.bind(ServiciosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.create.bind(ServiciosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.update.bind(ServiciosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), ServiciosController.delete.bind(ServiciosController));

module.exports = router;
