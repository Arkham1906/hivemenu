const Publicacion = require('../models/publicacionModel');

exports.obtenerTodos = async (req, res) => {
    try {
        const publicaciones = await Publicacion.obtenerTodos();
        res.json(publicaciones);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, descripcion, status, vendedor_id, precio } = req.body;
        const result = await Publicacion.crear({ nombre, descripcion, status, vendedor_id, precio });
        res.json({ insertId: result.insertId });
    } catch (error) {
        console.error("Error al crear publicación:", error);
        res.status(500).json({ error: "Error al crear la publicación" });
    }
};
