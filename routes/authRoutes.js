const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/registrar", authController.registrar); //estas son las rutas para que al hacer alguna accion en el front sepa que accion y a cual funcion se debe llamar
router.post("/login", authController.login);

module.exports = router;