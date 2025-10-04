const Servicio = require("../../models/Servicio");
const Reserva = require("../../models/Reserva");
const ReservaServicio = require("../../models/ReservaServicio");


//Relaciones Sequelize
ReservaServicio.belongsTo(Reserva, { foreignKey: 'reserva_id' });
ReservaServicio.belongsTo(Servicio, { foreignKey: 'servicio_id' });

class ServiciosController {
    // GET -> Todos los servicios activos (admin/empleado)
    static async getAll(req, res) {
        try {
            const servicios = await Servicio.findAll({
                where: { activo: 1 },
                order: [['servicio_id', 'ASC']]
            });

            res.json(servicios);
        } catch (error) {
            console.error('error al listar todos los servicios:', error);
            res.status(500).json({ mensaje: 'error al listar servicios', error });
        }
    }

    //GET -> obtener un servicio por id
    static async getByUser(req, res) {
        try {
            const usuarioId = req.usuario.usuario_id;

            // Buscar todos los servicios vinculados a reservas del usuario
            const reservasServicios = await ReservaServicio.findAll({
                include: [
                    {
                        model: Reserva,
                        where: { usuario_id: usuarioId, activo: 1 },
                        attributes: []
                    },
                    {
                        model: Servicio,
                        attributes: ['servicio_id', 'descripcion', 'importe']
                    }
                ]
            });

            // Extraer solo los servicios únicos
            const servicios = reservasServicios.map(rs => rs.Servicio);
            const serviciosUnicos = Array.from(new Map(servicios.map(s => [s.servicio_id, s])).values());

            //mensaje por si no hay servicios para ese usuario
            if (serviciosUnicos.length === 0) {
                return res.json({ mensaje: "No tienes ningun servicio vinculado" });
            }

            res.json(serviciosUnicos);
        } catch (error) {
            console.error('error al listar servicios del usuario:', error);
            res.status(500).json({ mensaje: 'error al listar servicios', error });
        }
    }

    //GET -> solo para admin o empleado (mostrar por id especifico)
    static async getById(req, res) {
        try {
            const { id } = req.params;

            const servicio = await Servicio.findByPk(id);

            if (!servicio || servicio.activo === 0) {
                return res.status(404).json({ mensaje: "Servicio no encontrado" });
            }

            res.json(servicio);
        } catch (error) {
            console.error('error al obtener servicio por id:', error);
            res.status(500).json({ mensaje: 'error al obtener servicio', error });
        }
    }


    //POST -> crear un nuevo servicio
    static async create(req, res) {
        try {
            const { descripcion, importe } = req.body;

            const nuevoServicio = await Servicio.create({
                descripcion,
                importe,
                activo: 1
            });

            res.status(201).json({
                mensaje: 'el servicio fue creado correctamente',
                servicio: nuevoServicio
            });
        } catch (error) {
            console.error('error al crear servicio:', error);
            res.status(500).json({ mensaje: 'error al crear servicio', error});
        }
    }

    // PUT -> actualizar un servicio
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { descripcion, importe } = req.body;

            const servicio = await Servicio.findByPk(id);

            if(!servicio || servicio.activo === 0) {
                return res.status(400).json({ mensaje: 'servicio no encontrado'});
            }

            await servicio.update({ descripcion, importe });

            res.json({
                mensaje: 'servicio actualizado correctamente',
                servicio
            });
        } catch (error) {
            console.error('error al actualizar servicio:', error);
            res.status(500).json({ mensaje: 'error al actualizar el servicio', error});
        }
    }

    // DELETE -> eliminar servicio (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const servicio = await Servicio.findByPk(id);

            if (!servicio || servicio.activo === 0) {
                return res.status(404).json({ mensaje: 'servicio no encontrado o ya eliminado'});
            }

            await servicio.update({ activo: 0});

            res.json({ mensaje: 'servicio eliminado correctamente (soft delete)' });
        } catch (error) {
            console.error('error al eliminar servicio:', error);
            res.status(500).json({ mensaje: 'error al eliminar servicio', error });
        }
    }
}

module.exports = ServiciosController;
