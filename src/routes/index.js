const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');

// Controllers Salones
const SalonesController = require('../controllers/Salones/SalonesController');
const ReservaController = require('../controllers/Reservas/ReservaController');
const ServiciosController = require('../controllers/Servicios/ServiciosController');

// Rutas de Salones
router.get('/salones', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), SalonesController.getAll.bind(SalonesController));
router.post('/salones', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.create.bind(SalonesController));
router.put('/salones/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), SalonesController.update.bind(SalonesController));
router.delete('/salones/:id', auth, roleCheck([ADMINISTRADOR]), SalonesController.delete.bind(SalonesController));

//Rutas de Reservas
router.post('/reservas', auth, roleCheck([EMPLEADO, ADMINISTRADOR, CLIENTE]), ReservaController.crear.bind(ReservaController));
router.get('/reservas', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ReservaController.listar.bind(ReservaController));
router.put('/reservas/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.actualizar.bind(ReservaController));
router.delete('/reservas/:id', auth, roleCheck([ADMINISTRADOR]), ReservaController.eliminar.bind(ReservaController));
//GET especifico para Administrador y Empleado
router.get('/reservas/all', auth, roleCheck([ADMINISTRADOR, EMPLEADO]), ReservaController.listarTodas.bind(ReservaController));


//Rustas de Servicios
router.get('/servicios/all', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.getAll.bind(ServiciosController));
router.get('/servicios', auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), ServiciosController.getByUser.bind(ServiciosController));
router.post('/servicios', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.create.bind(ServiciosController));
router.put('/servicios/:id', auth, roleCheck([EMPLEADO, ADMINISTRADOR]), ServiciosController.update.bind(ServiciosController));
router.delete('/servicios/:id', auth, roleCheck([ADMINISTRADOR]), ServiciosController.delete.bind(ServiciosController));



module.exports = router;
