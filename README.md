# Plataforma de Prácticas Profesionales — Frontend

Interfaz web en HTML/CSS/JS (Bootstrap) para buscar prácticas profesionales y postular a ellas.
Este repositorio contiene **solo el frontend**. El backend (Flask) vive en un repositorio
separado (`GPTI22_Backend`) y es responsabilidad de otro equipo/persona.

## Estructura

- `index.html`, `ofertas.html`, `profile.html`: páginas de la app.
- `config.js`: configuración global, incluida `API_BASE_URL`.
- `auth.js`: login, registro, logout y manejo de sesión (token en `localStorage`).
- `app.js`: listado/filtrado de ofertas y postulación a ofertas.
- `profile.js`: perfil de usuario, favoritos (locales) y postulaciones.
- `styles.css`: estilos.

## Cómo ejecutar el frontend

1. Ajusta la URL del backend en [config.js](config.js) si no corre en `http://localhost:5002`:
   ```js
   const API_BASE_URL = 'http://localhost:5002';
   ```
2. Sirve la carpeta con un servidor estático (necesario para que `fetch`/CORS funcionen bien;
   abrir los archivos con `file://` puede fallar):
   ```
   python -m http.server 8001
   ```
3. Abre `http://localhost:8001` en el navegador.

El backend debe estar corriendo y debe permitir CORS desde el origen del frontend
(actualmente el backend tiene `CORS(app, origins=["http://localhost:8001"])`, ajustar
si el frontend se sirve en otro puerto).

## Endpoints que el frontend consume

Todos los endpoints autenticados envían el token como `Authorization: Bearer <token>`
(ver `authFetch` en [auth.js](auth.js)).

| Método | Endpoint                          | Usado en              | Estado en el backend actual |
|--------|------------------------------------|------------------------|------------------------------|
| POST   | `/register`                        | Modal de registro      | ✅ Implementado |
| POST   | `/login`                           | Modal de login          | ✅ Implementado |
| POST   | `/logout`                          | Botón "Cerrar Sesión"   | ✅ Implementado |
| GET    | `/me`                               | Obtener id del usuario tras login (`ensureUserId`) | ✅ Implementado |
| GET    | `/ofertas` (con `?area=`, `?modalidad=`, `?ubicacion=`, `?nivel=`, `?empresa=`, `?activa=`) | Listado y filtro de ofertas | ✅ Implementado |
| POST   | `/postulaciones`                  | Botón "📨 Postular" en cada oferta | ⚠️ **No existe en el backend actual** |
| GET    | `/usuarios/:id/postulaciones`     | Sección "Mis Postulaciones" del perfil | ⚠️ **No existe en el backend actual** |

El frontend solo usa el filtro `area` por ahora (único input de búsqueda en la UI), pero
`cargarOfertas` recibe ese valor por query string igual que lo haría con cualquier otro
filtro soportado por el backend.

### Esquema de `oferta` que espera el frontend (`GET /ofertas`)

Campos leídos por `mostrarOfertas` en [app.js](app.js): `id` (string/uuid), `titulo`, `empresa`,
`descripcion`, `area`, `modalidad`, `ubicacion`, `duracion`, `link`. Los campos `salario`,
`fecha_publicacion`, `fecha_expiracion` y `activa` existen en el backend pero la UI actual no
los muestra (se pueden agregar fácilmente si se necesitan).

⚠️ Importante: este esquema reemplaza uno anterior que usaba `especialidad`, `requisitos` y
`enlace` — esos nombres de campo ya no existen en el backend y el frontend fue actualizado
para usar `area`, (sin equivalente a `requisitos`) y `link` respectivamente.

### Notas para el equipo de backend

- El backend actual (`app/routers/`) expone `/register`, `/login`, `/logout`, `/me`,
  `GET /ofertas` y `POST /ofertas` (esta última para crear ofertas, usada por el scraper/admin,
  no la consume este frontend de usuario). No hay endpoint `/ofertas/:id` ni
  tabla/endpoints de postulaciones.
- `POST /postulaciones`: el frontend envía `{ "usuario_id": number, "oferta_id": string }`
  (el `oferta_id` es el uuid de la oferta) con header `Authorization`. Mientras no exista,
  el frontend detecta `404`/`405` y muestra un aviso de "función no disponible" en vez de romper.
- `GET /usuarios/:id/postulaciones`: el frontend espera un array de objetos. Se intenta leer
  `titulo` (o `oferta_titulo`), `empresa`, `estado` y `oferta_id` de cada item; cualquier campo
  faltante simplemente no se muestra. Ajustar `mostrarPostulaciones` en [profile.js](profile.js)
  si la forma real de la respuesta es distinta.
- `GET /me` no devuelve `fecha_registro` (solo `id`, `nombre`, `email`), por eso el perfil sigue
  mostrando la fecha de login guardada localmente en vez de la fecha real de registro. Si se
  agrega `fecha_registro` a `/me`, se puede reemplazar fácilmente en `loadProfile` ([profile.js](profile.js)).
- No existe endpoint para favoritos ni preferencias de búsqueda: hoy se guardan solo en
  `localStorage` del navegador (no persisten entre dispositivos). Si el backend agrega
  endpoints para esto, avisar para conectarlos.

## Funcionalidades

- **Landing page** con información del proyecto.
- **Autenticación real** contra el backend (registro/login/logout, sesión vía token).
- **Listado y filtro de ofertas** cargado en vivo desde `GET /ofertas`.
- **Postulación a ofertas** vía `POST /postulaciones` (pendiente de implementar en backend).
- **Perfil de usuario**: datos de sesión, postulaciones (`GET /usuarios/:id/postulaciones`,
  pendiente en backend), favoritos y preferencias (guardados localmente).
- Manejo de estados de carga, error y "sin resultados" en ofertas y postulaciones.
