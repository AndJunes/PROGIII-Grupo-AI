const express = require('express');
const router = express.Router();
const getAllSalones = require("../controllers/Salones/getAll");

router.get('/salones', getAllSalones);

module.exports = router;
