// API_BASE_URL se define en config.js (cargado antes de este archivo).
const OFERTAS_URL = `${API_BASE_URL}/ofertas`;

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

async function cargarOfertas(area = '') {
    const container = document.getElementById('ofertas-container');
    container.innerHTML = '<p class="text-muted">Cargando ofertas...</p>';

    try {
        const url = area ? `${OFERTAS_URL}?area=${encodeURIComponent(area)}` : OFERTAS_URL;
        const response = await authFetch(url);

        if (response.status === 401) {
            clearSession();
            updateNav();
            checkAccess();
            return;
        }

        if (!response.ok) {
            throw new Error(`El backend respondió con estado ${response.status}.`);
        }

        const ofertas = await response.json();
        mostrarOfertas(ofertas);
    } catch (error) {
        console.error('Error cargando ofertas:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar ofertas. Asegúrate de que el backend esté corriendo en ' + API_BASE_URL + '.</p>';
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
        
        // 🔥 CORREGIDO: Escapar los títulos para evitar problemas con comillas
        const tituloEscapado = escapeHtml(oferta.titulo);
        
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${oferta.titulo}</h5>
                    <h6 class="card-subtitle">${oferta.empresa}</h6>
                    <p class="card-text" style="margin-top: 1rem; color: #666;">${oferta.descripcion || ''}</p>
                    <p class="card-text"><strong style="color: #0D47A1;">Área:</strong> ${oferta.area || '-'}</p>
                    <p class="card-text"><strong style="color: #0D47A1;">Modalidad:</strong> ${oferta.modalidad || '-'} · <strong style="color: #0D47A1;">Ubicación:</strong> ${oferta.ubicacion || '-'}</p>
                    <p class="card-text"><strong style="color: #0D47A1;">Duración:</strong> ${oferta.duracion || '-'}</p>
                    <div style="margin-top: 1rem;">
                        <a href="${oferta.link}" class="btn btn-primary btn-sm" target="_blank">Ver Oferta</a>
                        <button class="btn btn-success btn-sm" onclick="postularOferta('${tituloEscapado}')">📨 Postular</button>
                        <button class="btn btn-secondary btn-sm" onclick="guardarFavorito('${tituloEscapado}')">❤️ Guardar</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 🔥 Función auxiliar para escapar caracteres especiales
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// 🔥 CORREGIDO: Función postularOferta mejorada
function postularOferta(titulo) {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        alert('Debes iniciar sesión para postular.');
        return;
    }

    // Obtener postulaciones actuales
    let postulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    // Asegurar que sea un array de strings
    postulaciones = postulaciones.map(item => {
        if (typeof item === 'object' && item !== null) {
            return item.titulo || item.nombre || item.title || String(item);
        }
        return String(item);
    });

    // Verificar si ya existe
    if (!postulaciones.includes(titulo)) {
        postulaciones.push(titulo);
        localStorage.setItem('postulaciones', JSON.stringify(postulaciones));
        alert('✓ Postulación guardada correctamente');
    } else {
        alert('✓ Ya postulaste a esta oferta');
    }
}

function filtrarOfertas() {
    const area = document.getElementById('filtro-area').value.trim();
    cargarOfertas(area);
}

// 🔥 CORREGIDO: Función guardarFavorito mejorada
function guardarFavorito(titulo) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    
    // Asegurar que todos sean strings
    favoritos = favoritos.map(item => String(item));
    
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

    // Filtrar al presionar Enter en el campo de texto
    const filtroArea = document.getElementById('filtro-area');
    if (filtroArea) {
        filtroArea.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') filtrarOfertas();
        });
    }

    // Botón filtrar manual
    const btnFiltrar = document.getElementById('btn-filtrar');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', filtrarOfertas);
    }

    // Botón limpiar
    const btnLimpiar = document.getElementById('btn-limpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            const filtroArea = document.getElementById('filtro-area');
            if (filtroArea) filtroArea.value = '';
            cargarOfertas();
        });
    }
});