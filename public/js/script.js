
//======================================== JAVASCRIPT ========================================

// ========================================
// DATOS DE EMPRENDIMIENTOS (solo ejemplos)
// ========================================

        const emprendimientos = [
            {
                id: 1,
                nombre: "Coffee Break",
                categoria: "Bebidas",
                descripcion: "Pequeña cafetería con bebidas y postres caseros. ¡El mejor café del campus!",
                icono: ".",
                rating: 3
            },
            {
                id: 2,
                nombre: "Rollito",
                categoria: "Alimentos",
                descripcion: "Venta de comida orienta como sushi y onigiris para la comunidad universitaria.",
                icono: ".",
                rating: 4
            },
            {
                id: 3,
                nombre: "Honor Tab",
                categoria: "Misceláneos",
                descripcion: "Venta de accesorios para dispositivos móviles y tabletas.",
                icono: ".",
                rating: 5
            },
            {
                id: 4,
                nombre: "Ferchukies",
                categoria: "Snacks",
                descripcion: "Galletas artesanales con ingredientes naturales. Variedad de sabores para todos los gustos.",
                icono: ".",
                rating: 4
            },
            {
                id: 5,
                nombre: "Tortas 'La Labor'",
                categoria: "Alimentos",
                descripcion: "Comida rápida y deliciosa a precios accesibles. Tortas de pierna todos los días.",
                icono: ".",
                rating: 4.5
            },
            {
                id: 6,
                nombre: "GlowFruit",
                categoria: "Snacks",
                descripcion: "Venta de frutas deshidratas y galletas saludable.",
                icono: ".",
                rating: 5
            }
        ];

// ========================================
    // FUNCIONES PARA GENERAR TARJETAS
// ========================================
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

        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newEmp = {
                id: emprendimientos.length + 1,
                nombre: document.getElementById('nombre').value,
                categoria: document.getElementById('categoria').value,
                descripcion: document.getElementById('descripcion').value,
                icono: '.',
                rating: 4
            };

            emprendimientos.unshift(newEmp);
            renderCards(emprendimientos);
            
            createForm.reset();
            modal.classList.remove('active');
            
            alert('¡Emprendimiento creado exitosamente!');
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

// ========================================
    // INICIALIZACIÓN
// ========================================
        document.addEventListener('DOMContentLoaded', () => {
            renderCards(emprendimientos);
        });
