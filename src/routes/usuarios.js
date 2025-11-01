import express from 'express';
import apicache from 'apicache';
import { body, param } from 'express-validator';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import validar from '../middleware/validar.js';
import { EMPLEADO, ADMINISTRADOR } from '../constants/roles.js';
import UsuariosController from '../controllers/Usuarios/UsuariosController.js';

const router = express.Router();
const cache = apicache.middleware;

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener todos los usuarios (solo ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get(
  '/',
  cache('5 minutes'),
  auth,
  roleCheck([ADMINISTRADOR]),
  UsuariosController.getAll.bind(UsuariosController)
);

/**
 * @swagger
 * /api/usuarios/clientes:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener todos los clientes (solo EMPLEADO o ADMIN)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get(
  '/clientes',
  cache('5 minutes'),
  auth,
  roleCheck([EMPLEADO, ADMINISTRADOR]),
  UsuariosController.getClientes.bind(UsuariosController)
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener un usuario por ID (solo ADMIN)
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
 *         description: Datos del usuario
 */
router.get(
  '/:id',
  cache('5 minutes'),
  auth,
  roleCheck([ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número entero')],
  validar,
  UsuariosController.getById.bind(UsuariosController)
);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear un nuevo usuario (solo ADMIN)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "juanperez@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "juanperez"
 *               rol:
 *                 type: string
 *                 example: "CLIENTE"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post(
  '/',
  auth,
  roleCheck([ADMINISTRADOR]),
  [
    body('nombre_usuario')
      .notEmpty()
      .withMessage('El nombre de usuario es obligatorio')
      .isEmail()
      .withMessage('Debe ser un email válido'),
    body('contrasenia')
      .notEmpty()
      .withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol')
      .notEmpty()
      .withMessage('El rol es obligatorio')
      .isIn(['CLIENTE', 'EMPLEADO', 'ADMINISTRADOR'])
      .withMessage('El rol debe ser CLIENTE, EMPLEADO o ADMINISTRADOR'),
  ],
  validar,
  UsuariosController.create.bind(UsuariosController)
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar un usuario existente (solo ADMIN)
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
 *               nombre_usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put(
  '/:id',
  auth,
  roleCheck([ADMINISTRADOR]),
  [
    param('id').isInt().withMessage('El id debe ser un número entero'),
    body('nombre_usuario')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido'),
    body('contrasenia')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol')
      .optional()
      .isIn(['CLIENTE', 'EMPLEADO', 'ADMINISTRADOR'])
      .withMessage('El rol debe ser CLIENTE, EMPLEADO o ADMINISTRADOR'),
  ],
  validar,
  UsuariosController.update.bind(UsuariosController)
);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar un usuario (solo ADMIN)
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
 *         description: Usuario eliminado
 */
router.delete(
  '/:id',
  auth,
  roleCheck([ADMINISTRADOR]),
  [param('id').isInt().withMessage('El id debe ser un número entero')],
  validar,
  UsuariosController.delete.bind(UsuariosController)
);


export default router;
