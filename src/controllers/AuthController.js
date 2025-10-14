import AuthService from "../services/AuthService.js";

class AuthController {
    static async login(req, res) {
        try {
            const { nombre_usuario, contrasenia } = req.body;

            const { token, usuario } = await AuthService.login(nombre_usuario, contrasenia);

            res.json({
                token,
                usuario: {
                    usuario_id: usuario.usuario_id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    nombre_usuario: usuario.nombre_usuario,
                    tipo_usuario: usuario.tipo_usuario,
                    celular: usuario.celular,
                    foto: usuario.foto,
                },
            });
        } catch (error) {
            console.error("Error en login:", error.message);
            if (error.message === "Credenciales inválidas" || error.message.includes("requeridos")) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Error en el servidor" });
            }
        }
    }
}

export default AuthController;
