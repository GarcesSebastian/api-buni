# 🚀 API BUNI

[![Node.js](https://img.shields.io/badge/Node.js-14.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-yellow.svg)](https://jwt.io/)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

## 📝 Descripción General

API BUNI es una API RESTful desarrollada en Node.js con Express que proporciona un sistema completo para la gestión de usuarios, eventos y formularios. La API implementa un modelo de arquitectura en capas (controladores, servicios, modelos) con autenticación JWT, gestión de roles, y manejo de correos electrónicos para recuperación de contraseñas y notificaciones.

## 📗 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Endpoints de API](#endpoints-de-api)
  - [Autenticación](#autenticación)
  - [Usuarios](#usuarios)
  - [Eventos](#eventos)
  - [Formularios](#formularios)
- [Modelos de Datos](#modelos-de-datos)
- [Middleware](#middleware)
- [Utilidades](#utilidades)
- [Manejo de Errores](#manejo-de-errores)
- [Guía de Despliegue](#guía-de-despliegue)
- [Seguridad](#seguridad)
- [Monitoreo y Logs](#monitoreo-y-logs)

## 🖼️ Arquitectura

API BUNI sigue una arquitectura de tres capas:

1. 🌍 **Controladores**: Manejan las solicitudes HTTP y respuestas. Responsables de la validación básica de entrada y manejo de errores HTTP.
2. ⚙️ **Servicios**: Contienen la lógica de negocio y las operaciones complejas. Realizan validaciones avanzadas y orquestan las operaciones de datos.
3. 📃 **Modelos**: Gestionan las interacciones con la base de datos y representan las entidades del sistema.

💡 Esta separación de responsabilidades asegura un código mantenible, testeable y escalable.

## 🛠️ Tecnologías

- 🔥 **Runtime**: Node.js
- 🛠️ **Framework**: Express.js
- 💾 **Base de Datos**: MySQL (interacción directa mediante queries)
- 🔑 **Autenticación**: JWT (JSON Web Tokens)
- 🔐 **Encriptación**: bcryptjs para hashing de contraseñas
- ✉️ **Gestión de correos**: Servicio de correo personalizado con plantillas HTML
- ✅ **Validación**: Middlewares personalizados
- 🆔 **UUID**: Generación de identificadores únicos

## 💼 Estructura del Proyecto

```
/api-buni
├── /src                      # Código fuente principal
│   ├── /controllers          # Controladores HTTP
│   ├── /services             # Servicios de lógica de negocio
│   ├── /models               # Modelos y acceso a datos
│   ├── /routes               # Definición de rutas
│   ├── /middleware           # Middlewares de Express
│   ├── /lib                  # Utilidades y bibliotecas
│   │   ├── Utils.js          # Funciones de utilidad general
│   │   ├── EmailManager.js   # Gestor de envío de correos
│   │   └── CodeManager.js    # Gestión de códigos de recuperación
│   ├── /config               # Configuraciones
│   └── index.js              # Punto de entrada de la aplicación
├── /tests                    # Pruebas
├── .env                      # Variables de entorno
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

## ⚙️ Configuración

La aplicación utiliza variables de entorno para la configuración. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Config
PORT="4000"                  # Puerto del servidor

# Database
DB_HOST="localhost"         # Host de la base de datos
DB_USER="root"              # Usuario de la base de datos
DB_PASSWORD=""              # Contraseña de la base de datos
DB_NAME="buni"              # Nombre de la base de datos
DB_PORT="3306"              # Puerto de la base de datos

# CORS
CORS_ORIGINS="http://localhost:3000"  # Origenes permitidos para CORS

# JWT
JWT_SECRET="your_secret_key"  # Clave secreta para JWT

# Credentials (usuario administrador por defecto)
ADMIN_NAME="Administrador"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Rate limit
RATE_LIMIT_WINDOW_MINUTES=1  # Ventana de tiempo para rate limiting en minutos
RATE_LIMIT_MAX=200           # Máximo de peticiones en la ventana de tiempo

# Transport Email
SMTP_HOST=smtp.gmail.com     # Host del servidor SMTP
SMTP_PORT=587                # Puerto del servidor SMTP
SMTP_USER=example@gmail.com  # Usuario del servidor SMTP
SMTP_PASS=your_app_password  # Contraseña de aplicación
```

### Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/api-buni.git
cd api-buni

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 🌐 Endpoints de API

### Autenticación

#### `POST /auth/login`
- **Descripción**: Autentica un usuario y retorna un token JWT
- **Body**: `{ "email": "string", "password": "string" }`
- **Respuesta**: `{ "token": "string", "user": {} }`

#### `POST /auth/verify`
- **Descripción**: Verifica un token JWT
- **Headers**: `Authorization: Bearer {token}`
- **Respuesta**: `{ "valid": true, "user": {} }`

### Usuarios

#### `GET /users`
- **Descripción**: Obtiene todos los usuarios
- **Headers**: `Authorization: Bearer {token}`
- **Respuesta**: `[{ "id": "string", "name": "string", ... }]`

#### `POST /users`
- **Descripción**: Crea un nuevo usuario
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ "name": "string", "email": "string", "password": "string", "roles": { "id": "number" } }`
- **Respuesta**: `{ "id": "string", "name": "string", ... }`

#### `PUT /users/:id`
- **Descripción**: Actualiza un usuario existente
- **Headers**: `Authorization: Bearer {token}`
- **Parámetros**: `id` - ID del usuario
- **Body**: `{ "name": "string", "email": "string", "roles": { "id": "number" } }`
- **Respuesta**: `{ "message": "Usuario actualizado exitosamente" }`

#### `POST /users/:id/recovery`
- **Descripción**: Inicia el proceso de recuperación de contraseña
- **Parámetros**: `id` - ID del usuario
- **Respuesta**: `{ "message": "Correo de recuperación enviado exitosamente" }`

#### `POST /users/:id/verify-recovery`
- **Descripción**: Verifica el código de recuperación
- **Parámetros**: `id` - ID del usuario
- **Body**: `{ "code": "string" }`
- **Respuesta**: `{ "valid": true }`

#### `PUT /users/:id/change-password`
- **Descripción**: Cambia la contraseña de un usuario
- **Parámetros**: `id` - ID del usuario
- **Body**: `{ "password": "string" }`
- **Respuesta**: `{ "message": "Contraseña actualizada exitosamente" }`

#### `DELETE /users/:id`
- **Descripción**: Elimina un usuario
- **Headers**: `Authorization: Bearer {token}`
- **Parámetros**: `id` - ID del usuario
- **Respuesta**: `{ "message": "Usuario eliminado exitosamente" }`

### Eventos

#### `GET /events`
- **Descripción**: Obtiene todos los eventos
- **Respuesta**: `[{ "id": "string", "title": "string", ... }]`

#### `GET /events/:id`
- **Descripción**: Obtiene un evento por ID
- **Parámetros**: `id` - ID del evento
- **Respuesta**: `{ "id": "string", "title": "string", ... }`

#### `POST /events`
- **Descripción**: Crea un nuevo evento
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ "title": "string", "description": "string", ... }`
- **Respuesta**: `{ "message": "Evento creado exitosamente", "data": { ... } }`

#### `PUT /events/:id`
- **Descripción**: Actualiza un evento existente
- **Headers**: `Authorization: Bearer {token}`
- **Parámetros**: `id` - ID del evento
- **Body**: `{ "title": "string", "description": "string", ... }`
- **Respuesta**: `{ "message": "Evento actualizado exitosamente", "data": { ... } }`

#### `PUT /events/:id/forms`
- **Descripción**: Actualiza los formularios asociados a un evento
- **Parámetros**: `id` - ID del evento
- **Body**: `{ "forms": [{ "id": "string", ... }] }`
- **Respuesta**: `{ "message": "Formulario actualizado exitosamente", "data": { ... } }`

#### `PUT /events/:id/form-config`
- **Descripción**: Actualiza la configuración del formulario de un evento
- **Headers**: `Authorization: Bearer {token}`
- **Parámetros**: `id` - ID del evento
- **Body**: `{ "config": { ... } }`
- **Respuesta**: `{ "message": "Configuración del formulario actualizada exitosamente", "data": { ... } }`

#### `DELETE /events/:id`
- **Descripción**: Elimina un evento
- **Headers**: `Authorization: Bearer {token}`
- **Parámetros**: `id` - ID del evento
- **Respuesta**: `{ "message": "Evento eliminado exitosamente", "data": { ... } }`

### Formularios

#### `GET /forms`
- **Descripción**: Obtiene todos los formularios
- **Respuesta**: `[{ "id": "string", "title": "string", ... }]`

#### `GET /forms/:id`
- **Descripción**: Obtiene un formulario por ID
- **Parámetros**: `id` - ID del formulario
- **Respuesta**: `{ "message": "Formulario obtenido exitosamente", "data": { ... } }`

#### `GET /forms/:id/data/:type`
- **Descripción**: Obtiene los datos de un formulario según el tipo
- **Parámetros**: `id` - ID del formulario, `type` - Tipo de datos
- **Respuesta**: `[{ ... }]`

#### `POST /forms`
- **Descripción**: Crea un nuevo formulario
- **Body**: `{ "title": "string", "description": "string", ... }`
- **Respuesta**: `{ "message": "Formulario creado exitosamente", "data": { ... } }`

#### `PUT /forms/:id`
- **Descripción**: Actualiza un formulario existente
- **Parámetros**: `id` - ID del formulario
- **Body**: `{ "title": "string", "description": "string", ... }`
- **Respuesta**: `{ "message": "Formulario actualizado exitosamente", "data": { ... } }`

#### `DELETE /forms/:id`
- **Descripción**: Elimina un formulario
- **Parámetros**: `id` - ID del formulario
- **Respuesta**: `{ "message": "Formulario eliminado exitosamente", "data": { ... } }`

## 📂 Base de Datos

La API utiliza MySQL como motor de base de datos. El esquema incluye las siguientes tablas:

### 👑 Roles
```sql
CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Usuarios
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    role_id VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);
```

### Eventos
```sql
CREATE TABLE events (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    organizador VARCHAR(255) NOT NULL,
    scenery JSON NOT NULL,
    programs JSON NOT NULL,
    cupos VARCHAR(255) NOT NULL,
    horarioInicio DATETIME NOT NULL,
    horarioFin DATETIME NOT NULL,
    state VARCHAR(255) NOT NULL,
    formAssists JSON NOT NULL,
    formInscriptions JSON NOT NULL,
    assists JSON NOT NULL,
    inscriptions JSON NOT NULL,
    formConfig JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🎭 Escenarios
```sql
CREATE TABLE sceneries (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 📺 Programas
```sql
CREATE TABLE programs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Formularios
```sql
CREATE TABLE forms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    fields JSON NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ⚡️ Triggers

La base de datos incluye un trigger que inicializa la configuración de formularios para eventos nuevos:

```sql
CREATE TRIGGER before_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.formConfig IS NULL OR JSON_LENGTH(NEW.formConfig) = 0 THEN
        SET NEW.formConfig = JSON_OBJECT(
            'inscriptions', JSON_OBJECT(
                'enabled', false,
                'startDate', '',
                'endDate', ''
            ),
            'assists', JSON_OBJECT(
                'enabled', false,
                'startDate', '',
                'endDate', ''
            )
        );
    END IF;
END;
```

## 🔗 Middleware

### 🔐 Autenticación (auth.middleware.js)

Verifica la validez de los tokens JWT y adjunta la información del usuario a la solicitud. Este middleware es crucial para proteger rutas que requieren autenticación.

### 🎉 Eventos (event.middleware.js)

Realiza validaciones específicas para operaciones de eventos, incluyendo verificación de datos para creación, actualización y eliminación de eventos.

## 🔧 Utilidades

La API cuenta con diversas utilidades internas que facilitan operaciones comunes como:

- 🆔 Generación de identificadores únicos (UUIDs)
- ✉️ Envío de correos electrónicos con plantillas HTML
- 🔑 Gestión de códigos de recuperación de contraseñas
- 📅 Formateo de fechas y datos

## ⚠️ Manejo de Errores

La API implementa un sistema de manejo de errores en capas:

1. 🛠️ **Nivel de Servicio**: Captura errores específicos de la lógica de negocio y añade contexto.
2. 📶 **Nivel de Controlador**: Traduce errores a respuestas HTTP adecuadas (404 para recursos no encontrados, 400 para solicitudes incorrectas, 500 para errores internos).
3. 📓 **Logs**: Todos los errores son registrados con detalles para facilitar la depuración y monitoreo.

## 🚀 Guía de Despliegue

### 💻 Requisitos

- 🔥 Node.js 14+ y npm
- 💾 MySQL 5.7+
- ✉️ Configuración de correo electrónico válida

### 🚀 Pasos para Producción

1. 🔎 Clonar el repositorio
2. 💾 Instalar dependencias: `npm install --production`
3. ⚙️ Configurar variables de entorno para producción
4. 🔄 Ejecutar migraciones de base de datos (si aplica)
5. 🔔 Iniciar el servicio: `npm start`

### 💡 Consideraciones para Producción

- 📊 Utilizar un gestor de procesos como PM2
- 🔍 Configurar un servidor proxy inverso (Nginx/Apache)
- 🔒 Implementar HTTPS para todas las comunicaciones
- 🔔 Configurar monitoreo y alertas

## 🔒 Seguridad

La API implementa las siguientes medidas de seguridad:

- 🔐 **Autenticación**: JWT con firma segura
- 🔑 **Autorización**: Control de acceso basado en roles
- 📛 **Contraseñas**: Almacenadas con hash bcrypt (factor 10)
- 🔒 **Recuperación segura**: Códigos de un solo uso con tiempo de expiración
- 🔍 **Validación de entrada**: Prevención de inyección y XSS
- 🛡️ **Protección CORS**: Configuración de orígenes permitidos
- ⏱️ **Rate Limiting**: Prevención de ataques de fuerza bruta (si está implementado)

## 📈 Monitoreo y Logs

- 📝 Los errores se registran con detalles para facilitar la depuración
- 📈 Formato de logs estructurado con niveles de severidad
- 🔎 Seguimiento de operaciones críticas (autenticación, cambios de datos sensibles)

---

## 👥 Contribución

Para contribuir al proyecto:

1. 🔗 Fork del repositorio
2. 🌱 Crear una rama (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit de los cambios (`git commit -m 'Add some AmazingFeature'`)
4. 🚀 Push a la rama (`git push origin feature/AmazingFeature`)
5. 📨 Abrir un Pull Request

## 🔌 Contrato de WebSocket compartido

El contrato de socket.io (eventos y payloads) es la **única fuente de verdad** en
`src/contracts/socket.ts` (tipos) + `src/schemas/socket.ts` (validación Zod en el servidor).

El frontend consume un **espejo solo-de-tipos** en `Buni/src/types/contract.generated.ts`, generado por:

```bash
npm run export:contract
```

El archivo generado lleva un encabezado `GENERATED FROM api-buni@<commit> — DO NOT EDIT BY HAND`.
Tras cualquier cambio en el contrato debes **regenerar y commitear** el espejo. La verificación es
`git diff --exit-code` sobre `Buni/src/types/contract.generated.ts`: si el espejo está desactualizado,
el build del frontend falla. Como son dos repos separados, este chequeo es manual-pero-obligatorio.

## 🧰 Servidor: stack, scripts y ejecución

Sección técnica del servidor para ejecutar, construir y desplegar la API tal como está hoy.

### Stack real

- **Runtime**: Node.js 20 (imágenes Docker fijadas a `node:20.19.1-alpine3.21`).
- **Framework**: Express 4 sobre TypeScript en **ESM** (`"type": "module"`), compilado a `dist/` con
  `tsc -p tsconfig.build.json`. Arranque: `node dist/index.js`.
- **Base de datos**: MySQL 8 vía `mysql2` (queries directas; el esquema se siembra con
  `src/database/db.sql`).
- **Tiempo real**: Socket.IO 4 (contrato compartido en `src/contracts/socket.ts` +
  `src/schemas/socket.ts`).
- **Validación**: Zod 3 (variables de entorno en `src/config/env.ts`; payloads de socket y endpoints).
- **Auth y seguridad**: JWT (`jsonwebtoken`), hashing con `bcryptjs`, `helmet`, `cors`,
  `express-rate-limit`, `cookie-parser`.
- **Correo**: `nodemailer` (SMTP).

### Scripts (`package.json`)

| Script | Comando | Para qué |
|---|---|---|
| `npm run dev` | `tsx watch src/index.ts` | Desarrollo con recarga en caliente |
| `npm run build` | `tsc -p tsconfig.build.json` | Compila `src/` → `dist/` |
| `npm start` | `node dist/index.js` | Arranca la build de producción |
| `npm run export:contract` | `tsx scripts/export-contract.ts` | Regenera el espejo de tipos del contrato de socket para el frontend |
| `npm test` | `vitest run` | Tests (una sola pasada) |
| `npm run typecheck` | `tsc --noEmit` | Comprobación de tipos sin emitir |
| `npm run lint` | `eslint .` | Linter |
| `npm run format` | `prettier --write .` | Formateo |

### Variables de entorno (`src/config/env.ts`)

Validadas con Zod al arrancar; si alguna obligatoria falta o es inválida, el proceso termina con
`exit(1)`.

| Variable | Obligatoria | Por defecto | Notas |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `PORT` | no | `4000` | Puerto del servidor |
| `DB_HOST` | sí | — | Host de MySQL |
| `DB_USER` | sí | — | Usuario de MySQL |
| `DB_PASSWORD` | no | `""` | MySQL admite contraseña vacía |
| `DB_NAME` | sí | — | Debe ser `buni` (el `db.sql` hace `USE buni`) |
| `DB_PORT` | no | `3306` | Puerto de MySQL |
| `CORS_ORIGINS` | sí | — | Orígenes permitidos, separados por coma |
| `JWT_SECRET` | sí | — | 32+ caracteres y distinto de `your_secret_key` |
| `ADMIN_NAME` | sí | — | Admin por defecto |
| `ADMIN_EMAIL` | sí | — | Debe ser un email válido |
| `ADMIN_PASSWORD` | sí | — | Admin por defecto |
| `ADMIN_ROLE` | no | `admin` | Rol del admin por defecto |
| `RATE_LIMIT_WINDOW_MINUTES` | no | `15` | Ventana del rate limit |
| `RATE_LIMIT_MAX` | no | `100` | Máximo de peticiones por ventana |
| `SMTP_HOST` | sí | — | Servidor SMTP |
| `SMTP_PORT` | sí | — | Puerto SMTP |
| `SMTP_USER` | sí | — | Usuario SMTP |
| `SMTP_PASS` | sí | — | Contraseña SMTP |
| `FRONTEND_URL` | sí | — | URL del frontend (debe ser una URL válida) |
| `APP_API_TOPOLOGY` | no | `cross-site` | `cross-site` \| `same-site`; elige el `SameSite` de la cookie |
| `ZOD_ENFORCE` | no | `false` | `true` fuerza validación Zod estricta |

### Ejecutar en local (sin Docker)

```bash
npm ci            # instalar dependencias (o npm install)
# crea un .env con las variables de arriba (necesitas un MySQL accesible)
npm run dev       # desarrollo con recarga
# o, para producción local:
npm run build && npm start
```

### Ejecutar con Docker

La API se empaqueta con un `Dockerfile` multi-stage (usuario no-root `node`, expone `4000`, volumen
`/app/uploads`). Para levantar el stack completo (MySQL + API + frontend) en local:

```bash
docker compose -f compose.dev.yml up -d --build
curl http://localhost:4000/   # -> {"buni":"Estamos conectados uwu", ...}
```

Construir solo la imagen de la API:

```bash
docker build -t buni-api .
```

Para la guía completa de cómo levantar Buni en local con Docker (backend + frontend), consulta
**[DEPLOY.md](./DEPLOY.md)**.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

© 2025 API BUNI. Todos los derechos reservados. 🌟