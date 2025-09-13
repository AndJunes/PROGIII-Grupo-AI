const Salones = require("../../models/Salon");

module.exports = async (req, res) => {
    //console.log(req.body); //a ver que mierda llega
    try {
        const { titulo, direccion, capacidad, importe } = req.body;

        if (!titulo || !direccion || !capacidad || !importe) {
            return res.status(400).json({ error: "faltan datos obligatorios" });
        }

        const nuevoSalon = await Salones.create({
            titulo,
            direccion,
            capacidad,
            importe
        });

        res.status(201).json(nuevoSalon);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "error al crear el salon" });
    }
};