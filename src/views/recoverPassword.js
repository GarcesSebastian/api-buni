export const recoverPassword = (nombre, recoveryCode) => {
    const currentYear = new Date().getFullYear();
    const frontendUrl = process.env.FRONTEND_URL;
    const logoUrl = `${frontendUrl}/logo.png`;

    const recoverPasswordTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña - Bienestar Universitario</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    background-color: rgb(255, 255, 255);
                    color: rgb(2, 17, 23);
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: rgb(255, 255, 255);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 1px solid rgb(226, 234, 240);
                }
                .logo {
                    max-width: 150px;
                }
                .content {
                    padding: 30px 20px;
                    color: rgb(2, 17, 23);
                }
                .code-container {
                    margin: 30px 0;
                    padding: 15px;
                    background-color: rgb(241, 245, 249);
                    border-radius: 0.5rem;
                    text-align: center;
                }
                .recovery-code {
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    color: rgb(222, 38, 38);
                }
                .footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid rgb(226, 234, 240);
                    color: rgb(100, 123, 139);
                    font-size: 12px;
                }
                h1 {
                    color: rgb(222, 38, 38);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="Logo Bienestar Universitario" class="logo">
                </div>
                <div class="content">
                    <h1>Recuperación de Contraseña</h1>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Bienestar Universitario. Para continuar con el proceso, utiliza el siguiente código de recuperación:</p>
                    
                    <div class="code-container">
                        <p class="recovery-code">${recoveryCode}</p>
                    </div>
                    
                    <p>Este código es válido por 30 minutos. Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo.</p>
                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al equipo de soporte.</p>
                    
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responder.</p>
                        <p>© ${currentYear} Bienestar Universitario. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return {
        subject: "Código de Recuperación de Contraseña - Bienestar Universitario",
        body: recoverPasswordTemplate,
    };
}