# Plataforma de Prácticas Profesionales

Este es un prototipo funcional básico de una plataforma web centralizada para buscar prácticas profesionales utilizando web scraping (simulado con datos mock).

## Estructura del Proyecto

- `backend/`: API REST en Python con Flask.
- `frontend/`: Interfaz web en HTML/CSS/JS con Bootstrap.

## Cómo Ejecutar

1. Asegúrate de tener Python 3.12 instalado.

2. Instala las dependencias del backend:
   ```
   cd backend
   pip install flask requests beautifulsoup4 flask-cors
   ```

3. Pobla la base de datos con datos mock:
   ```
   python populate_db.py
   ```

4. Ejecuta el backend:
   ```
   python app.py
   ```
   El backend correrá en http://127.0.0.1:5002

5. En otra terminal, ejecuta el frontend:
   ```
   cd frontend
   python -m http.server 8001
   ```
   El frontend estará disponible en http://localhost:8001

## Funcionalidades

- **Landing Page Profesional**: Página de inicio con información del proyecto y CTA.
- **Ver Ofertas**: Listado completo de prácticas profesionales.
- **Filtrado Inteligente**: Busca por especialidad.
- **Inicio de Sesión**: Sistema de autenticación simulado (con localStorage).
- **Mi Perfil**: Página personalizada para usuarios autenticados con:
  - Información de usuario
  - Ofertas guardadas (favoritos)
  - Preferencias de búsqueda
  - Especialidad personalizable
- **Diseño Profesional**: Colores azul claro (#0D47A1, #1E88E5) y amarillo (#FFD700, #FFC107).
- **Interfaz Responsiva**: Compatible con dispositivos móviles.

## Mejoras Futuras

- Implementar scraping real de sitios como LinkedIn, FirstJob.
- Agregar autenticación de usuarios.
- Base de datos más robusta (PostgreSQL).
- Despliegue en la nube.