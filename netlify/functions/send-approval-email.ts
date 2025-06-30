// /netlify/functions/send-approval-email.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || '',
});

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    try {
        const { name, email } = JSON.parse(event.body || '{}');

        if (!name || !email) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Name and email are required' }) };
        }

        const mailData = {
            from: process.env.MAILGUN_FROM_EMAIL,
            to: email,
            subject: `¡Tu cuenta en Conexión Migrante ha sido aprobada!`,
            // Aquí puedes usar la plantilla que creaste en Mailgun
            // template: 'cuenta-aprobada',
            // 'h:X-Mailgun-Variables': JSON.stringify({ name: name, login_url: 'https://tu-sitio.com' })
            // O simplemente enviar HTML:
            html: `
                <h3>¡Hola ${name}!</h3>
                <p>¡Buenas noticias! Tu cuenta en Conexión Migrante EC-CA ha sido aprobada.</p>
                <p>Ya puedes iniciar sesión y acceder a todos los beneficios para miembros.</p>
                <p><a href="https://conexion-ec-ca.netlify.app/">Iniciar Sesión</a></p>
            `,
        };

        await mg.messages.create(process.env.MAILGUN_DOMAIN || '', mailData);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Approval email sent successfully' }),
        };

    } catch (error) {
        console.error('Error sending approval email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error sending approval email' }),
        };
    }
};

export { handler };