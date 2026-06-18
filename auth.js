// API_BASE_URL se define en config.js (cargado antes de este archivo).

function getToken() {
    return localStorage.getItem('authToken');
}

function isLoggedIn() {
    return !!getToken();
}

function setSession(data) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userNombre', data.nombre);
    localStorage.setItem('loginDate', new Date().toLocaleDateString('es-ES'));
}

function clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNombre');
    localStorage.removeItem('loginDate');
    localStorage.removeItem('userId');
}

// El login no devuelve el id del usuario, así que lo obtenemos de GET /me
// y lo guardamos para poder consumir endpoints que requieren usuario_id
// (por ejemplo, postulaciones).
async function ensureUserId() {
    const cached = localStorage.getItem('userId');
    if (cached) return cached;

    try {
        const response = await authFetch(`${API_BASE_URL}/me`);
        if (!response.ok) return null;
        const data = await response.json();
        localStorage.setItem('userId', data.id);
        return String(data.id);
    } catch (error) {
        console.error('No se pudo obtener el usuario actual (GET /me):', error);
        return null;
    }
}

function updateNav() {
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    const navPerfil = document.getElementById('nav-perfil');
    const logged = isLoggedIn();

    if (navLogin) navLogin.style.display = logged ? 'none' : 'block';
    if (navLogout) navLogout.style.display = logged ? 'block' : 'none';
    if (navPerfil) navPerfil.style.display = logged ? 'block' : 'none';
}

async function logout(event) {
    if (event) event.preventDefault();
    const token = getToken();
    clearSession();
    if (token) {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
        } catch (error) {
            // El cierre de sesión en el cliente continúa aunque falle la llamada al backend.
        }
    }
    window.location.href = 'index.html';
}

function authFetch(url, options = {}) {
    const token = getToken();
    const headers = Object.assign({}, options.headers, token ? { 'Authorization': 'Bearer ' + token } : {});
    return fetch(url, Object.assign({}, options, { headers }));
}

function showLoginModal(event) {
    if (event) event.preventDefault();
    showAuthForm('login');
    const modal = new bootstrap.Modal(document.getElementById('authModal'));
    modal.show();
}

function showAuthForm(which) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('authModalTitle');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    if (loginError) loginError.classList.add('d-none');
    if (registerError) registerError.classList.add('d-none');
    if (registerSuccess) registerSuccess.classList.add('d-none');

    if (which === 'register') {
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        title.textContent = 'Crear Cuenta';
    } else {
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        title.textContent = 'Iniciar Sesión';
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorBox = document.getElementById('login-error');
    errorBox.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'No se pudo iniciar sesión.');
        }

        setSession(data);
        await ensureUserId();
        updateNav();
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        document.getElementById('loginForm').reset();

        if (typeof onLoginSuccess === 'function') {
            onLoginSuccess();
        }
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('d-none');
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const nombre = document.getElementById('register-nombre').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorBox = document.getElementById('register-error');
    const successBox = document.getElementById('register-success');
    errorBox.classList.add('d-none');
    successBox.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'No se pudo crear la cuenta.');
        }

        successBox.textContent = data.message;
        successBox.classList.remove('d-none');
        document.getElementById('registerForm').reset();
        setTimeout(() => showAuthForm('login'), 1500);
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNav();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault();
            showAuthForm('register');
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (event) => {
            event.preventDefault();
            showAuthForm('login');
        });
    }
});
