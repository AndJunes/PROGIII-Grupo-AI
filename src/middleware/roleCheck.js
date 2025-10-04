const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.tipo_usuario)) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes permisos suficientes.' });
        }
        next();
    };
};

export default roleCheck;
