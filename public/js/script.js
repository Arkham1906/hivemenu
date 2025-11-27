// ========================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ========================================
// URL base del backend para todas las peticiones a la API
const API_URL = 'http://localhost:3000/api';

// ========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// Almacena datos en memoria durante la sesión (sin localStorage)
// Estos datos se pierden al recargar la página
// ========================================
let publicaciones = [];           // Array con todas las publicaciones cargadas desde la API
let modoEdicion = false;          // Indica si el modal está en modo crear (false) o editar (true)
let idEditando = null;            // ID de la publicación que se está editando
let usuarioActual = null;         // Objeto con datos del usuario logueado (nombre, correo, id_vendedor, etc.)
let tipoBusqueda = 'publicaciones'; // Tipo de búsqueda seleccionada: 'publicaciones', 'vendedores' o 'categorias'

// ========================================
// UTILIDADES - CONVERSIÓN DE IMÁGENES
// ========================================

/**
 * Convierte un archivo de imagen a formato Base64
 * Base64 permite almacenar imágenes como strings en la base de datos
 * @param {File} file - Archivo de imagen del input type="file"
 * @returns {Promise<string>} - String Base64 con el formato data:image/...;base64,...
 */
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Listener para mostrar preview de la imagen seleccionada
// Se activa cuando el usuario selecciona un archivo en el input
const imagenInput = document.getElementById('imagen');
imagenInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const base64 = await convertToBase64(file);
        document.getElementById('previewImg').src = base64;
        document.getElementById('imagePreview').classList.add('active');
    }
});

// ========================================
// SISTEMA DE MENSAJES DE NOTIFICACIÓN
// Muestra mensajes temporales de éxito o error al usuario
// Los mensajes se ocultan automáticamente después de 4 segundos
// ========================================

function mostrarError(mensaje) {
    const errorMsg = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = mensaje;
    errorMsg.classList.add('show');
    setTimeout(() => errorMsg.classList.remove('show'), 4000);
}

function mostrarExito(mensaje) {
    const successMsg = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    successText.textContent = mensaje;
    successMsg.classList.add('show');
    setTimeout(() => successMsg.classList.remove('show'), 4000);
}

// Oculta todos los mensajes activos (útil antes de mostrar uno nuevo)
function limpiarMensajes() {
    document.getElementById('errorMessage').classList.remove('show');
    document.getElementById('successMessage').classList.remove('show');
}

// ========================================
// SISTEMA DE AUTENTICACIÓN
// Gestiona el estado de la sesión del usuario
// ========================================

// Función inicial que verifica si hay un usuario logueado
// Si no hay sesión, muestra el formulario de autenticación
function verificarSesion() {
    mostrarAuth();
    cargarPublicaciones();
}

/**
 * Actualiza la interfaz con los datos del usuario logueado
 * - Muestra el menú de usuario en el navbar
 * - Genera iniciales del nombre si no tiene avatar
 * - Actualiza todos los elementos del perfil
 */
function mostrarUsuarioLogueado() {
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const perfilName = document.getElementById('perfilName');
    const perfilEmail = document.getElementById('perfilEmail');
    const perfilAvatar = document.getElementById('perfilAvatar');

    userMenu.classList.add('active');

    // Genera iniciales: "Juan Pérez" -> "JP"
    const iniciales = usuarioActual.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    userName.textContent = usuarioActual.nombre.split(' ')[0]; // Solo el primer nombre
    perfilName.textContent = usuarioActual.nombre;
    perfilEmail.textContent = usuarioActual.correo;
    perfilAvatar.textContent = iniciales;
}

function mostrarAuth() {
    document.getElementById('authContainer').classList.add('active');
}

function ocultarAuth() {
    document.getElementById('authContainer').classList.remove('active');
}

// ========================================
// NAVEGACIÓN ENTRE TABS (LOGIN/REGISTRO)
// ========================================

const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

function cambiarALogin() {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    limpiarMensajes();
}

function cambiarASignup() {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    limpiarMensajes();
}

loginTab.addEventListener('click', cambiarALogin);
signupTab.addEventListener('click', cambiarASignup);
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    cambiarASignup();
});
switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    cambiarALogin();
});

