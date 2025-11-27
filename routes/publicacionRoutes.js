const express = require('express');
const router = express.Router();
const controller = require('../controllers/publicacionController');

router.get('/', controller.obtenerTodos);
router.post('/', controller.crear);
router.delete('/:id_post', controller.borrar);
router.put('/:id_post', controller.editar);
router.get('/buscar', controller.buscar);

module.exports = router;
