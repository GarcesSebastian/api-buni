# Configuración de Variables de Entorno (Backend - api-buni)

Este archivo describe las variables de entorno necesarias para configurar el servidor backend.

## Archivo de configuración
Debes crear un archivo llamado `.env` en la raíz de la carpeta `api-buni/`.

## Variables Requeridas

### Configuración del Servidor
- **`PORT`**: Puerto en el que correrá el servidor Express (ej: `4000`).

### Base de Datos (MySQL)
- **`DB_HOST`**: Host de la base de datos (ej: `localhost`).
- **`DB_USER`**: Usuario de la base de datos (ej: `root`).
- **`DB_PASSWORD`**: Contraseña del usuario.
- **`DB_NAME`**: Nombre de la base de datos (ej: `buni`).
- **`DB_PORT`**: Puerto de MySQL (ej: `3306`).

### Seguridad y CORS
- **`CORS_ORIGINS`**: URL permitida para realizar peticiones (ej: `http://localhost:3000`).
- **`JWT_SECRET`**: Clave secreta para la firma de tokens JWT. ¡Cámbiala en producción!

### Credenciales de Administrador (Inicialización)
- **`ADMIN_NAME`**: Nombre del administrador por defecto.
- **`ADMIN_EMAIL`**: Correo electrónico del administrador.
- **`ADMIN_PASSWORD`**: Contraseña para la cuenta de administrador.

### Límite de Peticiones (Rate Limit)
- **`RATE_LIMIT_WINDOW_MINUTES`**: Tiempo de la ventana en minutos.
- **`RATE_LIMIT_MAX`**: Máximo de peticiones permitidas por IP en esa ventana.

### Correo Electrónico (SMTP)
- **`SMTP_HOST`**: Servidor SMTP (ej: `smtp.gmail.com`).
- **`SMTP_PORT`**: Puerto SMTP (ej: `587` para TLS).
- **`SMTP_USER`**: Correo electrónico desde el cual se enviarán las notificaciones.
- **`SMTP_PASS`**: Contraseña o "Contraseña de Aplicación" del correo.
  - *Nota: Para Gmail, es obligatorio usar una "Contraseña de Aplicación" si tienes 2FA activado.*

### Global
- **`FRONTEND_URL`**: URL raíz del frontend (ej: `http://localhost:3000`). Se utiliza para construir rutas de imágenes y enlaces en los correos electrónicos.

---

## Notas de Desarrollo
- El servidor utiliza `nodemon` en desarrollo para reiniciarse automáticamente cuando detecta cambios en el archivo `.env`.
