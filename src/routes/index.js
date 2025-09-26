const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { CLIENTE, EMPLEADO, ADMINISTRADOR } = require('../constants/roles');

// Controllers Salones
const SalonesController = require('../controllers/Salones/SalonesController');
const ReservaController = require('../controllers/Reservas/ReservaController');
const ServiciosController = require('../controllers/Servicios/ServiciosController');
const TurnosController = require('../controllers/Turnos/TurnosController');
const UsuariosController = require('../controllers/Usuarios/UsuariosController');

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

//Rutas de Turnos
router.get("/turnos", auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getAll.bind(TurnosController));
router.get("/turnos/:id", auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), TurnosController.getById.bind(TurnosController));
router.post("/turnos", auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.create.bind(TurnosController));
router.put("/turnos/:id", auth, roleCheck([EMPLEADO, ADMINISTRADOR]), TurnosController.update.bind(TurnosController));
router.delete("/turnos/:id", auth, roleCheck([ADMINISTRADOR]), TurnosController.delete.bind(TurnosController));


//Rutas de Usuarios
router.get("/usuarios", auth, roleCheck([ADMINISTRADOR]), UsuariosController.getAll.bind(UsuariosController));
// Obtener usuario por ID (admin y empleado pueden consultar datos, cliente solo su perfil)
router.get("/usuarios/:id", auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), UsuariosController.getById.bind(UsuariosController));
// Crear usuario (admin puede crear cualquier, registro cliente si querés habilitarlo en público)
router.post("/usuarios", auth, roleCheck([ADMINISTRADOR]), UsuariosController.create.bind(UsuariosController));
// Actualizar usuario (admin puede todos, cliente solo el suyo)
router.put("/usuarios/:id", auth, roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]), UsuariosController.update.bind(UsuariosController));
// Eliminar usuario (soft delete, solo admin)
router.delete("/usuarios/:id", auth, roleCheck([ADMINISTRADOR]), UsuariosController.delete.bind(UsuariosController));


module.exports = router;
