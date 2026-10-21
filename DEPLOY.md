# 🚀 Guía de despliegue — Buni (backend + frontend)

Esta guía cubre **las dos mitades de Buni**: el backend `api-buni` (Node 20 + Express +
TypeScript + MySQL 8 + Socket.IO) y el frontend `Buni` (Next.js 15 en modo `standalone`). Ambos son
inseparables en despliegue: comparten el mismo `.env` y se levantan con el mismo `compose.dev.yml`.
Por eso este documento es único y vive en `api-buni/` (el repo que contiene `db.sql` y la carpeta
`deploy/`).

> Los repos están físicamente separados (`convert/api-buni` y `convert/Buni` son hermanos), pero el
> despliegue local es uno solo: el compose construye el frontend por `context: ../Buni`.

El objetivo de esta guía es **levantar Buni en local con Docker** en `localhost`. Son proyectos
sencillos: no hay reverse proxy, ni TLS, ni compose de producción. Un solo comando arranca todo.

## 📑 Índice

1. [Local con Docker](#1-local-con-docker)
2. [Rellenar el `.env`](#2-rellenar-el-env)
3. [Iniciar sesión en Buni (admin en memoria)](#3-iniciar-sesión-en-buni-admin-en-memoria)
4. [Frontend (standalone y build args)](#4-frontend-standalone-y-build-args)
5. [Copias de seguridad y restauración de MySQL](#5-copias-de-seguridad-y-restauración-de-mysql)
6. [Actualizar](#6-actualizar)
7. [Problemas frecuentes](#7-problemas-frecuentes)
8. [Nota sobre producción](#8-nota-sobre-producción)
9. [Seguridad](#9-seguridad)

---

## 1. Local con Docker

Un solo comando levanta **MySQL 8 + backend + frontend** desde el repo `api-buni`:

```bash
cd api-buni
docker compose -f compose.dev.yml up -d --build
```

Puertos y servicios:

| Servicio | Puerto host | Descripción |
|---|---|---|
| `web` (frontend Buni) | `http://localhost:3000` | Next.js standalone |
| `api` (backend) | `http://localhost:4000` | Express + Socket.IO |
| `db` (MySQL 8) | `localhost:3306` | Base de datos `buni` |

Cuando los tres servicios estén arriba, abre **`http://localhost:3000`** en el navegador para usar la
app. El backend responde en **`http://localhost:4000`**.

**Comprobar que arranca**:

```bash
curl http://localhost:4000/
# -> {"buni":"Estamos conectados uwu", ...}

docker compose -f compose.dev.yml ps   # db healthy, api/web up
```

**Dónde se guardan los datos**:

- Base de datos: volumen `buni-db-data` (`/var/lib/mysql` del contenedor).
- Archivos subidos: volumen `buni-uploads` (`/app/uploads` del contenedor).

**Recrear el esquema**: `db.sql` solo corre la **primera vez** que el volumen de datos está vacío
(comportamiento estándar de la imagen MySQL, que monta el script en
`/docker-entrypoint-initdb.d/`). Para volver a sembrar desde cero hay que borrar el volumen:

```bash
docker compose -f compose.dev.yml down -v   # ⚠️ destruye la base de datos local
docker compose -f compose.dev.yml up -d --build
```

Para apagar **sin** borrar datos:

```bash
docker compose -f compose.dev.yml down      # conserva los volúmenes
```

---

## 2. Rellenar el `.env`

El `compose.dev.yml` trae **valores por defecto para todo**, así que puedes levantar el stack sin
crear ningún `.env`. Si quieres personalizar credenciales, crea un `.env` junto al compose (en
`api-buni/`) tomando como plantilla `deploy/.env.example`:

```bash
cd api-buni
cp deploy/.env.example .env
# edita .env con tus valores
```

Variables que el compose local reconoce (todas opcionales, con el valor por defecto que usa si las
omites):

| Variable | Por defecto en local | Para qué |
|---|---|---|
| `DB_PASSWORD` | `buni` | Contraseña de root de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL en el host |
| `JWT_SECRET` | `dev_jwt_secret_change_me_min_32_chars_0001` | Secreto JWT (32+ caracteres) |
| `ADMIN_NAME` | `admin` | Nombre del admin en memoria |
| `ADMIN_EMAIL` | `admin@buni.local` | Email de login del admin |
| `ADMIN_PASSWORD` | `admin1234` | Contraseña del admin |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | `mailpit` / `1025` / `dev` / `dev` | Envío de correo |

> `DB_HOST`, `DB_NAME`, `CORS_ORIGINS`, `FRONTEND_URL` y `APP_API_TOPOLOGY` los fija el compose para
> `localhost` (`same-site`); en local no hace falta tocarlos.

---

## 3. Iniciar sesión en Buni (admin en memoria)

Buni no necesita que siembres un usuario a mano: el backend admite un **administrador en memoria**
definido por las variables `ADMIN_*`. Ese admin puede entrar aunque no exista en la base de datos.

Con los valores por defecto del compose, entra en `http://localhost:3000` con:

- **Email**: `admin@buni.local`
- **Contraseña**: `admin1234`

Si definiste `ADMIN_EMAIL` / `ADMIN_PASSWORD` en tu `.env`, usa esos. El resto del esquema (roles,
eventos, formularios) lo crea `db.sql` en el primer arranque; desde la sesión de admin puedes crear
los demás usuarios y datos de la app.

---

## 4. Frontend (standalone y build args)

El frontend Buni se construye con `output: 'standalone'`: Next emite `.next/standalone/server.js`
con una copia mínima de `node_modules`, más `.next/static` y `public/` copiados aparte. El contenedor
arranca con `node server.js`.

Las variables `NEXT_PUBLIC_*` son **build args**: Next las inlinea en el bundle del cliente **en
tiempo de compilación**. En local el compose las fija a `http://localhost:4000`
(`NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_WEBSOCKET_URL`). Consecuencia práctica:

> Si cambias `NEXT_PUBLIC_API_URL` o `NEXT_PUBLIC_WEBSOCKET_URL`, **reconstruye** la imagen `web`:
>
> ```bash
> docker compose -f compose.dev.yml up -d --build web
> ```

---

## 5. Copias de seguridad y restauración de MySQL

**Backup de la base de datos**:

```bash
cd api-buni
docker compose -f compose.dev.yml exec db \
  mysqldump -uroot -p"${DB_PASSWORD:-buni}" buni > backup.sql
```

**Restauración**:

```bash
docker compose -f compose.dev.yml exec -T db \
  mysql -uroot -p"${DB_PASSWORD:-buni}" buni < backup.sql
```

**Backup del volumen de uploads** (`buni-uploads`):

```bash
docker run --rm \
  -v buni-dev_buni-uploads:/data \
  -v "$PWD":/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

> El prefijo del volumen (`buni-dev_`) proviene del `name:` del compose. Verifica el nombre exacto
> con `docker volume ls`.

---

## 6. Actualizar

Para aplicar cambios de código, reconstruye las imágenes y recrea los contenedores:

```bash
cd api-buni
docker compose -f compose.dev.yml up -d --build
```

Esto reconstruye las imágenes que cambiaron (`api`, `web`) y recrea solo los contenedores
afectados. Los volúmenes `buni-db-data` y `buni-uploads` se conservan. Recuerda reconstruir `web` si
cambiaste alguna `NEXT_PUBLIC_*` (sección 4).

---

## 7. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Las tablas salen vacías / el esquema no se creó | El volumen `buni-db-data` ya existía y MySQL no re-ejecutó `db.sql` | `docker compose -f compose.dev.yml down -v` para recrear (⚠️ borra datos) |
| El contenedor `api` reinicia en bucle | `JWT_SECRET` inválido (<32 chars o `your_secret_key`), o DB no lista | Corrige el `.env`; el `depends_on: service_healthy` ya espera a MySQL |
| El puerto 3000/4000/3306 está ocupado | Otro proceso usa ese puerto en el host | Libera el puerto o cambia el mapeo en `compose.dev.yml` |
| Healthcheck de `db`/`api` en rojo | El servicio aún arranca o el puerto no responde | Revisa `docker compose -f compose.dev.yml logs api` / `logs db` |

**Migraciones históricas**: Buni siembra todo el esquema con un único `db.sql` en el init; no hay
runner de migraciones. Los archivos en `src/database/migrations/` son históricos. Si partes de una
base de datos previa y necesitas aplicarlos a mano:

```bash
docker compose -f compose.dev.yml exec -T db \
  mysql -uroot -p"${DB_PASSWORD:-buni}" buni < src/database/migrations/<archivo>.sql
```

---

## 8. Nota sobre producción

Buni está pensado como un proyecto sencillo para correr en local. Aun así, las mismas imágenes Docker
(`api` desde `api-buni/Dockerfile`, `web` desde `Buni/Dockerfile`) corren en **cualquier host con
Docker**. Para exponerlo públicamente tú añadirías por tu cuenta:

- Un **reverse proxy con TLS** delante de los contenedores (el que prefieras), para servir por HTTPS.
- Las variables de **cookie cross-site / CORS**: con el frontend y la API en orígenes distintos,
  pon `APP_API_TOPOLOGY=cross-site`, y ajusta `CORS_ORIGINS` y `FRONTEND_URL` a tus dominios (origen
  exacto, sin barra final). La cookie cross-site requiere HTTPS (`SameSite=None; Secure`).
- Recuerda que las `NEXT_PUBLIC_*` son **build-time vars**: cámbialas y reconstruye la imagen `web`.

Eso queda fuera del alcance de esta guía; para uso local no necesitas nada de lo anterior.

---

## 9. Seguridad

- **No versiones el `.env`**. Solo el `.env.example` con placeholders entra al repositorio.
- **`JWT_SECRET`**: 32+ caracteres aleatorios y distinto de `your_secret_key`. El backend hace
  `process.exit(1)` si no lo cumple.
- **Contenedores no-root**: tanto `api` como `web` corren como el usuario `node` (uid 1000).
- **Rotación**: rota `JWT_SECRET`, las credenciales de MySQL y las `SMTP_*` periódicamente y tras
  cualquier filtración. Al rotar `JWT_SECRET` se invalidan las sesiones existentes.
- **Admin en memoria**: cambia las `ADMIN_*` por defecto antes de usar Buni en cualquier entorno que
  no sea tu máquina local.
