
import { Handler } from "@netlify/functions";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || '' });

const handler: Handler = async (event, _context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request: Missing body' };
  }

  try {
    const { name, email } = JSON.parse(event.body);
    if (!name || !email) {
      return { statusCode: 400, body: 'Name and email are required' };
    }

    const subject = `¡Cuenta Aprobada! Ya eres miembro de Conexión EC-CA`;
    const html = composeApprovalEmail(name);

    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: email,
      bcc: 'christian.alexis.banda@gmail.com',
      subject: subject,
      html: html,
    });

    return { statusCode: 200, body: 'Approval email sent successfully' };

  } catch (error) {
    console.error('Error sending approval email:', error);
    return { statusCode: 500, body: 'Error sending email' };
  }
};

function composeApprovalEmail(name: string): string {
    const colors = { primary: '#003366', secondary: '#FFD700', background: '#f4f7f6', cardBackground: '#ffffff', text: '#333333', lightText: '#666666', white: '#ffffff' };
    const baseUrl = 'https://www.ecuadorencanada.com';
    const logoUrl = `${baseUrl}/ecuanada.png`;

    // El link del CTA principal debe llevar al dashboard o al perfil del usuario
    const cta = { text: 'Completa tu Perfil Ahora', url: `${baseUrl}/dashboard` };
    const heading = `¡Excelentes noticias, ${name}!`;
    const text = `Tu cuenta en Conexión EC-CA ha sido aprobada y ya tienes acceso completo a nuestro portal. Ahora puedes crear servicios, registrarte a eventos y, lo más importante, conectar con otros miembros de la comunidad.<br><br>Para sacar el máximo provecho, te recomendamos completar tu perfil. Un perfil completo mejora tu visibilidad en el directorio y genera más confianza.`;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.background};">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto;">
                        <tr><td align="center" style="padding: 20px 0;"><img src="${logoUrl}" alt="Conexión EC-CA Logo" width="180" style="display: block;"></td></tr>
                        <tr>
                            <td style="background-color: ${colors.cardBackground}; padding: 40px 30px; border-radius: 8px;">
                                <h1 style="color: ${colors.primary}; font-size: 28px; margin-top: 0; margin-bottom: 15px;">${heading}</h1>
                                <p style="color: ${colors.text}; font-size: 16px; line-height: 1.6;">${text}</p>
                                <a href="${cta.url}" target="_blank" style="background-color: ${colors.primary}; color: ${colors.white}; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 20px;">
                                    ${cta.text}
                                </a>
                            </td>
                        </tr>
                        <tr><td align="center" style="padding: 20px 0; font-size: 12px; color: ${colors.lightText};"><p>&copy; ${new Date().getFullYear()} Conexión EC-CA</p></td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

export { handler };
