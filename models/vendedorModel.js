// ========================================
// MODELO DE VENDEDORES
// Gestiona todas las operaciones de base de datos relacionadas con vendedores
// Incluye métodos CRUD completos y búsquedas específicas
// ========================================

const db = require("../db");

class Vendedor {

    // ========================================
    // OBTENER TODOS LOS VENDEDORES
    // Retorna todos los registros de la tabla vendedores
    // ========================================
    static async obtenerTodos() {
        const [rows] = await db.query("SELECT * FROM vendedores");
        return rows;
    }

    // ========================================
    // CREAR NUEVO VENDEDOR
    // Inserta un nuevo registro con nombre, correo y contraseña (ya encriptada)
    // ========================================
    /**
     * @param {Object} param - Datos del vendedor
     * @param {string} param.nombre - Nombre completo del vendedor
     * @param {string} param.correo - Email único del vendedor
     * @param {string} param.password - Contraseña ya encriptada con bcrypt
     * @returns {Object} result - Contiene insertId del nuevo registro
     */
    static async crear({ nombre, correo, password }) {
        const sql = `
            INSERT INTO vendedores (nombre, correo, password)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            nombre,
            correo,
            password
        ]);

        return result;
    }

    // ========================================
    // BUSCAR VENDEDOR POR CORREO
    // Usado para login y validación de correo único
    // ========================================
    /**
     * @param {string} correo - Email del vendedor
     * @returns {Object|undefined} - Objeto vendedor o undefined si no existe
     */
    static async buscarPorCorreo(correo) {
        const [rows] = await db.query(
            "SELECT * FROM vendedores WHERE correo = ? LIMIT 1",
            [correo]
        );
        // rows[0] será undefined si no hay resultados
        return rows[0];
    }

    // ========================================
    // ELIMINAR VENDEDOR
    // Elimina el registro de la base de datos por ID
    // ========================================
    static async borrar({ id_vendedor }) {
        const [result] = await db.query(
            "DELETE FROM vendedores WHERE id_vendedor = ?",
            [id_vendedor]
        );
        return result; // Contiene affectedRows (0 si no existía)
    }

    // ========================================
    // BUSCAR VENDEDOR POR ID
    // Retorna un único vendedor o undefined
    // ========================================
    static async buscarPorId({ id_vendedor }) {
        const [rows] = await db.query(
            "SELECT * FROM vendedores WHERE id_vendedor = ? LIMIT 1",
            [id_vendedor]
        );
        return rows[0];
    }

    // ========================================
    // EDITAR VENDEDOR (ACTUALIZACIÓN DINÁMICA)
    // Construye el query UPDATE dinámicamente según los campos proporcionados
    // Permite actualización parcial: solo modifica los campos enviados
    // ========================================
    /**
     * @param {number} id_vendedor - ID del vendedor a editar
     * @param {Object} data - Objeto con los campos a actualizar
     * Ejemplo: { nombre: "Juan", correo: "nuevo@email.com" }
     * Genera: UPDATE vendedores SET nombre = ?, correo = ? WHERE id_vendedor = ?
     */
    static async editar(id_vendedor, data) {
        // Extraer claves y valores del objeto data
        const campos = Object.keys(data);    // ['nombre', 'correo']
        const valores = Object.values(data); // ['Juan', 'nuevo@email.com']

        // Construir la parte SET del query: "nombre = ?, correo = ?"
        const setSQL = campos.map(c => `${c} = ?`).join(", ");

        // Query final con placeholders
        const sql = `
            UPDATE vendedores
            SET ${setSQL}
            WHERE id_vendedor = ?
        `;

        // Agregar id_vendedor al final del array de valores para el WHERE
        valores.push(id_vendedor);

        const [result] = await db.query(sql, valores);
        return result; // Contiene affectedRows
    }
}

module.exports = Vendedor;