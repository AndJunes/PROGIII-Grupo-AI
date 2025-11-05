import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { body, validationResult } from 'express-validator'

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesión
 *     description: Permite que un usuario existente inicie sesión y reciba un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "alblop@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "alblop"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Usuario o contraseña incorrectos
 */
router.post(
  '/login',
  [
    body('nombre_usuario')
      .notEmpty()
      .withMessage('El nombre de usuario es obligatorio')
      .isEmail()
      .withMessage('Debe ser un email válido'),
    body('contrasenia')
      .notEmpty()
      .withMessage('La contraseña es obligatoria')
      .isLength({ min: 3 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    //en el caso que pase la validacion, sigue al controlador
    next();
  },
  AuthController.login
);

export default router;
