const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');

// Controllers Salones
const SalonesController = require('../controllers/Salones/SalonesController');
const ReservaController = require('../controllers/Salones/ReservaController')

// Rutas de Salones
router.get('/salones', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getAll.bind(SalonesController));
router.post('/salones', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.create.bind(SalonesController));
router.put('/salones/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.update.bind(SalonesController));
router.delete('/salones/:id', auth, roleCheck([ADMINISTRADOR]), SalonesController.delete.bind(SalonesController));

//Rutas de Reservas
router.post('/reservas', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ReservaController.crear.bind(ReservaController));
router.get('/reservas', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ReservaController.listar.bind(ReservaController));



module.exports = router;
