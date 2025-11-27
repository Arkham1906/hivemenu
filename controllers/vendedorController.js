// ========================================
// CONTROLADOR DE VENDEDORES
// Gestiona el CRUD completo de vendedores
// Incluye autenticación con bcrypt
// ========================================

const Vendedor = require("../models/vendedorModel");
const bcrypt = require("bcryptjs");

// ========================================
// OBTENER TODOS LOS VENDEDORES
// ========================================
exports.obtenerTodos = async (req, res) => {
    try {
        const vendedores = await Vendedor.obtenerTodos();
        res.json(vendedores);
    } catch (error) {
        console.error("Error al obtener vendedores:", error);
        res.status(500).json({ error: "Error al obtener vendedores" });
    }
};

// ========================================
// BUSCAR VENDEDOR POR ID
// Retorna el vendedor sin incluir la contraseña
// ========================================
exports.buscarPorId = async (req, res) => {
    try {
        const { id_vendedor } = req.params;
        const vendedor = await Vendedor.buscarPorId({ id_vendedor });

        if (!vendedor) {
            return res.status(404).json({ error: "Vendedor no encontrado" });
        }

        // Usar desestructuración para remover la contraseña del objeto
        // Retorna todos los campos excepto password
        const { password, ...vendedorSinPassword } = vendedor;

        res.json(vendedorSinPassword);
        
    } catch (error) {
        console.error("Error al buscar vendedor:", error);
        res.status(500).json({ error: "Error al buscar vendedor" });
    }
};

// ========================================
// REGISTRO DE NUEVO VENDEDOR
// Valida que el correo sea único y encripta la contraseña
// ========================================
exports.registrar = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        // Verificar si el correo ya está registrado en la base de datos
        const existe = await Vendedor.buscarPorCorreo(correo);
        if (existe) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Encriptar contraseña con bcrypt (salt rounds = 10)
        // El hash generado es irreversible, solo se puede validar con bcrypt.compare()
        const hash = await bcrypt.hash(password, 10);

        // Crear vendedor en la base de datos con contraseña encriptada
        const nuevo = await Vendedor.crear({
            nombre,
            correo,
            password: hash
        });

        res.json({
            message: "Registro exitoso",
            id: nuevo.insertId
        });

    } catch (err) {
        console.error("Error registro:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// ========================================
// LOGIN DE VENDEDOR
// Valida credenciales y retorna datos del usuario (sin contraseña)
// ========================================
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar vendedor en la base de datos
        const vendedor = await Vendedor.buscarPorCorreo(correo);
        if (!vendedor) {
            return res.status(400).json({ error: "Correo no registrado" });
        }

        // Comparar contraseña ingresada con el hash almacenado
        const valido = await bcrypt.compare(password, vendedor.password);
        if (!valido) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        // Login exitoso: retornar datos básicos del vendedor
        res.json({
            message: "Login exitoso",
            vendedor: {
                id_vendedor: vendedor.id_vendedor,
                nombre: vendedor.nombre,
                correo: vendedor.correo
            }
        });

    } catch (err) {
        console.error("Error login:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// ========================================
// ELIMINAR VENDEDOR
// Elimina el registro del vendedor de la base de datos
// ========================================
exports.borrar = async (req, res) => {
    try {
        const { id_vendedor } = req.params;
        const result = await Vendedor.borrar({ id_vendedor });

        // affectedRows indica cuántos registros fueron afectados
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vendedor no encontrado" });
        }

        return res.json({ message: "Vendedor eliminado correctamente" });
        
    } catch (error) {
        console.error("Error al borrar vendedor:", error);
        return res.status(500).json({ error: "Error al borrar vendedor" });
    }
};

// ========================================
// EDITAR VENDEDOR
// Actualiza los campos proporcionados en el body
// Permite actualización parcial (solo los campos enviados)
// ========================================
exports.editar = async (req, res) => {
    const { id_vendedor } = req.params;
    const data = req.body;

    try {
        // El modelo construye dinámicamente el UPDATE con los campos de 'data'
        const result = await Vendedor.editar(id_vendedor, data);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vendedor no encontrado" });
        }

        return res.json({ message: "Vendedor actualizado" });
        
    } catch (error) {
        console.error("Error al editar:", error);
        res.status(500).json({ error: "Error al editar" });
    }
};