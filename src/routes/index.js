const express = require('express');
const router = express.Router();

// Controllers Salones
const getAllSalones = require("../controllers/Salones/getAll");
const createSalon = require("../controllers/Salones/create");
const updateSalon = require("../controllers/Salones/update");
const deleteSalon = require("../controllers/Salones/delete");

// Rutas CRUD Salones
router.get('/salones', getAllSalones);
router.post('/salones', createSalon);
router.put('/salones/:id', updateSalon);
router.delete('/salones/:id', deleteSalon);

module.exports = router;
