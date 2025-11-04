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
 *     description: Permite a un administrador registrar un nuevo usuario en el sistema.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *               - tipo_usuario
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               nombre_usuario:
 *                 type: string
 *                 description: Email del usuario, usado como nombre de usuario
 *                 example: "juanperez@correo.com"
 *               contrasenia:
 *                 type: string
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *                 example: "juanperez123"
 *               tipo_usuario:
 *                 type: integer
 *                 description: |
 *                   Rol numérico del usuario:
 *                   - 1 → ADMINISTRADOR  
 *                   - 2 → EMPLEADO  
 *                   - 3 → CLIENTE
 *                 example: 2
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       401:
 *         description: No autorizado
 */
router.post(
  '/',
  auth,
  roleCheck([ADMINISTRADOR]),
  [
    body('nombre')
      .notEmpty()
      .withMessage('El nombre es obligatorio'),

    body('apellido')
      .notEmpty()
      .withMessage('El apellido es obligatorio'),

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

    body('tipo_usuario')
      .notEmpty()
      .withMessage('El tipo de usuario es obligatorio')
      .custom(value => {
        const num = parseInt(value, 10);
        if (![1, 2, 3].includes(num)) {
          throw new Error('El tipo de usuario debe ser 3 (CLIENTE), 2 (EMPLEADO) o 1 (ADMINISTRADOR)');
        }
        return true;
      }),
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
 *     description: Permite al **administrador** actualizar los datos de un usuario existente. Todos los campos del cuerpo son opcionales, pero deben cumplir con las validaciones correspondientes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID del usuario a actualizar
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email del usuario (opcional)
 *                 example: "nuevo.usuario@example.com"
 *               contrasenia:
 *                 type: string
 *                 minLength: 6
 *                 description: Nueva contraseña (opcional, mínimo 6 caracteres)
 *                 example: "claveSegura123"
 *               tipo_usuario:
 *                 type: integer
 *                 description: Tipo de usuario (opcional)
 *                 enum: [1, 2, 3]
 *                 example: 2
 *                 oneOf:
 *                   - description: "1 = ADMINISTRADOR"
 *                   - description: "2 = EMPLEADO"
 *                   - description: "3 = CLIENTE"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Usuario actualizado correctamente."
 *       400:
 *         description: Error de validación en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       campo:
 *                         type: string
 *                         example: "contrasenia"
 *                       mensaje:
 *                         type: string
 *                         example: "La contraseña debe tener al menos 6 caracteres"
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: Acceso denegado — solo los administradores pueden realizar esta acción
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
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
    body('tipo_usuario')
      .optional()
      .custom(value => {
        const num = parseInt(value, 10);
        if (![1, 2, 3].includes(num)) {
          throw new Error('El tipo de usuario debe ser 3 (CLIENTE), 2 (EMPLEADO) o 1 (ADMINISTRADOR)');
        }
        return true;
      }),
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
