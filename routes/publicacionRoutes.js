const express = require('express');
const router = express.Router();
const controller = require('../controllers/publicacionController');

router.get('/', controller.obtenerTodos);
router.post('/', controller.crear);

module.exports = router;
