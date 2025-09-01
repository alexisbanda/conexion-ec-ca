import { Handler, HandlerEvent } from "@netlify/functions";
import * as admin from 'firebase-admin';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { User } from "../../types";

// --- Inicialización del SDK de Admin de Firebase ---
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CONFIG || '{}')),
    });
  } catch (e) {
    console.error('Error inicializando Firebase Admin SDK:', e);
  }
}

const db = admin.firestore();

// --- Inicialización de Mailgun ---
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const provinceAbbreviations: { [key: string]: string } = {
    "Alberta": "ab",
    "British Columbia": "bc",
    "Manitoba": "mb",
    "New Brunswick": "nb",
    "Newfoundland and Labrador": "nl",
    "Nova Scotia": "ns",
    "Ontario": "on",
    "Prince Edward Island": "pe",
    "Quebec": "qc",
    "Saskatchewan": "sk",
    "Northwest Territories": "nt",
    "Nunavut": "nu",
    "Yukon": "yt"
};

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { guideTitle, region, downloadUrl, description } = JSON.parse(event.body || '{}');

    if (!guideTitle || !region || !downloadUrl) {
        return { statusCode: 400, body: 'Missing required guide information.' };
    }

    try {
        let query: admin.firestore.Query = db.collection('users')
            .where('status', '==', 'Aprobado') // Corregido a 'Aprobado'
            .where('newsletterSubscription', '==', true);

        const provinceAbbr = provinceAbbreviations[region];
        if (region !== 'Canadá' && provinceAbbr) {
            query = query.where('province', '==', provinceAbbr);
        }

        const usersSnapshot = await query.get();
        
        const recipients = usersSnapshot.docs.map(doc => (doc.data() as User).email).filter(Boolean);

        if (recipients.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: 'No subscribed users found for this region.' }) };
        }

        const emailHtml = composeEmail(guideTitle, description, downloadUrl, region);
        
        const messageData = {
            from: process.env.MAILGUN_FROM_EMAIL,
            to: 'christian.alexis.banda@gmail.com', //recipientEmails,
            bcc: 'christian.alexis.banda@gmail.com',
            subject: `Nueva guía disponible: ${guideTitle}`,
            html: emailHtml,
        };

        await mg.messages.create(process.env.MAILGUN_DOMAIN || '', messageData);

        return { statusCode: 200, body: JSON.stringify({ message: `Email sent to ${recipients.length} users.` }) };

    } catch (error) {
        console.error("Error in send-guide-notification:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
    }
};

function composeEmail(title: string, description: string, url: string, region: string): string {
    const colors = { primary: '#003366', secondary: '#FFD700', background: '#f4f7f6', card: '#ffffff', text: '#333' };
    const siteUrl = process.env.URL || 'https://www.ecuadorencanada.com';

    return `
    <div style="font-family: sans-serif; background-color: ${colors.background}; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: ${colors.card}; border-radius: 8px; padding: 30px;">
        <h1 style="color: ${colors.primary};">Nueva Guía Disponible</h1>
        <p style="color: ${colors.text};">Hola, socio. Te informamos que hay una nueva guía disponible en el portal que podría ser de tu interés.</p>
        <div style="border-left: 4px solid ${colors.secondary}; padding-left: 15px; margin: 20px 0;">
          <h2 style="color: ${colors.primary}; margin-top: 0;">${title}</h2>
          <p style="color: ${colors.text};"><strong>Región:</strong> ${region}</p>
          <p style="color: ${colors.text};">${description}</p>
        </div>
        <a href="${siteUrl}${url}" target="_blank" style="background-color: ${colors.primary}; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Descargar la Guía
        </a>
        <p style="font-size: 0.8em; color: #777; margin-top: 20px;">Recibes este correo como socio de Conexión EC-CA.</p>
      </div>
    </div>
    `;
}

export { handler };