import express from 'express';
import apicache from 'apicache';
import { body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import validar from '../middleware/validar.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import TurnosController from '../controllers/Turnos/TurnosController.js';

const router = express.Router();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     tags: [Turnos]
 *     summary: Obtener todos los turnos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los turnos
 */
router.get(
  '/',
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  TurnosController.getAll.bind(TurnosController)
);

/**
 * @swagger
 * /api/turnos/{id}:
 *   get:
 *     tags: [Turnos]
 *     summary: Obtener un turno por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del turno
 */
router.get(
  '/:id',
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número entero')],
  validar,
  TurnosController.getById.bind(TurnosController)
);

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     tags: [Turnos]
 *     summary: Crear un nuevo turno
 *     description: Crea un turno nuevo especificando el orden y el rango horario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 example: "10:00:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "15:00:00"
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    body('orden')
      .notEmpty()
      .withMessage('El orden es obligatorio')
      .isInt()
      .withMessage('El orden debe ser un número entero'),
    body('hora_desde')
      .notEmpty()
      .withMessage('La hora de inicio es obligatoria')
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage('Debe tener formato HH:MM:SS'),
    body('hora_hasta')
      .notEmpty()
      .withMessage('La hora de fin es obligatoria')
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage('Debe tener formato HH:MM:SS'),
  ],
  validar,
  TurnosController.create.bind(TurnosController)
);


/**
 * @swagger
 * /api/turnos/{id}:
 *   put:
 *     tags: [Turnos]
 *     summary: Actualizar un turno existente
 *     description: Permite modificar los datos de un turno existente como el orden, horario o estado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 2
 *               hora_desde:
 *                 type: string
 *                 example: "16:00:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "20:00:00"
 *               activo:
 *                 type: integer
 *                 description: 1 = activo, 0 = inactivo
 *                 example: 1
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Turno no encontrado
 */
router.put(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    body('orden').optional().isInt().withMessage('El orden debe ser un número entero'),
    body('hora_desde')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage('La hora de inicio debe tener formato HH:MM:SS'),
    body('hora_hasta')
      .optional()
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage('La hora de fin debe tener formato HH:MM:SS'),
    body('activo')
      .optional()
      .isIn([0, 1])
      .withMessage('El campo activo debe ser 0 o 1'),
  ],
  validar,
  TurnosController.update.bind(TurnosController)
);


/**
 * @swagger
 * /api/turnos/{id}:
 *   delete:
 *     tags: [Turnos]
 *     summary: Eliminar un turno
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno eliminado
 */
router.delete(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número entero')],
  validar,
  TurnosController.delete.bind(TurnosController)
);


export default router;
