const API_URL = 'http://localhost:5002/ofertas';

function checkAccess() {
    const content = document.getElementById('ofertas-content');
    const loginRequired = document.getElementById('login-required');

    if (!isLoggedIn()) {
        content.style.display = 'none';
        loginRequired.style.display = 'block';
        return false;
    }

    content.style.display = 'block';
    loginRequired.style.display = 'none';
    return true;
}

async function cargarOfertas(especialidad = '') {
    try {
        const url = especialidad ? `${API_URL}?especialidad=${encodeURIComponent(especialidad)}` : API_URL;
        const response = await authFetch(url);

        if (response.status === 401) {
            clearSession();
            updateNav();
            checkAccess();
            return;
        }

        const ofertas = await response.json();
        mostrarOfertas(ofertas);
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        document.getElementById('ofertas-container').innerHTML = '<p class="text-danger">Error al cargar ofertas. Asegúrate de que el backend esté corriendo.</p>';
    }
}

function mostrarOfertas(ofertas) {
    const container = document.getElementById('ofertas-container');
    container.innerHTML = '';

    if (ofertas.length === 0) {
        container.innerHTML = '<p class="text-muted">No se encontraron ofertas.</p>';
        return;
    }

    ofertas.forEach(oferta => {
        const card = document.createElement('div');
        card.className = 'col-md-6 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${oferta.titulo}</h5>
                    <h6 class="card-subtitle">${oferta.empresa}</h6>
                    <p class="card-text" style="margin-top: 1rem; color: #666;">${oferta.descripcion}</p>
                    <p class="card-text"><strong style="color: #0D47A1;">Especialidad:</strong> ${oferta.especialidad}</p>
                    <p class="card-text"><strong style="color: #0D47A1;">Requisitos:</strong> ${oferta.requisitos}</p>
                    <div style="margin-top: 1rem;">
                        <a href="${oferta.enlace}" class="btn btn-primary btn-sm" target="_blank">Ver Oferta</a>
                        <button class="btn btn-secondary btn-sm" onclick="guardarFavorito('${oferta.titulo}')">❤️ Guardar</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function filtrarOfertas() {
    const especialidad = document.getElementById('filtro-especialidad').value.trim();
    cargarOfertas(especialidad);
}

function guardarFavorito(titulo) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    if (!favoritos.includes(titulo)) {
        favoritos.push(titulo);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        alert('✓ Oferta guardada en favoritos');
    } else {
        alert('✓ Ya está en tus favoritos');
    }
}

function onLoginSuccess() {
    if (checkAccess()) {
        cargarOfertas();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAccess()) {
        cargarOfertas();
    }

    // Filtrar cuando cambies el select
    document.getElementById('filtro-especialidad').addEventListener('change', filtrarOfertas);

    // Botón filtrar manual
    document.getElementById('btn-filtrar').addEventListener('click', filtrarOfertas);

    // Botón limpiar
    document.getElementById('btn-limpiar').addEventListener('click', () => {
        document.getElementById('filtro-especialidad').value = '';
        cargarOfertas();
    });
});
