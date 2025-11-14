const db = require("../db");

class Publicacion {
    static async obtenerTodos() {
        const [rows] = await db.query("SELECT * FROM posts");
        return rows;
    }

    static async crear({ nombre, descripcion, status, vendedor_id, precio }) {
        console.log("Creando publicación con:", { nombre, descripcion, status, vendedor_id, precio });

        const [result] = await db.query(
            'INSERT INTO posts (nombre, descripcion, status, vendedor_id, precio) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, status, vendedor_id, precio]
        );

        return result;
    }
}

module.exports = Publicacion;
