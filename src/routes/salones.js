import express from 'express';
import apicache from 'apicache';
import { body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import validar from '../middleware/validar.js';
import { CLIENTE, EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import SalonesController from '../controllers/Salones/SalonesController.js';

const router = express.Router();
const cache = apicache.middleware;
// middleware para agrupar entradas de caché de salones
const tagSalones = (req, res, next) => { res.apicacheGroup = 'salones'; next(); };

/**
 * @swagger
 * /api/salones:
 *   get:
 *     tags: [Salones]
 *     summary: Obtener todos los salones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los salones
 */
router.get(
  '/',
  tagSalones,
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  SalonesController.getAll.bind(SalonesController)
);
/**
 * @swagger
 * /api/salones/{id}:
 *   get:
 *     tags: [Salones]
 *     summary: Obtener un salón por ID
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
 *         description: Datos del salón
 */
router.get(
  '/:id',
  tagSalones,
  cache('5 minutes'),
  auth,
  roleCheck([CLIENTE, EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  SalonesController.getById.bind(SalonesController)
);
/**
 * @swagger
 * /api/salones:
 *   post:
 *     tags: [Salones]
 *     summary: Crear un nuevo salón
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Prueba 2"
 *               direccion:
 *                 type: string
 *                 example: "Calle"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 5000
 *               capacidad:
 *                 type: integer
 *                 example: 100
 *               latitud:
 *                 type: number
 *                 format: float
 *                 example: -20.6037
 *               longitud:
 *                 type: number
 *                 format: float
 *                 example: -10.3816
 *     responses:
 *       201:
 *         description: Salón creado exitosamente
 */
router.post(
  '/',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    body('titulo').notEmpty().withMessage('El título es obligatorio'),
    body('direccion').notEmpty().withMessage('La dirección es obligatoria'),
    body('capacidad').notEmpty().withMessage('La capacidad es obligatoria').isInt().withMessage('Debe ser un número'),
    body('importe').notEmpty().withMessage('El importe es obligatorio').isFloat().withMessage('Debe ser un número'),
  ],
  validar,
  SalonesController.create.bind(SalonesController)
);
/**
 * @swagger
 * /api/salones/{id}:
 *   put:
 *     tags: [Salones]
 *     summary: Actualizar un salón existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Salón Principal Actualizado"
 *               direccion:
 *                 type: string
 *                 example: "Ejemplo 742"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 6000
 *               capacidad:
 *                 type: integer
 *                 example: 120
 *               latitud:
 *                 type: number
 *                 format: float
 *                 example: -20.6037
 *               longitud:
 *                 type: number
 *                 format: float
 *                 example: -10.3816
 *     responses:
 *       200:
 *         description: Salón actualizado exitosamente
 */
router.put(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número'),
    body('titulo').optional().isString(),
    body('direccion').optional().isString(),
    body('capacidad').optional().isInt().withMessage('Debe ser un número'),
    body('importe').optional().isFloat().withMessage('Debe ser un número'),
  ],
  validar,
  SalonesController.update.bind(SalonesController)
);
/**
 * @swagger
 * /api/salones/{id}:
 *   delete:
 *     tags: [Salones]
 *     summary: Eliminar un salón
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
 *         description: Salón eliminado
 */
router.delete(
  '/:id',
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número')],
  validar,
  SalonesController.delete.bind(SalonesController)
);


export default router;
