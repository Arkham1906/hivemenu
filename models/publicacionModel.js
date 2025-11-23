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

    static async borrar({id_post}){
        const [result] = await db.query(
            'DELETE FROM posts WHERE id_post = ?',
            [id_post]
        );
        return result;
    }

    static async editar(id_post, { nombre, descripcion, status, vendedor_id, precio}){
        console.log("Creando publicación con:", { nombre, descripcion, status, vendedor_id, precio });

        const sql = `
            Update post
            SET nombre=?, descripcion=?, status=?, vendedor_id=?, precio=?
            WHERE id_post=?;
        `;

        const [result] = await db.query(
            [nombre, descripcion, status, vendedor_id, precio, id_post]
        );

        return result;
    }
}

module.exports = Publicacion;
