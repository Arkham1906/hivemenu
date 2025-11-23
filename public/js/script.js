// ========================================
    // FUNCIONES PARA GENERAR TARJETAS
// ========================================
let emprendimientos = [];
        
function generateStars(rating) {
            let stars = '';
            for (let i = 0; i < 5; i++) {
                stars += i < rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }
            return stars;
        }

        function createCard(emp) {
            return `
                <div class="card" id="post-${emp.id}">
                    <div class="card-image">${emp.icono}</div>
                    <div class="card-content">
                        <h3 class="card-title">${emp.nombre}</h3>
                        <span class="card-category">${emp.categoria}</span>
                        <p class="card-description">${emp.descripcion}</p>
                        <div class="card-footer">
                            <a href="#" class="card-btn">Ver más <i class="fas fa-arrow-right"></i></a>
                            <div class="card-rating">${generateStars(emp.rating)}</div>
                        </div>
                        <button onclick="borrarPost(${emp.id})" type="button" class="modal-btn">
                            <i class="fas fa-paper-plane"></i> Eliminar
                        </button>
                        <button onclick="editarPost(${emp.id_post})" class="modal-btn edit">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                </div>
            `;
        }

        function renderCards(data) {
            const grid = document.getElementById('cardsGrid');
            grid.innerHTML = data.map(emp => createCard(emp)).join('');
        }

// ========================================
    // BUSCADOR
// ========================================
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = emprendimientos.filter(emp => 
                emp.nombre.toLowerCase().includes(searchTerm) ||
                emp.categoria.toLowerCase().includes(searchTerm) ||
                emp.descripcion.toLowerCase().includes(searchTerm)
            );
            renderCards(filtered);
        });

// ========================================
    // MENÚ MÓVIL
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
    // MODAL DE CREACIÓN
// ========================================
        const modal = document.getElementById('createModal');
        const openModalBtn = document.getElementById('openModal');
        const closeModalBtn = document.getElementById('closeModal');
        const createForm = document.getElementById('createForm');

        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // ========================================
// GUARDAR EMPRENDIMIENTO EN EL BACKEND
// ========================================
createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        status: document.getElementById('categoria').value,
        vendedor_id: document.getElementById('vendedor_id').value,
        precio: 0
    };

    try {
        const res = await fetch('/api/emprendimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Error al crear");

        const newEmp = {
            id: result.insertId,
            nombre: data.nombre,
            categoria: data.status,
            descripcion: data.descripcion,
            icono: '.',
            rating: 4
        };

        emprendimientos.unshift(newEmp);
        renderCards(emprendimientos);

        createForm.reset();
        document.getElementById('createModal').classList.remove('active');

        alert('¡Publicación creada y mostrada en el front!');
    } catch (error) {
        console.error("Error al crear publicación:", error);
        alert("Hubo un problema al guardar la publicación.");
    }
});



// ========================================
    // SCROLL SUAVE
// ========================================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Cerrar menú móvil si está abierto
                    navMenu.classList.remove('active');
                }
            });
        });

async function cargarEmprendimientos() {
    try {
        const res = await fetch('/api/emprendimientos');
        const data = await res.json();
        emprendimientos = data.map(emp => ({
            id: emp.id_post,
            nombre: emp.nombre,
            categoria: emp.status,
            descripcion: emp.descripcion,
            icono: '.',    
            rating: 5
        }));
        renderCards(emprendimientos);
    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
    }
}

async function borrarPost(id_post) {
    if (!id_post) {
        console.error("id_post no válido:", id_post);
        return;
    }

    if (!confirm("¿Seguro que deseas eliminar este post?")) return;

    try {
        const response = await fetch(`/api/emprendimientos/${id_post}`, {
            method: "DELETE"
        });

        const data = await response.json();
        console.log("respuesta DELETE:", response.status, data);

        if (!response.ok) {
            alert("Error al borrar: " + data.error);
            return;
        }
        const card = document.getElementById(`post-${id_post}`);
        if (card) card.remove();

        alert("Publicación eliminada.");
    } catch (err) {
        console.error("Error en borrarPost:", err);
        alert("Ocurrió un error en la petición.");
    }
}

function editarPost(id_post) {
    const emp = emprendimientos.find(e => e.id === id_post);

    if (!emp) return alert("Post no encontrado");

    document.getElementById("edit_nombre").value = emp.nombre;
    document.getElementById("edit_descripcion").value = emp.descripcion;
    document.getElementById("edit_categoria").value = emp.categoria;

    document.getElementById("edit_id_post").value = id_post;

    document.getElementById("editModal").classList.add("active");
}

async function guardarEdicion() {
    const id_post = document.getElementById("edit_id_post").value;

    const data = {
        nombre: document.getElementById("edit_nombre").value,
        descripcion: document.getElementById("edit_descripcion").value,
        status: document.getElementById("edit_categoria").value,
        vendedor_id: 1, // si no cambia
        precio: 0
    };

    const res = await fetch(`/api/emprendimientos/${id_post}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
        alert(result.error);
        return;
    }

    // 🔥 Actualizar en memoria
    const index = emprendimientos.findIndex(e => e.id === parseInt(id_post));
    if (index !== -1) {
        emprendimientos[index] = { ...emprendimientos[index], ...data };
    }

    // 🔄 Renderizar de nuevo
    renderCards(emprendimientos);

    document.getElementById("editModal").classList.remove("active");

    alert("Post actualizado");
}


document.addEventListener('DOMContentLoaded', () => {
    cargarEmprendimientos();
});

// ========================================
    // INICIALIZACIÓN
// ========================================
        document.addEventListener('DOMContentLoaded', () => {
            renderCards(emprendimientos);
        });