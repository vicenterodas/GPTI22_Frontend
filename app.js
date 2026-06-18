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
                        <button class="btn btn-success btn-sm" onclick="postularOferta('${oferta.id}')">📨 Postular</button>
                        <button class="btn btn-secondary btn-sm" onclick="guardarFavorito('${oferta.titulo}')">❤️ Guardar</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Envía una postulación al backend. El endpoint POST /postulaciones aún
// no existe en el backend actual (ver README) por lo que un 404/405 se
// muestra como "función no disponible" en vez de un error genérico.
async function postularOferta(ofertaId) {
    const userId = await ensureUserId();
    if (!userId) {
        alert('Debes iniciar sesión para postular.');
        return;
    }

    try {
        // oferta_id es el uuid (string) que devuelve GET /ofertas, no un entero.
        const response = await authFetch(`${API_BASE_URL}/postulaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: Number(userId), oferta_id: ofertaId })
        });

        if (response.status === 404 || response.status === 405) {
            alert('Esta función todavía no está disponible: falta implementar POST /postulaciones en el backend.');
            return;
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || 'No se pudo enviar la postulación.');
        }

        alert('✓ Postulación enviada correctamente');
    } catch (error) {
        console.error('Error al postular:', error);
        alert('Error al enviar la postulación: ' + error.message);
    }
}

function filtrarOfertas() {
    const area = document.getElementById('filtro-area').value.trim();
    cargarOfertas(area);
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

    // Filtrar al presionar Enter en el campo de texto
    document.getElementById('filtro-area').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') filtrarOfertas();
    });

    // Botón filtrar manual
    document.getElementById('btn-filtrar').addEventListener('click', filtrarOfertas);

    // Botón limpiar
    document.getElementById('btn-limpiar').addEventListener('click', () => {
        document.getElementById('filtro-area').value = '';
        cargarOfertas();
    });
});
