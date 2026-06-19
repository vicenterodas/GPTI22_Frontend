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

    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const dateEl = document.getElementById('user-date');

    if (nameEl) nameEl.textContent = `Bienvenido, ${nombre}!`;
    if (emailEl) emailEl.textContent = email;
    if (dateEl) dateEl.textContent = loginDate;

    loadFavorites();
    loadPostulaciones();
}

// =====================
// POSTULACIONES - VERSIÓN CORREGIDA
// =====================

function loadPostulaciones() {
    const list = document.getElementById('applications-list');
    if (!list) return;

    list.innerHTML = '<p class="text-muted">Cargando postulaciones...</p>';

    try {
        let postulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
        
        // 🔥 CONVERTIR CUALQUIER OBJETO A STRING
        postulaciones = postulaciones.map(item => {
            // Si es un objeto, extraer su propiedad titulo o convertirlo a string
            if (typeof item === 'object' && item !== null) {
                return item.titulo || item.nombre || item.title || JSON.stringify(item);
            }
            // Si es un número o booleano, convertirlo a string
            return String(item);
        });
        
        // Guardar en el formato correcto (solo strings)
        localStorage.setItem('postulaciones', JSON.stringify(postulaciones));
        
        mostrarPostulaciones(postulaciones);

    } catch (error) {
        console.error('Error leyendo postulaciones:', error);
        list.innerHTML = '<p class="text-danger">Error al cargar tus postulaciones.</p>';
    }
}

function removePostulacion(index) {
    let postulaciones = JSON.parse(localStorage.getItem('postulaciones') || '[]');
    
    // Asegurar que sea un array de strings
    postulaciones = postulaciones.map(item => {
        if (typeof item === 'object' && item !== null) {
            return item.titulo || item.nombre || item.title || String(item);
        }
        return String(item);
    });
    
    postulaciones.splice(index, 1);
    localStorage.setItem('postulaciones', JSON.stringify(postulaciones));
    loadPostulaciones();
}

function mostrarPostulaciones(postulaciones) {
    const list = document.getElementById('applications-list');
    if (!list) return;

    // Asegurar que todos sean strings
    const stringsPostulaciones = postulaciones.map(item => String(item));

    if (!stringsPostulaciones || stringsPostulaciones.length === 0) {
        list.innerHTML = '<p class="text-muted">No has realizado postulaciones aún.</p>';
        return;
    }

    // MISMO FORMATO QUE FAVORITOS
    list.innerHTML = stringsPostulaciones.map((titulo, index) => `
        <div style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
            <span>• ${titulo}</span>
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="removePostulacion(${index})"
                    style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                Eliminar
            </button>
        </div>
    `).join('');
}

// =====================
// FAVORITOS
// =====================

function loadFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    if (!favoritesList) return;

    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    
    // Asegurar que todos sean strings
    favoritos = favoritos.map(item => String(item));
    localStorage.setItem('favoritos', JSON.stringify(favoritos));

    if (favoritos.length === 0) {
        favoritesList.innerHTML = '<p class="text-muted">No tienes ofertas guardadas aún.</p>';
    } else {
        favoritesList.innerHTML = favoritos.map((fav, index) => `
            <div style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
                <span>• ${fav}</span>
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="removeFavorite(${index})"
                        style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                    Eliminar
                </button>
            </div>
        `).join('');
    }
}

function removeFavorite(index) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    favoritos = favoritos.map(item => String(item));
    favoritos.splice(index, 1);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    loadFavorites();
}

// =====================
// PREFERENCIAS
// =====================

function savePreferences() {
    const prefs = {
        software: document.getElementById('prefs-software')?.checked || false,
        data: document.getElementById('prefs-data')?.checked || false,
        security: document.getElementById('prefs-security')?.checked || false,
        remote: document.getElementById('prefs-remote')?.checked || false,
        hybrid: document.getElementById('prefs-hybrid')?.checked || false
    };

    localStorage.setItem('preferences', JSON.stringify(prefs));
    alert('✓ Preferencias guardadas correctamente');
}

function loadPreferences() {
    const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!value;
    };

    set('prefs-software', prefs.software);
    set('prefs-data', prefs.data);
    set('prefs-security', prefs.security);
    set('prefs-remote', prefs.remote);
    set('prefs-hybrid', prefs.hybrid);
}

// =====================
// OTROS
// =====================

function goToOffers() {
    window.location.href = 'ofertas.html';
}

function editSpecialty() {
    const specialty = prompt(
        '¿Cuál es tu especialidad?',
        localStorage.getItem('specialty') || ''
    );

    if (specialty) {
        localStorage.setItem('specialty', specialty);

        const el = document.getElementById('user-specialty');
        if (el) el.textContent = specialty;

        alert('✓ Especialidad actualizada');
    }
}

// =====================
// INIT
// =====================

document.addEventListener('DOMContentLoaded', () => {
    if (checkAccess()) {
        loadPreferences();
    }
});