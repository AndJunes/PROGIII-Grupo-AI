const Salones = require("../../models/Salon");

module.exports = async(req, res) => {
    try {
        const salones = await Salones.findAll();
        console.log(salones);
        res.json(salones);
        
    }catch(error){
        console.error(error);
        res.status(500).json({error:'error al buscar salones'});
    }
}