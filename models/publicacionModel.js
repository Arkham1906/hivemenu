// ========================================
// MODELO DE PUBLICACIONES
// Gestiona todas las operaciones de base de datos relacionadas con publicaciones
// Incluye queries con JOINs para obtener información de vendedores
// ========================================

const pool = require("../db");

class Publicacion {
    
    // ========================================
    // OBTENER TODAS LAS PUBLICACIONES
    // Incluye nombre del vendedor mediante LEFT JOIN
    // ========================================
    static async obtenerTodos() {
        const [rows] = await pool.query(`
            SELECT p.*, v.nombre as vendedor_nombre 
            FROM posts p 
            LEFT JOIN vendedores v ON p.vendedor_id = v.id_vendedor
        `);
        return rows;
    }

    // ========================================
    // OBTENER PUBLICACIÓN POR ID
    // Retorna un array con un solo elemento o vacío si no existe
    // ========================================
    static async obtenerPorId(id_post) {
        const [rows] = await pool.query(
            "SELECT * FROM posts WHERE id_post = ?",
            [id_post]
        );
        return rows;
    }

    // ========================================
    // CREAR NUEVA PUBLICACIÓN
    // Inserta todos los campos incluyendo imagen (ruta) y datos opcionales
    // ========================================
    static async crear({ nombre, descripcion, categoria, vendedor_id, imagen, telefono, ubicacion }) {
        console.log("Creando publicación con:", { nombre, categoria });

        const [result] = await pool.query(
            'INSERT INTO posts (nombre, descripcion, categoria, vendedor_id, imagen, telefono, ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, categoria, vendedor_id, imagen || null, telefono, ubicacion || null]
        );

        return result; // Contiene insertId y affectedRows
    }

    // ========================================
    // ELIMINAR PUBLICACIÓN
    // ========================================
    static async borrar({id_post}){
        const [result] = await pool.query(
            'DELETE FROM posts WHERE id_post = ?',
            [id_post]
        );
        return result;
    }

    // ========================================
    // EDITAR PUBLICACIÓN (ACTUALIZACIÓN DINÁMICA)
    // Construye el query UPDATE dinámicamente basado en los campos de 'data'
    // Permite actualización parcial sin afectar campos no incluidos
    // ========================================
    /**
     * @param {number} id_post - ID de la publicación a editar
     * @param {Object} data - Objeto con los campos a actualizar
     * Ejemplo: { nombre: "Nuevo", categoria: "Tecnología" }
     */
    static async editar(id_post, data) {
        console.log("Editando publicación con:", { id_post, data });

        // Extraer nombres y valores de las propiedades del objeto
        const campos = Object.keys(data);    // ['nombre', 'categoria']
        const valores = Object.values(data); // ['Nuevo', 'Tecnología']

        // Construir string "nombre = ?, categoria = ?"
        const setSQL = campos.map(c => `${c} = ?`).join(", ");

        // Query final: UPDATE posts SET nombre = ?, categoria = ? WHERE id_post = ?
        const sql = `
            UPDATE posts
            SET ${setSQL}
            WHERE id_post = ?
        `;

        // Agregar id_post al final del array de valores
        valores.push(id_post);

        const [result] = await pool.query(sql, valores);
        return result; // Contiene affectedRows
    }

    // ========================================
    // OBTENER PUBLICACIONES POR VENDEDOR
    // Retorna todas las publicaciones de un vendedor específico
    // ========================================
    static async obtenerPorVendedor(vendedor_id) {
        const [rows] = await pool.query(
            "SELECT * FROM posts WHERE vendedor_id = ?",
            [vendedor_id]
        );
        return rows;
    }

    // ========================================
    // BÚSQUEDA GENERAL EN PUBLICACIONES
    // Busca en nombre y descripción usando LIKE (case-insensitive)
    // ========================================
    static async buscar(termino) {
        const [rows] = await pool.query(`
            SELECT p.*, v.nombre as vendedor_nombre 
            FROM posts p 
            LEFT JOIN vendedores v ON p.vendedor_id = v.id_vendedor
            WHERE p.nombre LIKE ? OR p.descripcion LIKE ?
        `, [`%${termino}%`, `%${termino}%`]);
        return rows;
    }

    // ========================================
    // BÚSQUEDA POR CATEGORÍA
    // Filtra publicaciones por categoría específica
    // ========================================
    static async buscarPorCategoria(categoria) {
        const [rows] = await pool.query(`
            SELECT p.*, v.nombre as vendedor_nombre 
            FROM posts p 
            LEFT JOIN vendedores v ON p.vendedor_id = v.id_vendedor
            WHERE p.categoria LIKE ?
        `, [`%${categoria}%`]);
        return rows;
    }

    // ========================================
    // BÚSQUEDA POR NOMBRE DE VENDEDOR
    // Usa INNER JOIN porque requiere que el vendedor exista
    // ========================================
    static async buscarPorVendedor(nombreVendedor) {
        const [rows] = await pool.query(`
            SELECT p.*, v.nombre as vendedor_nombre 
            FROM posts p 
            INNER JOIN vendedores v ON p.vendedor_id = v.id_vendedor
            WHERE v.nombre LIKE ?
        `, [`%${nombreVendedor}%`]);
        return rows;
    }
}

module.exports = Publicacion;