// ========================================
// AUTENTICACIÓN - LOGIN
// Envía credenciales al backend y actualiza el estado de la aplicación
// ========================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensajes();

    const correo = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        // Petición POST al endpoint de login
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json();

        // Si las credenciales son incorrectas, mostrar error del servidor
        if (!response.ok) {
            mostrarError(data.error);
            return;
        }

        // Guardar datos del usuario en memoria
        usuarioActual = data.vendedor;
        mostrarExito('¡Bienvenido de nuevo!');
        
        // Esperar 1.5s para que el usuario vea el mensaje antes de cerrar el modal
        setTimeout(() => {
            ocultarAuth();
            mostrarUsuarioLogueado();
            loginForm.reset();
            cargarPublicaciones(); // Recargar para mostrar botones de edición en publicaciones propias
        }, 1500);

    } catch (error) {
        console.error('Error en login:', error);
        mostrarError('Error de conexión con el servidor');
    }
});

// ========================================
// AUTENTICACIÓN - REGISTRO
// Valida datos y crea una nueva cuenta de usuario
// ========================================

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarMensajes();

    const nombre = document.getElementById('signupName').value.trim();
    const correo = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validaciones del lado del cliente
    if (password !== confirmPassword) {
        mostrarError('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        // Petición POST al endpoint de registro
        const response = await fetch(`${API_URL}/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, password })
        });

        const data = await response.json();

        // El servidor puede devolver errores como "correo ya registrado"
        if (!response.ok) {
            mostrarError(data.error);
            return;
        }

        mostrarExito('¡Cuenta creada exitosamente!');

        // Redirigir al login con el correo pre-llenado para facilitar el acceso
        setTimeout(() => {
            cambiarALogin();
            signupForm.reset();
            document.getElementById('loginEmail').value = correo;
        }, 1500);

    } catch (error) {
        console.error('Error en registro:', error);
        mostrarError('Error de conexión con el servidor');
    }
});

// ========================================
// GESTIÓN DE SESIÓN - CERRAR SESIÓN
// Limpia el estado de la aplicación y vuelve al estado inicial
// ========================================

document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar estado del usuario
        usuarioActual = null;
        
        // Ocultar elementos de usuario logueado
        document.getElementById('userMenu').classList.remove('active');
        ocultarPerfil();
        mostrarAuth();
        
        // Resetear formularios
        loginForm.reset();
        signupForm.reset();
        
        // Recargar publicaciones (sin botones de edición)
        cargarPublicaciones();
    }
});

// ========================================
// GESTIÓN DE PERFIL DE USUARIO
// Permite al usuario editar su información personal
// ========================================

// Abre el modal con los datos actuales del usuario
document.getElementById('btnEditarPerfil').addEventListener('click', () => {
    document.getElementById('editNombre').value = usuarioActual.nombre;
    document.getElementById('editEmail').value = usuarioActual.correo;
    document.getElementById('editBio').value = usuarioActual.bio || '';
    document.getElementById('editPerfilModal').classList.add('active');
});

document.getElementById('closePerfilModal').addEventListener('click', () => {
    document.getElementById('editPerfilModal').classList.remove('active');
});

// Envía los datos actualizados al backend
document.getElementById('editPerfilForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('editNombre').value;
    const correo = document.getElementById('editEmail').value;
    const bio = document.getElementById('editBio').value;
    
    try {
        // Petición PUT para actualizar datos del vendedor
        const response = await fetch(`${API_URL}/vendedores/${usuarioActual.id_vendedor}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, bio })
        });

        if (!response.ok) throw new Error('Error al actualizar');

        // Actualizar el estado local con los nuevos datos
        usuarioActual.nombre = nombre;
        usuarioActual.correo = correo;
        usuarioActual.bio = bio;
        
        // Actualizar UI: navbar y sección de perfil
        mostrarUsuarioLogueado();
        
        document.getElementById('perfilName').textContent = nombre;
        document.getElementById('perfilEmail').textContent = correo;
        document.getElementById('perfilBio').textContent = bio;
        
        mostrarExito('¡Perfil actualizado exitosamente!');
        document.getElementById('editPerfilModal').classList.remove('active');

    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar el perfil');
    }
});

// ========================================
// GESTIÓN DE PUBLICACIONES - CARGAR
// Obtiene todas las publicaciones desde el backend
// ========================================

