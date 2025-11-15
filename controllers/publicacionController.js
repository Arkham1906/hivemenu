const { error } = require('console');
const Publicacion = require('../models/publicacionModel');
const { message } = require('statuses');

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

exports.borrar = async (req, res) => {
    try {
        const { id_post } = req.params; // <- AQUÍ ESTABA EL ERROR

        const result = await Publicacion.borrar({ id_post });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No existe el post con ese ID" });
        }

        return res.json({ message: "Publicación eliminada correctamente" });

    } catch (error) {
        console.error("Error al borrar publicación:", error);
        return res.status(500).json({ error: "Error al borrar la publicación" });
    }
};