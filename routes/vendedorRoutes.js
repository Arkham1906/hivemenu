// routes/vendedores.js
const express = require("express");
const router = express.Router();
const VendedorController = require("../controllers/vendedorController");

router.get("/", VendedorController.listar);
router.post("/", VendedorController.crear);
router.get("/eliminar/:id", VendedorController.eliminar);

module.exports = router;
