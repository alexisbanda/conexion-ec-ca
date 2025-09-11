import { Handler, schedule } from "@netlify/functions";
import * as admin from 'firebase-admin';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { NotificationSettings as FrontendNotificationSettings } from "../../services/adminService";
import { CommunityServiceItem, EventItem, ServiceCategory, User } from "../../types";
 
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

interface NotificationSettings extends FrontendNotificationSettings {
    lastSent?: string;
}

const sendPeriodicNotificationsHandler: Handler = async (event, _context) => {
    console.log("\n--- Executing periodic notification function (Admin SDK) ---");

    const body = JSON.parse(event.body || '{}');
    const queryParams = event.queryStringParameters || {};
    const force = body.force || queryParams.force === 'true';

    // 1. Get Notification Settings
    const settingsDocRef = db.doc('settings/notifications');
    const settingsDoc = await settingsDocRef.get();
    if (!settingsDoc.exists) {
        console.log("Notification settings not found. Exiting.");
        return { statusCode: 200, body: "Notification settings not found." };
    }
    const settings = settingsDoc.data() as NotificationSettings;

    // 2. Frequency Check
    if (!force) {
        const today = new Date();
        const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
        let shouldSend = false;
        if (settings.frequency === 'daily') shouldSend = true;
        if (settings.frequency === 'weekly' && dayOfWeek === 'Monday') shouldSend = true;
        if (settings.frequency === 'bi-weekly' && dayOfWeek === 'Monday') {
            const lastSent = settings.lastSent ? new Date(settings.lastSent) : undefined;
            if (!lastSent || (Math.abs(today.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)) >= 14) {
                shouldSend = true;
            }
        }
        if (!shouldSend) {
            console.log(`-> Decision: Not sending today. Frequency: ${settings.frequency}.`);
            return { statusCode: 200, body: "Not a scheduled day." };
        }
    }
    
    // 3. Collect Content
    const { contentByCategory, allNewItems } = await getAndClassifyNewContent();
    if (allNewItems.length === 0) {
        console.log("-> Conclusion: No new content to send. Exiting.");
        return { statusCode: 200, body: "No new content." };
    }

    // 4. Group Users
    const userGroups = await groupSubscribedUsers();
    if (userGroups.size === 0) {
        console.log("-> Conclusion: No subscribed users to send to. Exiting.");
        return { statusCode: 200, body: "No subscribed users." };
    }

    // 5. Process and Send Emails
    let successfullySentGroups = 0;
    for (const [subscriptionKey, users] of userGroups.entries()) {
        const subscribedCategories = subscriptionKey.split(',') as ServiceCategory[];
        const relevantContent = subscribedCategories.flatMap(category => contentByCategory.get(category) || []);

        if (relevantContent.length > 0) {
            const recipientEmails = users.map(u => u.email).filter(Boolean) as string[];
            if (recipientEmails.length > 0) {
                try {
                    const emailHtml = composeEmail(relevantContent);
                    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
                        from: process.env.MAILGUN_FROM_EMAIL,
                        to: 'christian.alexis.banda@gmail.com', //recipientEmails,
                        bcc: ['christian.alexis.banda@gmail.com', 'diegovinuezaleon@gmail.com'],
                        subject: "Tu resumen de novedades de la comunidad EC-CA",
                        html: emailHtml,
                    });
                    
                    const batch = db.batch();
                    relevantContent.forEach(item => {
                        const itemType = 'serviceName' in item ? 'services' : 'events';
                        const docRef = db.collection(itemType).doc(item.id);
                        batch.update(docRef, { isNotified: true });
                    });
                    await batch.commit();
                    successfullySentGroups++;
                } catch (error) {
                    console.error(`Failed to process group '[${subscriptionKey}]'. Error:`, error);
                }
            }
        }
    }

    if (successfullySentGroups > 0) {
        await settingsDocRef.set({ lastSent: new Date().toISOString() }, { merge: true });
        return { statusCode: 200, body: "Emails sent successfully." };
    }

    return { statusCode: 200, body: "No groups were successfully processed." };
};

