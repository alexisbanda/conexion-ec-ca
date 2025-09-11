// /netlify/functions/send-guide-email.ts
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { email, guideTitle, downloadUrl, consent } = JSON.parse(event.body || '{}');
    const mailingListAddress = 'guias@ecuadorencanada.com';

    if (!email || !guideTitle || !downloadUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email, guideTitle, and downloadUrl are required' }),
      };
    }

    const mailData = {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: email,
      cc: 'christian.alexis.banda@gmail.com',
bcc: 'diegovinuezaleon@gmail.com',
      subject: `Tu guía gratuita está aquí: ${guideTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h3>¡Hola!</h3>
          <p>Gracias por tu interés en nuestros recursos. Como lo solicitaste, aquí tienes el acceso a tu guía:</p>
          <h2 style="margin-bottom: 1rem;">${guideTitle}</h2>
          <a 
            href="${process.env.URL}${downloadUrl}" 
            target="_blank" 
            style="background-color: #00529B; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;"
          >
            Descargar la Guía Ahora
          </a>
          <p style="margin-top: 1.5rem; font-size: 0.9em; color: #555;">
            Si tienes problemas con el botón, copia y pega la siguiente URL en tu navegador:<br>
            <a href="${process.env.URL}${downloadUrl}">${process.env.URL}${downloadUrl}</a>
          </p>
          <hr style="margin: 2rem 0;">
          <p style="font-size: 0.8em; color: #777;">
            Recibiste este correo porque solicitaste una guía desde el portal de Conexión EC-CA. Si no fuiste tú, puedes ignorar este mensaje.
          </p>
        </div>
      `,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', mailData);

    if (consent) {
      try {
        await mg.lists.members.createMember(mailingListAddress, {
          address: email,
          subscribed: true,
          upsert: 'yes'
        });
      } catch (listError) {
        console.error('Error adding user to mailing list:', listError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };

  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending email', error: errorMessage }),
    };
  }
};

export { handler };