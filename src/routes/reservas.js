const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');
const ReservaController = require('../controllers/Reservas/ReservaController');

// Reservas
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR, CLIENTE]), ReservaController.crear.bind(ReservaController));
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ReservaController.listar.bind(ReservaController));
router.put('/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.actualizar.bind(ReservaController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.eliminar.bind(ReservaController));
router.get('/all', auth, roleCheck([ADMINISTRADOR, EMPLEADO]), ReservaController.listarTodas.bind(ReservaController));

module.exports = router;