async function cargarPublicaciones() {
    try {
        const response = await fetch(`${API_URL}/emprendimientos`);
        const data = await response.json();
        
        // Actualizar array global de publicaciones
        publicaciones = data;
        
        // Renderizar en la vista principal
        renderCards(publicaciones);
        
        // Si hay usuario logueado, actualizar también su sección de perfil
        if (usuarioActual) {
            renderMisPublicaciones();
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        mostrarError('Error al cargar publicaciones');
    }
}

// ========================================
// RENDERIZADO DE TARJETAS DE PUBLICACIONES
// Genera el HTML dinámicamente para cada publicación
// ========================================

/**
 * Genera el HTML de una tarjeta de publicación
 * @param {Object} pub - Objeto con datos de la publicación (id_post, nombre, descripcion, imagen, etc.)
 * @param {boolean} showActions - Si es true, muestra botones de editar/eliminar (para publicaciones propias)
 * @returns {string} HTML de la tarjeta
 */
function createCard(pub, showActions = false) {
    // Si la publicación tiene imagen en Base64, la muestra; sino muestra inicial de la categoría
    const imageHTML = pub.imagen 
        ? `<img src="${pub.imagen}" alt="${pub.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
        : `<span style="font-size: 3rem; color: var(--warm-gold);">${pub.categoria ? pub.categoria.charAt(0).toUpperCase() : 'P'}</span>`;

    // Los botones de edición/eliminación solo aparecen en "Mis Publicaciones"
    const actionsHTML = showActions ? `
        <div class="card-actions">
            <button class="btn-edit" onclick="editarPublicacion(${pub.id_post})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-delete" onclick="eliminarPublicacion(${pub.id_post})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    ` : '';

    return `
        <div class="card">
            <div class="card-image">${imageHTML}</div>
            <div class="card-content">
                <h3 class="card-title">${pub.nombre}</h3>
                <span class="card-category">${pub.categoria || 'Disponible'}</span>
                <p class="card-description">${pub.descripcion}</p>
                <div class="card-footer">
                    <button class="card-btn" onclick="verDetalle(${pub.id_post})" style="border: none; cursor: pointer;">
                        Ver más <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                ${actionsHTML}
            </div>
        </div>
    `;
}

// Renderiza el array de publicaciones en el grid principal
function renderCards(data) {
    const grid = document.getElementById('cardsGrid');
    
    // Si no hay resultados, muestra mensaje de estado vacío
    if (data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3 style="color: #666;">No se encontraron resultados</h3>
                <p style="color: #999;">Intenta con otros términos de búsqueda</p>
            </div>
        `;
    } else {
        // Genera una tarjeta por cada publicación (sin botones de acción)
        grid.innerHTML = data.map(pub => createCard(pub, false)).join('');
    }
}

// ========================================
// MODAL DE DETALLE DE PUBLICACIÓN
// ========================================

function verDetalle(id) {
    const pub = publicaciones.find(p => p.id_post === id);
    if (!pub) return;

    document.getElementById('detailName').textContent = pub.nombre;
    document.getElementById('detailCategoria').textContent = pub.categoria || 'Disponible';
    document.getElementById('detailEmprendedor').textContent = pub.vendedor_nombre || 'Vendedor';
    document.getElementById('detailTelefono').textContent = pub.telefono || 'No disponible';
    document.getElementById('detailUbicacion').textContent = pub.ubicacion || 'No especificada';
    document.getElementById('detailDescripcion').textContent = pub.descripcion;

    const detailImage = document.getElementById('detailImage');
    if (pub.imagen) {
        detailImage.innerHTML = `<img src="${pub.imagen}" alt="${pub.nombre}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
    } else {
        detailImage.innerHTML = `<span style="font-size: 4rem; color: var(--warm-gold);">${pub.categoria ? pub.categoria.charAt(0).toUpperCase() : 'P'}</span>`;
    }

    document.getElementById('detailModal').classList.add('active');
}

document.getElementById('closeDetailModal').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
});

document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') {
        document.getElementById('detailModal').classList.remove('active');
    }
});

window.verDetalle = verDetalle;

// ========================================
// MIS PUBLICACIONES - VISTA DEL USUARIO
// ========================================

