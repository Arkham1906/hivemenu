const Vendedor = require("../models/vendedor");

class VendedorController {
    static async listar(req, res) {
        try {
            const vendedores = await Vendedor.obtenerTodos();
            res.render("vendedores/lista", { vendedores });
        } catch (err) {
            res.status(500).send("Error al obtener vendedores");
        }
    }

    static async crear(req, res) {
        try {
            const nuevoVendedor = req.body;
            await Vendedor.insertar(nuevoVendedor);
            res.redirect("/vendedores");
        } catch (err) {
            res.status(500).send("Error al crear vendedor");
        }
    }

    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            await Vendedor.eliminar(id);
            res.redirect("/vendedores");
        } catch (err) {
            res.status(500).send("Error al eliminar vendedor");
        }
    }
}

module.exports = VendedorController;
