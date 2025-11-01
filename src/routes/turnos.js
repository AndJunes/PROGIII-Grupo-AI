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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Turno Mañana"
 *               hora_inicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-01T08:00:00Z"
 *               hora_fin:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-01T12:00:00Z"
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 */
router.post(
  '/',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es obligatorio')
      .isString()
      .withMessage('El nombre debe ser texto'),
    body('hora_inicio')
      .notEmpty()
      .withMessage('La hora de inicio es obligatoria')
      .isISO8601()
      .withMessage('Debe ser una fecha válida'),
    body('hora_fin')
      .notEmpty()
      .withMessage('La hora de fin es obligatoria')
      .isISO8601()
      .withMessage('Debe ser una fecha válida'),
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               hora_inicio:
 *                 type: string
 *                 format: date-time
 *               hora_fin:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Turno actualizado
 */
router.put(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    body('nombre').optional().isString().withMessage('Debe ser texto'),
    body('hora_inicio').optional().isISO8601().withMessage('Debe ser una fecha válida'),
    body('hora_fin').optional().isISO8601().withMessage('Debe ser una fecha válida'),
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
