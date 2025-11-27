// ========================================
// CONTROLADOR DE AUTENTICACIÓN
// Maneja el login y registro de vendedores
// ========================================

const Vendedor = require("../models/vendedorModel");
const bcrypt = require("bcryptjs");

// ========================================
// LOGIN DE USUARIO
// Valida credenciales y retorna datos del vendedor
// ========================================
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Buscar vendedor por correo en la base de datos
        const vendedor = await Vendedor.buscarPorCorreo(correo);

        if (!vendedor) {
            return res.status(400).json({ error: "Correo no registrado" });
        }

        // Comparar la contraseña ingresada con el hash almacenado
        // bcrypt.compare() verifica si la contraseña sin encriptar coincide con el hash
        const validPassword = await bcrypt.compare(password, vendedor.password);

        if (!validPassword) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        // Login exitoso: retornar datos del vendedor (sin contraseña)
        return res.json({
            message: "Login exitoso",
            vendedor: {
                id_vendedor: vendedor.id_vendedor,
                nombre: vendedor.nombre,
                correo: vendedor.correo
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "Error en el servidor" });
    }
};

// ========================================
// REGISTRO DE NUEVO USUARIO
// Valida que el correo no exista y crea el vendedor con contraseña encriptada
// ========================================
exports.registrar = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        // Verificar si el correo ya está registrado
        const correoExiste = await Vendedor.buscarPorCorreo(correo);
        if (correoExiste) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Encriptar contraseña usando bcrypt con salt rounds = 10
        // Esto genera un hash único que no puede ser revertido
        const hash = await bcrypt.hash(password, 10);
        
        // Crear nuevo vendedor en la base de datos
        const nuevo = await Vendedor.crear({ nombre, correo, password: hash });

        return res.json({ message: "Registro exitoso", vendedor: nuevo });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
    }
};