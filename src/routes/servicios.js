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

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     tags: [Servicios]
 *     summary: Obtener todos los servicios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los servicios
 */
router.get(
  '/',
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
 *               nombre:
 *                 type: string
 *                 example: "Catering"
 *               descripcion:
 *                 type: string
 *                 example: "Servicio de catering completo"
 *               precio:
 *                 type: number
 *                 format: float
 *                 example: 5000.00
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 */
router.post(
  '/',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
    body('precio').notEmpty().withMessage('El precio es obligatorio').isFloat().withMessage('Debe ser un número'),
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Servicio actualizado
 */
router.put(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número'),
    body('nombre').optional().isString(),
    body('descripcion').optional().isString(),
    body('precio').optional().isFloat().withMessage('Debe ser un número'),
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
