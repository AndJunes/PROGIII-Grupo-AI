import express from 'express';
import apicache from 'apicache';
import { body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import validar from '../middleware/validar.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import ServiciosController from '../controllers/Servicios/ServiciosController.js';

const router = express.Router();
const cache = apicache.middleware;
// middleware para etiquetar el grupo de caché 'servicios'
const tagServicios = (req, res, next) => { res.apicacheGroup = 'servicios'; next(); };

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     tags: [Servicios]
 *     summary: Obtener todos los servicios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         description: Incluir servicios inactivos (activo = 0)
 *     responses:
 *       200:
 *         description: Lista de todos los servicios
 */
router.get(
  '/',
  tagServicios,
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  ServiciosController.getAll.bind(ServiciosController)
);

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     tags: [Servicios]
 *     summary: Obtener un servicio por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         description: Permite obtener un servicio inactivo
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del servicio
 */
router.get(
  '/:id',
  tagServicios,
  cache('5 minutes'),
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  ServiciosController.getById.bind(ServiciosController)
);

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     tags: [Servicios]
 *     summary: Crear un nuevo servicio
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Decoración temática infantil"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 12000.50
 *               activo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 */
router.post(
  '/',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    body('importe').notEmpty().withMessage('El importe es obligatorio').isFloat().withMessage('Debe ser un número'),
    body('activo').optional().isIn([0, 1]).withMessage('Debe ser 0 o 1')
  ],
  validar,
  ServiciosController.create.bind(ServiciosController)
);


/**
 * @swagger
 * /api/servicios/{id}:
 *   put:
 *     tags: [Servicios]
 *     summary: Actualizar un servicio existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Decoración premium con luces LED"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 18000.75
 *               activo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 */
router.put(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número'),
    body('descripcion').optional().isString().withMessage('La descripción debe ser texto'),
    body('importe').optional().isFloat().withMessage('El importe debe ser numérico'),
    body('activo').optional().isIn([0, 1]).withMessage('Debe ser 0 o 1'),
  ],
  validar,
  ServiciosController.update.bind(ServiciosController)
);


/**
 * @swagger
 * /api/servicios/{id}:
 *   delete:
 *     tags: [Servicios]
 *     summary: Eliminar un servicio
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
 *         description: Servicio eliminado
 */
router.delete(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  ServiciosController.delete.bind(ServiciosController)
);


export default router;
