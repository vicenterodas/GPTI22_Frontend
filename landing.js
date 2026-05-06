function checkLogin() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    const navPerfil = document.getElementById('nav-perfil');

    if (isLoggedIn) {
        navLogin.style.display = 'none';
        navLogout.style.display = 'block';
        navPerfil.style.display = 'block';
    } else {
        navLogin.style.display = 'block';
        navLogout.style.display = 'none';
        navPerfil.style.display = 'none';
    }
}

function showLoginModal(event) {
    event.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    checkLogin();
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();

    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('loginDate', new Date().toLocaleDateString('es-ES'));
                
                alert('¡Inicio de sesión exitoso! Bienvenido.');
                bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
                checkLogin();
                
                document.getElementById('loginForm').reset();
            } else {
                alert('Por favor, ingresa tus credenciales.');
            }
        });
    }
});