async function getAndClassifyNewContent() {
    const servicesQuery = db.collection('services').where('isNotified', '==', false).where('status', '==', 'Aprobado');
    const eventsQuery = db.collection('events').where('isNotified', '==', false).where('published', '==', true).where('date', '>=', admin.firestore.Timestamp.now());

    const [servicesSnapshot, eventsSnapshot] = await Promise.all([servicesQuery.get(), eventsQuery.get()]);

    const newServices = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityServiceItem));
    const newEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
    
    const allNewItems = [...newServices, ...newEvents];
    const contentByCategory = new Map<ServiceCategory, (CommunityServiceItem | EventItem)[]>();

    allNewItems.forEach(item => {
        const category = item.category;
        if (category) {
            if (!contentByCategory.has(category)) contentByCategory.set(category, []);
            contentByCategory.get(category)!.push(item);
        }
    });

    return { contentByCategory, allNewItems };
}

async function groupSubscribedUsers(): Promise<Map<string, User[]>> {
    const usersQuery = db.collection('users').where('newsletterSubscription', '==', true);
    const snapshot = await usersQuery.get();
    
    const users = snapshot.docs
        .map(doc => doc.data() as User)
        .filter(user => user.subscribedServiceCategories && user.subscribedServiceCategories.length > 0);

    const userGroups = new Map<string, User[]>();
    users.forEach(user => {
        const key = user.subscribedServiceCategories!.sort().join(',');
        if (!userGroups.has(key)) userGroups.set(key, []);
        userGroups.get(key)!.push(user);
    });

    return userGroups;
}

function composeEmail(content: (CommunityServiceItem | EventItem)[]): string {
    const services = content.filter(item => 'serviceName' in item) as CommunityServiceItem[];
    const events = content.filter(item => 'title' in item) as EventItem[];
    // ... (El resto de la función composeEmail no necesita cambios)
    const colors = { primary: '#003366', secondary: '#FFD700', background: '#f4f7f6', cardBackground: '#ffffff', text: '#333333', white: '#ffffff' };
    const baseUrl = 'https://www.ecuadorencanada.com';
    const logoUrl = `${baseUrl}/ecuanada.png`;

    let servicesHtml = '';
    if (services.length > 0) {
        servicesHtml = `
            <h2 style="color: ${colors.primary}; font-size: 22px; margin-bottom: 20px;">Nuevos Servicios en la Comunidad</h2>
            ${services.map(s => `
                <div style="background-color: ${colors.cardBackground}; border-radius: 8px; padding: 25px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                    <h3 style="color: ${colors.primary}; font-size: 18px; margin-top: 0; margin-bottom: 10px;">${s.serviceName}</h3>
                    <p style="color: ${colors.text}; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">${s.shortDescription}</p>
                    <a href="${baseUrl}/services/${s.id}" target="_blank" style="background-color: ${colors.primary}; color: ${colors.white}; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver Detalles</a>
                </div>
            `).join('')}
        `;
    }

    let eventsHtml = '';
    if (events.length > 0) {
        eventsHtml = `
            <h2 style="color: ${colors.primary}; font-size: 22px; margin-top: 40px; margin-bottom: 20px;">Próximos Eventos</h2>
            ${events.map(e => `
                <div style="background-color: ${colors.cardBackground}; border-radius: 8px; padding: 25px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                    <h3 style="color: ${colors.primary}; font-size: 18px; margin-top: 0; margin-bottom: 10px;">${e.title}</h3>
                    <p style="color: ${colors.text}; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
                        <strong>Fecha:</strong> ${new Date((e.date as any)._seconds * 1000).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <a href="${baseUrl}/events/${e.id}" target="_blank" style="background-color: ${colors.primary}; color: ${colors.white}; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Más Información</a>
                </div>
            `).join('')}
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto;">
                        <tr><td align="center" style="padding: 20px 0;"><img src="${logoUrl}" alt="Logo" width="180"></td></tr>
                        <tr>
                            <td style="background-color: ${colors.cardBackground}; padding: 40px 30px; border-radius: 8px;">
                                <h1 style="color: ${colors.primary};">¡Hola!</h1>
                                <p style="color: ${colors.text};">Aquí está tu resumen de novedades de la comunidad:</p>
                                ${servicesHtml}
                                ${eventsHtml}
                                <a href="${baseUrl}" target="_blank" style="background-color: ${colors.secondary}; color: ${colors.primary}; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Ir al Portal</a>
                            </td>
                        </tr>
                        <tr><td align="center" style="padding: 20px 0; font-size: 12px; color: #666;"><p>&copy; ${new Date().getFullYear()} Conexión EC-CA</p></td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

export const handler = schedule("@daily", sendPeriodicNotificationsHandler);