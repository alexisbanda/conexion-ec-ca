
import { Handler } from "@netlify/functions";
import * as admin from 'firebase-admin';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// --- Tipos y Configuración ---
interface NotifyAdminsRequest {
    itemType: 'Servicio' | 'Evento' | 'Usuario';
    itemId: string;
    province: string;
    itemName?: string; // Nombre del servicio, evento o usuario
}

interface AdminUser {
    email: string;
    name: string;
}

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
}

const db = admin.firestore();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || '' });


// --- Handler Principal ---
const handler: Handler = async (event, _context) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return { statusCode: 400, body: 'Bad Request' };
    }

    try {
        const { itemType, itemId, province, itemName } = JSON.parse(event.body) as NotifyAdminsRequest;

        // 1. Encontrar a los administradores relevantes en paralelo
        const regionalAdminsQuery = db.collection('users')
            .where('role', '==', 'regional_admin')
            .where('managedProvince', '==', province);
            
        const generalAdminsQuery = db.collection('users').where('role', '==', 'admin');

        const [regionalSnapshot, generalSnapshot] = await Promise.all([
            regionalAdminsQuery.get(),
            generalAdminsQuery.get()
        ]);

        const regionalAdmins = regionalSnapshot.docs.map(doc => ({ email: doc.data().email, name: doc.data().name || doc.data().email }));
        const generalAdmins = generalSnapshot.docs.map(doc => ({ email: doc.data().email, name: doc.data().name || doc.data().email }));

        // Unir y eliminar duplicados
        const allAdmins = new Map<string, AdminUser>();
        [...regionalAdmins, ...generalAdmins].forEach(admin => {
            if(admin.email) allAdmins.set(admin.email, admin);
        });
        
        const recipients = Array.from(allAdmins.values());

        if (recipients.length === 0) {
            console.log("No admins found for this notification.");
            return { statusCode: 200, body: 'No admins to notify.' };
        }

        // 2. Componer y Enviar el Correo
        const recipientEmails = recipients.map(r => r.email);
        const email = composeAdminEmail({ itemType, province, itemName, itemId });

        await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
            from: process.env.MAILGUN_FROM_EMAIL,
            to: recipientEmails, // Mailgun maneja el envío a múltiples destinatarios
            bcc: 'diegovinuezaleon@gmail.com',
            subject: email.subject,
            html: email.html,
        });

        return { statusCode: 200, body: `Notification sent to ${recipients.length} admins.` };

    } catch (error) {
        console.error("Error notifying admins:", error);
        return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
    }
};

// --- Función para componer el correo ---
function composeAdminEmail(data: { itemType: string, province: string, itemName?: string, itemId: string }) {
    const { itemType, province, itemName, itemId } = data;
    const baseUrl = 'https://www.ecuadorencanada.com';
    const subject = `Nuevo ${itemType} pendiente de revisión en ${province}`;
    
    let reviewUrl = `${baseUrl}/admin`; // URL genérica por si acaso
    if (itemType === 'Servicio') reviewUrl = `${baseUrl}/admin/services`;
    if (itemType === 'Evento') reviewUrl = `${baseUrl}/admin/events`;
    if (itemType === 'Usuario') reviewUrl = `${baseUrl}/admin/users`;

    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #003366;">Alerta de Nuevo Contenido</h2>
            <p>Se ha creado un nuevo <strong>${itemType}</strong> en la provincia de <strong>${province}</strong> y está esperando tu aprobación.</p>
            ${itemName ? `<p><strong>Nombre:</strong> ${itemName}</p>` : ''}
            <p>Por favor, revísalo lo antes posible para que esté disponible para la comunidad.</p>
            <a href="${reviewUrl}" target="_blank" style="background-color: #003366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Ir al Panel para Revisar
            </a>
        </div>
    `;

    return { subject, html };
}

export { handler };
