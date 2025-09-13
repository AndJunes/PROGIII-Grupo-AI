const express = require('express');
const router = express.Router();

// Controllers Salones
const SalonesController = require('../controllers/Salones/SalonesController');

// Rutas de Salones
router.get('/salones', SalonesController.getAll.bind(SalonesController));
router.post('/salones', SalonesController.create.bind(SalonesController));
router.put('/salones/:id', SalonesController.update.bind(SalonesController));
router.delete('/salones/:id', SalonesController.delete.bind(SalonesController));

module.exports = router;
