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
                <div class="card">
                    <div class="card-image">${emp.icono}</div>
                    <div class="card-content">
                        <h3 class="card-title">${emp.nombre}</h3>
                        <span class="card-category">${emp.categoria}</span>
                        <p class="card-description">${emp.descripcion}</p>
                        <div class="card-footer">
                            <a href="#" class="card-btn">Ver más <i class="fas fa-arrow-right"></i></a>
                            <div class="card-rating">${generateStars(emp.rating)}</div>
                        </div>
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
        // Mapear si necesitas agregar icono y rating
        emprendimientos = data.map(emp => ({
            id: emp.id_post,
            nombre: emp.nombre,
            categoria: emp.status,
            descripcion: emp.descripcion,
            icono: '.',    // placeholder si no tienes ícono
            rating: 5       // valor por defecto
        }));
        renderCards(emprendimientos);
    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
    }
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