# Configuración de Variables de Entorno (Backend - api-buni)

Este archivo describe las variables de entorno necesarias para configurar el servidor backend.

## Archivo de configuración

Debes crear un archivo llamado `.env` en la raíz de la carpeta `api-buni/`. En el arranque,
`src/config/env.ts` valida todas estas variables con Zod y aborta el proceso (`process.exit(1)`) si
alguna es inválida (por ejemplo, un `JWT_SECRET` débil). Esto es intencional: previene arrancar con una
configuración insegura.

## Variables Requeridas

### Configuración del Servidor

- **`NODE_ENV`**: `development` | `test` | `production`. Por defecto `development`. En `production`
  las rutas `/experimental/*` quedan deshabilitadas.
- **`PORT`**: Puerto del servidor Express. **Por defecto `4000`** para no colisionar con la app Next
  (que corre en `3000`).

### Base de Datos (MySQL)

- **`DB_HOST`**: Host de la base de datos (ej: `127.0.0.1`).
- **`DB_USER`**: Usuario de la base de datos (ej: `root`).
- **`DB_PASSWORD`**: Contraseña del usuario (puede ser vacía; MySQL lo permite).
- **`DB_NAME`**: Nombre de la base de datos (ej: `buni`).
- **`DB_PORT`**: Puerto de MySQL (número; por defecto `3306`).

### Seguridad y CORS

- **`CORS_ORIGINS`**: Lista separada por comas de orígenes permitidos (ej:
  `http://localhost:3000`). Se refleja el origen de la petición (nunca `*`) con
  `Access-Control-Allow-Credentials: true`.
- **`JWT_SECRET`**: Clave secreta para la firma de tokens JWT. **Mínimo 32 caracteres** y no puede ser
  el valor por defecto `your_secret_key`. El arranque falla si no cumple.
- **`APP_API_TOPOLOGY`**: `cross-site` | `same-site`. Por defecto `cross-site` (la realidad verificada:
  app Next y API Express en orígenes distintos). Determina los flags de la cookie `token_hs` en la
  Fase 3. Usar `same-site` solo si app + API comparten dominio registrable detrás de un mismo proxy.

### Credenciales de Administrador (Inicialización)

- **`ADMIN_NAME`**: Nombre del administrador por defecto.
- **`ADMIN_EMAIL`**: Correo electrónico del administrador (formato email válido).
- **`ADMIN_PASSWORD`**: Contraseña para la cuenta de administrador.
- **`ADMIN_ROLE`**: Nombre del rol de administrador. Por defecto `admin`.

### Límite de Peticiones (Rate Limit)

- **`RATE_LIMIT_WINDOW_MINUTES`**: Ventana en minutos. Por defecto `15`.
- **`RATE_LIMIT_MAX`**: Máximo de peticiones por IP en esa ventana. Por defecto `100`.

### Correo Electrónico (SMTP)

- **`SMTP_HOST`**: Servidor SMTP (ej: `smtp.gmail.com`).
- **`SMTP_PORT`**: Puerto SMTP (número; ej: `587`).
- **`SMTP_USER`**: Correo desde el cual se envían las notificaciones.
- **`SMTP_PASS`**: Contraseña o "Contraseña de Aplicación" del correo.

### Global

- **`FRONTEND_URL`**: URL raíz del frontend (ej: `http://localhost:3000`). Se usa para construir
  rutas de imágenes y enlaces en los correos.

### Validación (Fase 2)

- **`ZOD_ENFORCE`**: `true` | `false`. Por defecto `false` (modo *parse-and-log*: los esquemas Zod
  validan y registran violaciones pero no rechazan). Se activa por ruta solo cuando los logs confirman
  payloads conformes.

---

## Variables del Frontend (repo `Buni/`)

El frontend requiere (documentadas en `Buni/README_ENV.md`):

- **`NEXT_PUBLIC_API_URL`**: URL absoluta de la API (ej: `http://localhost:4000`).
- **`NEXT_PUBLIC_WEBSOCKET_URL`**: URL del servidor WebSocket (ej: `http://localhost:4000`).

---

## Pruebas (characterization harness)

La suite de caracterización (`test/characterization/`) corre con Vitest + supertest contra una base
MySQL **real** (no sqlite/in-memory: se requieren `SELECT ... FOR UPDATE` y columnas JSON). El runner
reconstruye el esquema desde `src/database/db.sql` y la siembra determinista en cada archivo. Configura
las variables `DB_*` del `.env` apuntando a esa instancia MySQL antes de `npm run test`.

---

## Notas de Desarrollo

- En desarrollo se usa `tsx` (desde la Fase 1) para recarga; en Fase 0 aún corre con `nodemon`.
