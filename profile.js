function checkAccess() {
    const profileContent = document.getElementById('profile-content');
    const loginRequired = document.getElementById('login-required');

    if (!isLoggedIn()) {
        profileContent.style.display = 'none';
        loginRequired.style.display = 'block';
        return false;
    } else {
        profileContent.style.display = 'block';
        loginRequired.style.display = 'none';
        loadProfile();
        return true;
    }
}

function loadProfile() {
    const email = localStorage.getItem('userEmail') || 'Usuario';
    const nombre = localStorage.getItem('userNombre') || email.split('@')[0];
    const loginDate = localStorage.getItem('loginDate') || 'No disponible';

    document.getElementById('user-name').textContent = `Bienvenido, ${nombre}!`;
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-date').textContent = loginDate;

    loadFavorites();
    loadPostulaciones();
}

// GET /usuarios/:id/postulaciones todavía no existe en el backend actual
// (ver README). Mientras no esté implementado, un 404 se muestra como
// "función no disponible" en vez de un error genérico.
async function loadPostulaciones() {
    const list = document.getElementById('applications-list');
    list.innerHTML = '<p class="text-muted">Cargando postulaciones...</p>';

    const userId = await ensureUserId();
    if (!userId) {
        list.innerHTML = '<p class="text-danger">No se pudo identificar al usuario actual.</p>';
        return;
    }

    try {
        const response = await authFetch(`${API_BASE_URL}/usuarios/${userId}/postulaciones`);

        if (response.status === 404) {
            list.innerHTML = '<p class="text-muted">Esta función estará disponible cuando el backend implemente GET /usuarios/:id/postulaciones.</p>';
            return;
        }

        if (!response.ok) {
            throw new Error(`El backend respondió con estado ${response.status}.`);
        }

        const postulaciones = await response.json();
        mostrarPostulaciones(postulaciones);
    } catch (error) {
        console.error('Error cargando postulaciones:', error);
        list.innerHTML = '<p class="text-danger">Error al cargar tus postulaciones.</p>';
    }
}

function mostrarPostulaciones(postulaciones) {
    const list = document.getElementById('applications-list');

    if (!postulaciones || postulaciones.length === 0) {
        list.innerHTML = '<p class="text-muted">No has realizado postulaciones aún.</p>';
        return;
    }

    list.innerHTML = postulaciones.map(p => `
        <div style="margin-bottom: 0.5rem;">
            <span>• ${p.titulo || p.oferta_titulo || ('Oferta #' + p.oferta_id)}</span>
            ${p.empresa ? `<span class="text-muted"> - ${p.empresa}</span>` : ''}
            ${p.estado ? `<span class="badge badge-primary ms-2">${p.estado}</span>` : ''}
        </div>
    `).join('');
}

function loadFavorites() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    const favoritesList = document.getElementById('favorites-list');

    if (favoritos.length === 0) {
        favoritesList.innerHTML = '<p class="text-muted">No tienes ofertas guardadas aún.</p>';
    } else {
        favoritesList.innerHTML = favoritos.map((fav, index) => `
            <div style="margin-bottom: 0.5rem;">
                <span>• ${fav}</span>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFavorite(${index})">Eliminar</button>
            </div>
        `).join('');
    }
}

function removeFavorite(index) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    favoritos.splice(index, 1);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    loadFavorites();
}

function goToOffers() {
    window.location.href = 'ofertas.html';
}

function editSpecialty() {
    const specialty = prompt('¿Cuál es tu especialidad?', localStorage.getItem('specialty') || '');
    if (specialty) {
        localStorage.setItem('specialty', specialty);
        document.getElementById('user-specialty').textContent = specialty;
        alert('✓ Especialidad actualizada');
    }
}

function savePreferences() {
    const prefs = {
        software: document.getElementById('prefs-software').checked,
        data: document.getElementById('prefs-data').checked,
        security: document.getElementById('prefs-security').checked,
        remote: document.getElementById('prefs-remote').checked,
        hybrid: document.getElementById('prefs-hybrid').checked
    };
    localStorage.setItem('preferences', JSON.stringify(prefs));
    alert('✓ Preferencias guardadas correctamente');
}

function loadPreferences() {
    const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');
    if (prefs.software) document.getElementById('prefs-software').checked = true;
    if (prefs.data) document.getElementById('prefs-data').checked = true;
    if (prefs.security) document.getElementById('prefs-security').checked = true;
    if (prefs.remote) document.getElementById('prefs-remote').checked = true;
    if (prefs.hybrid) document.getElementById('prefs-hybrid').checked = true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAccess()) {
        loadPreferences();
    }
});