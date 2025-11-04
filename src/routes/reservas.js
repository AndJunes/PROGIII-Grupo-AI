import express from 'express';
import apicache from 'apicache';
import { body, param, check } from 'express-validator';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import validar from '../middleware/validar.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import ReservaController from '../controllers/Reservas/ReservaController.js';

const router = express.Router();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     tags: [Reservas]
 *     summary: Crear una nueva reserva
 *     description: Crea una nueva reserva con los datos del salón, turno, tematica y servicios adicionales.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-20"
 *               salon_id:
 *                 type: integer
 *                 example: 1
 *               turno_id:
 *                 type: integer
 *                 example: 2
 *               foto_cumpleaniero:
 *                 type: string
 *                 example: "foto.png"
 *               tematica:
 *                 type: string
 *                 example: "Cars"
 *               importe_salon:
 *                 type: number
 *                 example: 80000
 *               importe_total:
 *                 type: number
 *                 example: 95000
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                       example: 1
 *                     importe:
 *                       type: number
 *                       example: 10000
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error de validación o datos inválidos
 *       401:
 *         description: No autorizado, token inválido o ausente
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  [
    auth,
    roleCheck([ADMINISTRADOR, CLIENTE]),

    check('fecha_reserva')
      .notEmpty().withMessage('La fecha es necesaria.')
      .isISO8601().withMessage('Debe ser una fecha válida (YYYY-MM-DD).'),

    check('salon_id')
      .notEmpty().withMessage('El salón es necesario.')
      .isInt().withMessage('El ID del salón debe ser numérico.'),

    check('turno_id')
      .notEmpty().withMessage('El turno es necesario.')
      .isInt().withMessage('El ID del turno debe ser numérico.'),

    check('servicios')
      .optional()
      .isArray().withMessage('El campo servicios debe ser un texto.'),

    check('servicios.*.servicio_id')
       .optional()
       .isInt().withMessage('Cada servicio debe tener un ID numerico.'),
      
    check('servicios.*.importe')
      .optional()
      .isFloat({ min: 0 }).withMessage('El importe debe ser un número mayor o igual a 0.'),
  ],
  validar,
  ReservaController.crear.bind(ReservaController)
);
/**
 * @swagger
 * /api/reservas:
 *   get:
 *     tags: [Reservas]
 *     summary: Obtener reservas del usuario logeado o según rol
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario o rol correspondiente
 */
router.get(
  '/',
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  ReservaController.listar.bind(ReservaController)
);
/**
 * @swagger
 * /api/reservas/all:
 *   get:
 *     tags: [Reservas]
 *     summary: Obtener todas las reservas (solo admin y empleado)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las reservas
 */
router.get(
  '/all',
  cache('5 minutes'),
  auth,
  roleCheck([ADMINISTRADOR, EMPLEADO]),
  ReservaController.listarTodas.bind(ReservaController)
);
/**
 * @swagger
 * /api/reservas/informe:
 *  get:
 *    tags: [Reservas]
 *    summary: Generar un informe de reservas en PDF o CSV (Solo Admin)
 *    security:
 *    - bearerAuth: []
 *    parameters:
 *    - in: query
 *      name: formato
 *      required: true
 *      description: El formato deseado para el informe ('pdf' o 'csv')
 *      schema:
 *        type: string
 *    enum: [pdf, csv]
 *    responses:
 *      '200':
 *        description: El archivo del informe (PDF o CSV)
 *        content:
 *          application/pdf:
 *            schema:
 *              type: string
 *              format: binary
 *          text/csv:
 *            schema:
 *              type: string
 *      '400':
 *        description: Formato inválido
 *      '401':
 *        description: No autorizado
 *      '403':
 *        description: Prohibido (No es Admin)
 */
router.get(
    '/informe',
    [
        auth,
        roleCheck([ADMINISTRADOR])
    ],
    ReservaController.informe 
);
/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     tags: [Reservas]
 *     summary: Actualizar una reserva existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-25"
 *               salon_id:
 *                 type: integer
 *                 example: 2
 *               turno_id:
 *                 type: integer
 *                 example: 1
 *               foto_cumpleaniero:
 *                 type: string
 *                 example: "nueva_foto.png"
 *               tematica:
 *                 type: string
 *                 example: "Toy Story"
 *               importe_salon:
 *                 type: number
 *                 example: 85000
 *               importe_total:
 *                 type: number
 *                 example: 98000
 *               activo:
 *                 type: boolean
 *                 example: true
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *                       example: 1
 *                     importe:
 *                       type: number
 *                       example: 10000
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */

router.get(
  '/:id',
  cache('5 minutes'),
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  ReservaController.obtenerPorId.bind(ReservaController)
);
/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     tags: [Reservas]
 *     summary: Actualizar una reserva existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-25"
 *               salon_id:
 *                 type: integer
 *                 example: 2
 *               usuario_id:
 *                 type: integer
 *                 example: 5
 *               turno_id:
 *                 type: integer
 *                 example: 1
 *               foto_cumpleaniero:
 *                 type: string
 *                 example: "nuevo_cumple.png"
 *               tematica:
 *                 type: string
 *                 example: "Toy Story"
 *               importe_salon:
 *                 type: number
 *                 example: 85000
 *               importe_total:
 *                 type: number
 *                 example: 95000
 *               activo:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *                 description: "1 = activa, 0 = eliminada"
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */
router.put(
  '/:id',
  auth,
  roleCheck([ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número'),
    body('usuario_id').optional().isInt().withMessage('Debe ser un número'),
    body('salon_id').optional().isInt().withMessage('Debe ser un número'),
    body('fecha').optional().isISO8601().withMessage('Debe ser una fecha válida'),
    body('hora').optional(),
    body('servicio_id').optional().isInt().withMessage('Debe ser un número'),
  ],
  validar,
  ReservaController.actualizar.bind(ReservaController)
);
/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     tags: [Reservas]
 *     summary: Eliminar una reserva
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
 *         description: Reserva eliminada
 */
router.delete(
  '/:id',
  auth,
  roleCheck([ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  ReservaController.eliminar.bind(ReservaController)
);

export default router;
