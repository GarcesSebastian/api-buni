export const createAccountEmail = async (nombre, password, email, role) => {
    const currentYear = new Date().getFullYear();
    const logoUrl = "https://i.ibb.co/K8mMDbP/Logo.png"; 

    const emailTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a Bienestar Universitario</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    line-height: 1.6;
                    color: #021117;
                    background-color: #f1f5f9;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                }
                .header {
                    text-align: center;
                    background-color: #ffffff;
                    border-radius: 8px 8px 0 0;
                    padding: 20px 0;
                }
                .logo {
                    max-width: 200px;
                    height: auto;
                }
                .content {
                    padding: 0 20px;
                    background-color: #ffffff;
                    border-radius: 0 0 8px 8px;
                    border: 1px solid #e2eaf0;
                }
                .credentials-box {
                    background-color: #f8fafc;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    border-left: 4px solid #de2626;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .credentials-box p {
                    margin: 8px 0;
                }
                .credentials-box strong {
                    color: #021117;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e2eaf0;
                    color: #64748b;
                    font-size: 14px;
                }
                h1 {
                    color: #021117;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    margin: 16px 0;
                    color: #334155;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" 
                         alt="Logo Bienestar Universitario" 
                         class="logo"
                         style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
                </div>
                
                <div class="content">
                    <h1>¡Bienvenido a Bienestar Universitario!</h1>
                    
                    <p>Estimado/a ${nombre},</p>
                    
                    <p>Nos complace informarte que tu cuenta ha sido creada exitosamente en el sistema de Bienestar Universitario. A continuación, encontrarás tus credenciales de acceso:</p>
                    
                    <div class="credentials-box">
                        <p><strong>Correo electrónico:</strong> ${email}</p>
                        <p><strong>Contraseña:</strong> ${password}</p>
                        <p><strong>Rol:</strong> ${role}</p>
                    </div>
                    
                    <p>Por razones de seguridad, te recomendamos no compartir tu contraseña.</p>
                    
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
        subject: "Bienvenido a Bienestar Universitario Unisinu",
        body: emailTemplate,
    };
}