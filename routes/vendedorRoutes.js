const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendedorController');

router.get('/', controller.obtenerTodos);
router.get('/:id_vendedor', controller.buscarPorId);
router.delete('/:id_vendedor', controller.borrar);
router.put('/:id_vendedor', controller.editar);

module.exports = router;