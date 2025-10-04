const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');
const SalonesController = require('../controllers/Salones/SalonesController');

// Salones
router.get('/', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getAll.bind(SalonesController));
router.get('/:id', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getById.bind(SalonesController));
router.post('/', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.create.bind(SalonesController));
router.put('/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.update.bind(SalonesController));
router.delete('/:id', auth, roleCheck([ADMINISTRADOR]), SalonesController.delete.bind(SalonesController));

module.exports = router;
