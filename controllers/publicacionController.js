// ========================================
// CONTROLADOR DE PUBLICACIONES
// Gestiona el CRUD completo de publicaciones/emprendimientos
// Incluye manejo de imágenes en Base64 y búsquedas avanzadas
// ========================================

const Publicacion = require('../models/publicacionModel');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURACIÓN DE ALMACENAMIENTO
// Crea el directorio de uploads si no existe
// ========================================
const uploadDir = path.join(__dirname, '../uploads/posts');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ========================================
// UTILIDAD - CONVERSIÓN DE BASE64 A ARCHIVO
// Convierte una imagen Base64 a un archivo físico en el servidor
// ========================================
/**
 * @param {string} base64String - String con formato data:image/...;base64,...
 * @param {string} nombreArchivo - Nombre único para el archivo (ej: 123-1634567890.jpg)
 * @returns {string|null} - Ruta relativa del archivo o null si hay error
 */
function guardarImagenDesdeBase64(base64String, nombreArchivo) {
    try {
        // Remover el prefijo "data:image/png;base64," para obtener solo el contenido Base64
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const filePath = path.join(uploadDir, nombreArchivo);
        
        // Convertir Base64 a Buffer y escribir archivo
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        // Retornar ruta relativa para guardar en la base de datos
        return `/uploads/posts/${nombreArchivo}`;
    } catch (error) {
        console.error('Error al guardar imagen:', error);
        return null;
    }
}

// ========================================
// OBTENER TODAS LAS PUBLICACIONES
// Incluye información del vendedor mediante JOIN
// ========================================
exports.obtenerTodos = async (req, res) => {
    try {
        const publicaciones = await Publicacion.obtenerTodos();
        res.json(publicaciones);
    } catch (error) {
        console.error("Error al obtener publicaciones:", error);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
};

// ========================================
// CREAR NUEVA PUBLICACIÓN
// Procesa imagen Base64 y guarda en el servidor
// ========================================
exports.crear = async (req, res) => {
    try {
        const { nombre, descripcion, categoria, vendedor_id, imagen, telefono, ubicacion } = req.body;
        
        let rutaImagen = null;
        if (imagen) {
            // Generar nombre único: vendedor_id + timestamp
            const timestamp = Date.now();
            const nombreArchivo = `${vendedor_id}-${timestamp}.jpg`;
            rutaImagen = guardarImagenDesdeBase64(imagen, nombreArchivo);
        }
        
        // Guardar publicación en la base de datos con la ruta de la imagen
        const result = await Publicacion.crear({ 
            nombre, 
            descripcion, 
            categoria,
            vendedor_id, 
            imagen: rutaImagen,
            telefono,
            ubicacion
        });
        
        res.json({ insertId: result.insertId });
        
    } catch (error) {
        console.error("Error al crear publicación:", error);
        res.status(500).json({ error: "Error al crear la publicación" });
    }
};

// ========================================
// ELIMINAR PUBLICACIÓN
// Elimina tanto el registro de BD como la imagen del servidor
// ========================================
exports.borrar = async (req, res) => {
    try {
        const { id_post } = req.params;

        // Obtener la publicación para eliminar su imagen física
        const publicaciones = await Publicacion.obtenerPorId(id_post);
        if (publicaciones.length > 0 && publicaciones[0].imagen) {
            const filePath = path.join(__dirname, '..', publicaciones[0].imagen);
            
            // Verificar si el archivo existe antes de eliminarlo
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Eliminar el registro de la base de datos
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

// ========================================
// EDITAR PUBLICACIÓN
// Actualiza datos y reemplaza imagen si se proporciona una nueva
// ========================================
exports.editar = async (req, res) => {
    const { id_post } = req.params;
    const data = req.body;

    try {
        // Si hay una nueva imagen, procesar el cambio
        if (data.imagen) {
            // Obtener publicación anterior para eliminar imagen vieja
            const publicaciones = await Publicacion.obtenerPorId(id_post);
            if (publicaciones.length > 0 && publicaciones[0].imagen) {
                const filePath = path.join(__dirname, '..', publicaciones[0].imagen);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            // Guardar nueva imagen en el servidor
            const timestamp = Date.now();
            const nombreArchivo = `${data.vendedor_id || 'temp'}-${timestamp}.jpg`;
            const rutaImagen = guardarImagenDesdeBase64(data.imagen, nombreArchivo);
            data.imagen = rutaImagen;
        }

        // Actualizar publicación en la base de datos
        const result = await Publicacion.editar(id_post, data);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Post no encontrado" });
        }
    
        return res.json({ message: "Post actualizado" });
        
    } catch (error) {
        console.error("Error al editar:", error);
        res.status(500).json({ error: "Error al editar" });
    }
};

// ========================================
// BÚSQUEDA AVANZADA DE PUBLICACIONES
// Soporta 3 tipos de búsqueda: publicaciones, vendedores y categorías
// ========================================
/**
 * Query params esperados:
 * - q: término de búsqueda
 * - tipo: 'publicaciones' | 'vendedores' | 'categorias'
 */
exports.buscar = async (req, res) => {
    try {
        const { q, tipo } = req.query;
        
        let result;
        
        // Enrutar búsqueda según el tipo
        if (tipo === 'categorias') {
            result = await Publicacion.buscarPorCategoria(q);
        } else if (tipo === 'vendedores') {
            result = await Publicacion.buscarPorVendedor(q);
        } else {
            // Por defecto buscar en nombre y descripción de publicaciones
            result = await Publicacion.buscar(q);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error("Error en búsqueda:", error);
        res.status(500).json({ error: "Error al buscar" });
    }
};