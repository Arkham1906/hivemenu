const db = require("../db")

class Vendedor{
    static async obtenerTodos() {
        const [rows] = await db.query("SELECT * FROM vendedores");
        return rows;
    }

    static async insertar(vendedor) {
        const campos = [
            "nombre",
            "apellido_pat",
            "apellido_mat",
            "matricula",
            "edificio",
            "carrera",
            "grupo",
            "cuatrimestre",
            "telefono",
        ];

        const valores = campos.map(c => vendedor[c]);
        const placeholders = campos.map(() => "?").join(", ");
        const sql = `INSERT INTO vendedores (${campos.join(", ")}) VALUES (${placeholders})`;
        await db.query(sql, valores);
    }


    static async eliminar (id) {
        await db.query("DELETE FROM vendedores WHERE id_vendedor = ?", [id]);
    }
}

module.exports = Vendedor;