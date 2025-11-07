import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import { ADMINISTRADOR } from '../constants/roles.js';
import AuditoriaController from '../controllers/Auditoria/AuditoriaController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auditoria
 *   description: Endpoints de auditoría (solo Admin)
 */

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     tags: [Auditoria]
 *     summary: Listado de auditoría
 *     description: Retorna eventos de auditoría con filtros y paginación. Solo Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         example: reservas
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, toggle_activo]
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         description: Fecha inicial (ISO8601)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         description: Fecha final (ISO8601)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 200
 *     responses:
 *       200:
 *         description: Listado de auditoría
 */
router.get(
  '/',
  auth,
  roleCheck([ADMINISTRADOR]),
  AuditoriaController.list.bind(AuditoriaController)
);

/**
 * @swagger
 * /api/auditoria/{id}:
 *   get:
 *     tags: [Auditoria]
 *     summary: Detalle de un evento de auditoría
 *     description: Retorna un evento específico por ID. Solo Admin.
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
 *         description: Evento de auditoría
 *       404:
 *         description: No encontrado
 */
router.get(
  '/:id',
  auth,
  roleCheck([ADMINISTRADOR]),
  AuditoriaController.getById.bind(AuditoriaController)
);

export default router;
