// /netlify/functions/send-welcome-email.ts
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

// Inicializamos el cliente de Mailgun con las variables de entorno
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Solo permitimos peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // Parseamos los datos que vienen del frontend
    const { name, email } = JSON.parse(event.body || '{}');

    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name and email are required' }),
      };
    }

    const mailData = {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: email,
      bcc: 'christian.alexis.banda@gmail.com',
      subject: `¡Bienvenido a Conexión Migrante, ${name}!`,
      // Puedes usar texto plano, HTML o plantillas de Mailgun
      html: `
                    <h3>¡Hola ${name}!</h3>
                    <p>Gracias por registrarte en Conexión Migrante EC-CA.</p>
                    <p>Tu cuenta está siendo revisada por nuestro equipo. Te notificaremos a este correo cuando sea aprobada.</p>
                    <p>¡Gracias por tu paciencia!</p>
                `,
      // Para usar plantillas:
      // template: 'nombre-de-tu-plantilla',
      // 'h:X-Mailgun-Variables': JSON.stringify({ name: name })
    };

    // Enviamos el correo
    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', mailData);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending email' }),
    };
  }
};

export { handler };
    