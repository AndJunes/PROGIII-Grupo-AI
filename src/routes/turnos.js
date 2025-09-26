const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');
const TurnosController = require('../controllers/Turnos/TurnosController');

// Turnos
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getAll.bind(TurnosController));
router.get('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getById.bind(TurnosController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.create.bind(TurnosController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.update.bind(TurnosController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), TurnosController.delete.bind(TurnosController));

module.exports = router;