function renderMisPublicaciones() {
    if (!usuarioActual) return;

    const misPublicaciones = publicaciones.filter(
        pub => pub.vendedor_id === usuarioActual.id_vendedor
    );
    
    const container = document.getElementById('misPublicaciones');
    const totalElement = document.getElementById('totalPublicaciones');
    
    totalElement.textContent = misPublicaciones.length;

    if (misPublicaciones.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Aún no tienes publicaciones</h3>
                <p>¡Crea tu primera publicación y comienza a compartir tus productos!</p>
            </div>
        `;
    } else {
        container.innerHTML = misPublicaciones.map(pub => createCard(pub, true)).join('');
    }
}

// ========================================
// SISTEMA DE BÚSQUEDA
// Permite buscar por publicaciones, vendedores o categorías
// Incluye debounce para evitar peticiones excesivas
// ========================================

const searchInput = document.getElementById('searchInput');
const searchBar = document.querySelector('.search-bar');

// Crea selector de tipo de búsqueda dinámicamente e inserta en el DOM
const searchTypeSelector = document.createElement('select');
searchTypeSelector.id = 'searchType';
searchTypeSelector.innerHTML = `
    <option value="publicaciones">Publicaciones</option>
    <option value="vendedores">Vendedores</option>
    <option value="categorias">Categorías</option>
`;
searchTypeSelector.style.cssText = `
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    margin-right: 1rem;
    min-width: 150px;
`;

searchBar.insertBefore(searchTypeSelector, searchInput);

// Cambia el tipo de búsqueda y actualiza el placeholder del input
searchTypeSelector.addEventListener('change', (e) => {
    tipoBusqueda = e.target.value;
    
    const placeholders = {
        'publicaciones': 'Buscar publicaciones...',
        'vendedores': 'Buscar por vendedor...',
        'categorias': 'Buscar por categoría...'
    };
    searchInput.placeholder = placeholders[tipoBusqueda];
    
    // Si ya hay texto escrito, buscar inmediatamente con el nuevo tipo
    if (searchInput.value.trim()) {
        realizarBusqueda(searchInput.value.trim());
    }
});

// Búsqueda con debounce: espera 500ms después de que el usuario deja de escribir
let timeoutBusqueda;
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    
    clearTimeout(timeoutBusqueda);
    
    // Si el input está vacío, mostrar todas las publicaciones
    if (searchTerm === '') {
        cargarPublicaciones();
        return;
    }
    
    // Esperar 500ms antes de hacer la petición
    timeoutBusqueda = setTimeout(() => {
        realizarBusqueda(searchTerm);
    }, 500);
});

// Realiza la petición de búsqueda al backend
async function realizarBusqueda(termino) {
    try {
        // Envía el término y el tipo de búsqueda como query params
        const response = await fetch(`${API_URL}/emprendimientos/buscar?q=${encodeURIComponent(termino)}&tipo=${tipoBusqueda}`);
        const data = await response.json();
        
        // Actualizar publicaciones con los resultados
        publicaciones = data;
        renderCards(publicaciones);
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarError('Error al realizar la búsqueda');
    }
}

// ========================================
// MENÚ MÓVIL - TOGGLE
// ========================================

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// ========================================
// MODAL DE CREAR/EDITAR PUBLICACIÓN
// ========================================

const modal = document.getElementById('createModal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const createForm = document.getElementById('createForm');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');

openModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!usuarioActual) {
        mostrarError('Debes iniciar sesión para crear una publicación');
        mostrarAuth();
        return;
    }
    
    abrirModalCrear();
});

function abrirModalCrear() {
    modoEdicion = false;
    idEditando = null;
    modalTitle.textContent = 'Crear Publicación';
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar';
    createForm.reset();
    document.getElementById('imagePreview').classList.remove('active');
    modal.classList.add('active');
}

function abrirModalEditar(pub) {
    modoEdicion = true;
    idEditando = pub.id_post;
    modalTitle.textContent = 'Editar Publicación';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    
    document.getElementById('nombre').value = pub.nombre;
    document.getElementById('categoria').value = pub.categoria || '';
    document.getElementById('descripcion').value = pub.descripcion;
    document.getElementById('telefono').value = pub.telefono || '';
    document.getElementById('ubicacion').value = pub.ubicacion || '';
    
    if (pub.imagen) {
        document.getElementById('previewImg').src = pub.imagen;
        document.getElementById('imagePreview').classList.add('active');
    }
    
    modal.classList.add('active');
}

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// ========================================
// CREAR/EDITAR PUBLICACIÓN - SUBMIT
// Maneja tanto la creación como la edición de publicaciones
// ========================================

createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Convertir imagen a Base64 si fue seleccionada
    const imageFile = document.getElementById('imagen').files[0];
    let imagenBase64 = null;

    if (imageFile) {
        imagenBase64 = await convertToBase64(imageFile);
    }
    
    // Recopilar datos del formulario
    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value;
    const telefono = document.getElementById('telefono').value || '';
    const ubicacion = document.getElementById('ubicacion').value || '';

    try {
        if (modoEdicion) {
            // MODO EDICIÓN: actualizar publicación existente
            const bodyData = { nombre, categoria, descripcion, telefono, ubicacion };
            
            // Solo incluir imagen si se seleccionó una nueva
            if (imagenBase64) {
                bodyData.imagen = imagenBase64;
            }

            const response = await fetch(`${API_URL}/emprendimientos/${idEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) throw new Error('Error al editar');
            
            mostrarExito('¡Publicación actualizada exitosamente!');
        } else {
            // MODO CREACIÓN: crear nueva publicación
            const response = await fetch(`${API_URL}/emprendimientos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, 
                    categoria, 
                    descripcion,
                    telefono,
                    ubicacion,
                    imagen: imagenBase64,
                    vendedor_id: usuarioActual.id_vendedor // Asociar con el usuario logueado
                })
            });

            if (!response.ok) throw new Error('Error al crear');
            
            mostrarExito('¡Publicación creada exitosamente!');
        }

        // Recargar publicaciones para ver los cambios
        await cargarPublicaciones();
        
        // Limpiar y cerrar modal
        createForm.reset();
        document.getElementById('imagePreview').classList.remove('active');
        modal.classList.remove('active');

    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al guardar la publicación');
    }
});

// ========================================
// OPERACIONES CRUD - EDITAR Y ELIMINAR
// Funciones expuestas globalmente para uso en onclick de las tarjetas
// ========================================

// Busca la publicación por ID y abre el modal de edición
async function editarPublicacion(id) {
    const pub = publicaciones.find(p => p.id_post === id);
    if (pub) {
        abrirModalEditar(pub);
    }
}

// Elimina una publicación con confirmación del usuario
async function eliminarPublicacion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;

    try {
        const response = await fetch(`${API_URL}/emprendimientos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');
        
        mostrarExito('¡Publicación eliminada exitosamente!');
        
        // Recargar lista de publicaciones
        await cargarPublicaciones();

    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar la publicación');
    }
}

// Exponer funciones al ámbito global para que funcionen con onclick en HTML generado
window.editarPublicacion = editarPublicacion;
window.eliminarPublicacion = eliminarPublicacion;

// ========================================
// NAVEGACIÓN Y VISTAS DE LA APLICACIÓN
// Controla qué secciones se muestran u ocultan
// ========================================

const emprendimientosSection = document.getElementById('emprendimientos');
const perfilSection = document.getElementById('perfilSection');
const heroSection = document.querySelector('.hero');

// Muestra la vista de perfil del usuario y oculta las demás secciones
function mostrarPerfil() {
    if (!usuarioActual) {
        mostrarAuth();
        return;
    }

    heroSection.style.display = 'none';
    emprendimientosSection.style.display = 'none';
    perfilSection.classList.add('active');
    
    // Actualizar "Mis Publicaciones"
    renderMisPublicaciones();
    
    // Hacer scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Oculta la vista de perfil y muestra las secciones principales
function ocultarPerfil() {
    heroSection.style.display = 'block';
    emprendimientosSection.style.display = 'block';
    perfilSection.classList.remove('active');
}

// Manejo de clics en los enlaces de navegación (.nav-link)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href === '#perfil') {
            e.preventDefault();
            mostrarPerfil();
        } else if (href === '#inicio' || href === '#emprendimientos') {
            e.preventDefault();
            ocultarPerfil();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Scroll suave para todos los enlaces internos de la página
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href === '#perfil') {
            e.preventDefault();
            mostrarPerfil();
            return;
        }
        
        if (href === '#inicio' || href === '#emprendimientos') {
            e.preventDefault();
            ocultarPerfil();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // Cerrar el menú móvil si está abierto
        navMenu.classList.remove('active');
    });
});

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// Punto de entrada: se ejecuta cuando el DOM está completamente cargado
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion(); // Muestra formulario de auth y carga publicaciones iniciales
});