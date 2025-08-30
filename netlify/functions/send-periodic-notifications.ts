
import { Handler, schedule } from "@netlify/functions";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, getDocs, query, where, writeBatch, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { NotificationSettings as FrontendNotificationSettings } from "../../services/adminService";
import { CommunityServiceItem, EventItem, ServiceCategory, User } from "../../types";
 
interface NotificationSettings extends FrontendNotificationSettings {
    lastSent?: string;
}

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

// More robust initialization for serverless environments
if (getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
} else {
    app = getApp();
    db = getFirestore(app);
}

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const sendPeriodicNotificationsHandler: Handler = async (event, _context) => {
    console.log("\n--- Executing periodic notification function... ---");

    if (!db) {
        console.error("Firestore is not initialized. Exiting function. Check server environment variables.");
        return { statusCode: 500, body: "Server configuration error: Database not initialized." };
    }

    const body = JSON.parse(event.body || '{}');
    const queryParams = event.queryStringParameters || {};
    const force = body.force || queryParams.force === 'true';

    console.log(`Execution context: force=${force}`);

    // 1. Get Notification Settings
    const settingsDocRef = doc(db, 'settings', 'notifications');
    const settingsDoc = await getDoc(settingsDocRef);
    if (!settingsDoc.exists) {
        console.log("Notification settings not found. Exiting.");
        return { statusCode: 200, body: "Notification settings not found." };
    }
    const settings = settingsDoc.data() as NotificationSettings;
    console.log("Fetched settings:", settings);

    // 2. Frequency Check
    let shouldSend = false;
    let reason = '';
    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
    
    if (force) {
        shouldSend = true;
        reason = 'Execution was forced via POST request';
    } else {
        switch (settings.frequency) {
            case 'daily':
                shouldSend = true;
                reason = 'Frequency is daily';
                break;
            case 'weekly':
                if (dayOfWeek === 'Monday') {
                    shouldSend = true;
                    reason = 'Frequency is weekly and today is Monday';
                }
                break;
            case 'bi-weekly':
                if (dayOfWeek === 'Monday') {
                    const lastSent = settings.lastSent ? new Date(settings.lastSent) : undefined;
                    if (!lastSent) {
                        shouldSend = true; // First time sending
                        reason = 'Bi-weekly frequency and no previous sent date';
                    } else {
                        const todayDate = new Date();
                        const diffTime = Math.abs(todayDate.getTime() - lastSent.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays >= 14) {
                            shouldSend = true;
                            reason = `Bi-weekly frequency and ${diffDays} days have passed since last sent`;
                        }
                    }
                }
                break;
            case 'instant':
                console.log("Instant frequency is ignored by the periodic job.");
                return { statusCode: 200, body: "Instant frequency is ignored." };
        }
    }

    if (!shouldSend) {
        console.log(`-> Decision: Not sending today. Frequency: ${settings.frequency}. Today is ${dayOfWeek}.`);
        return { statusCode: 200, body: "Not a scheduled day." };
    }
    
    console.log(`-> Decision: Proceeding with execution. Reason: ${reason}`);

    // --- REFACTOR START ---

    // Paso 1: Recolectar y Clasificar el Contenido Nuevo
    console.log("\n--- Step 1: Collecting New Content ---");
    const { contentByCategory, allNewItems } = await getAndClassifyNewContent();
    console.log(`Found ${allNewItems.length} total new items to be processed.`);

    if (allNewItems.length === 0) {
        console.log("-> Conclusion: No new content to send. Exiting.");
        return { statusCode: 200, body: "No new content." };
    }

    // Paso 2: Identificar y Agrupar Perfiles de Usuarios
    console.log("\n--- Step 2: Grouping Subscribed Users ---");
    const userGroups = await groupSubscribedUsers();
    console.log(`Found ${userGroups.size} user groups with different subscription preferences.`);

    if (userGroups.size === 0) {
        console.log("-> Conclusion: No subscribed users to send to. Exiting.");
        return { statusCode: 200, body: "No subscribed users." };
    }

    // Paso 3: Generar y Enviar Correos Personalizados por Grupo
    console.log("\n--- Step 3: Processing and Sending Emails ---");
    const isProduction = 0 //process.env.NETLIFY_CONTEXT === 'production';
    console.log(`Production mode: ${isProduction}`);
    
    let totalEmailsSent = 0;
    let successfullySentGroups = 0;

    for (const [subscriptionKey, users] of userGroups.entries()) {
        console.log(`\n--- Processing Group: [${subscriptionKey}] ---`);
        try {
            const subscribedCategories = subscriptionKey.split(',') as ServiceCategory[];
            
            const relevantContent: (CommunityServiceItem | EventItem)[] = [];
            subscribedCategories.forEach(category => {
                if (contentByCategory.has(category)) {
                    relevantContent.push(...contentByCategory.get(category)!);
                }
            });
            console.log(`Found ${relevantContent.length} relevant items for this group.`);

            if (relevantContent.length === 0) {
                console.log("Skipping group as they have no new relevant content.");
                continue;
            }

            const relevantServices = relevantContent.filter(item => 'serviceName' in item) as CommunityServiceItem[];
            const relevantEvents = relevantContent.filter(item => 'title' in item) as EventItem[];

            const emailHtml = composeEmail(relevantServices, relevantEvents);
            const recipientEmails = users.map(u => u.email).filter(Boolean) as string[];

            if (recipientEmails.length > 0) {
                const messageData = {
                    from: process.env.MAILGUN_FROM_EMAIL,
                    subject: "Tu resumen de novedades de la comunidad EC-CA",
                    html: emailHtml,
                    ...(isProduction 
                        ? { bcc: recipientEmails } 
                        : { to: "christian.alexis.banda@gmail.com" }
                    )
                };

                console.log(`Sending email to ${recipientEmails.length} users in this group.`);
                await mg.messages.create(process.env.MAILGUN_DOMAIN || '', messageData);
                totalEmailsSent += recipientEmails.length;

                // Paso 4 (modificado): Actualizar estado por grupo para mayor resiliencia
                const batch = writeBatch(db);
                relevantContent.forEach(item => {
                    const itemType = 'serviceName' in item ? 'services' : 'events';
                    const docRef = doc(db, itemType, item.id);
                    batch.update(docRef, { isNotified: true });
                });
                await batch.commit();
                console.log(`Successfully sent and marked ${relevantContent.length} items as notified for this group.`);
                successfullySentGroups++;
            } else {
                console.log("No valid recipient emails in this group.");
            }
        } catch (error) {
            console.error(`Failed to process group '[${subscriptionKey}]'. Error:`, error);
            // Continuar con el siguiente grupo
        }
    }

    // Actualizar la fecha del último envío solo si se procesó al menos un grupo
    if (successfullySentGroups > 0) {
        await setDoc(settingsDocRef, { lastSent: new Date().toISOString() }, { merge: true });
        console.log(`\n-> Process finished. Total emails sent to ${totalEmailsSent} users across ${successfullySentGroups} groups.`);
        return { statusCode: 200, body: "Emails sent successfully." };
    } else {
        console.log("\n-> Process finished, but no groups were successfully processed.");
        return { statusCode: 200, body: "No groups processed." };
    }
    // --- REFACTOR END ---
};

async function getAndClassifyNewContent() {
    console.log("Querying for new services and events...");
    const newServices = await getNewServices();
    const newEvents = await getNewEvents();
    console.log(`Raw data: Found ${newServices.length} new services, ${newEvents.length} new events.`);
    const allNewItems = [...newServices, ...newEvents];

    const contentByCategory = new Map<ServiceCategory, (CommunityServiceItem | EventItem)[]>();

    allNewItems.forEach(item => {
        const category = item.category;
        if (category) {
            if (!contentByCategory.has(category)) {
                contentByCategory.set(category, []);
            }
            contentByCategory.get(category)!.push(item);
        }
    });
    console.log(`Content classified into ${contentByCategory.size} categories.`);
    return { contentByCategory, allNewItems };
}

async function getNewServices(): Promise<CommunityServiceItem[]> {
    try {
        const q = query(
            collection(db, 'services'),
            where('isNotified', '==', false),
            where('status', '==', 'Aprobado')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityServiceItem));
    } catch (error) {
        console.error("Error fetching from 'services' collection. Check for data type inconsistencies in 'isNotified' (should be boolean) or 'status' (should be string).", error);
        throw new Error("Failed to fetch services");
    }
}

async function getNewEvents(): Promise<EventItem[]> {
    try {
        const q = query(
            collection(db, 'events'),
            where('isNotified', '==', false),
            where('published', '==', true),
            where('date', '>=', Timestamp.now()) // Opcional: no notificar sobre eventos pasados
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
    } catch (error) {
        console.error("Error fetching from 'events' collection. Check for data type inconsistencies, especially in the 'date' field (should be a Firestore timestamp).", error);
        throw new Error("Failed to fetch events");
    }
}

async function groupSubscribedUsers(): Promise<Map<string, User[]>> {
    try {
        console.log("Querying for users with newsletterSubscription=true...");
        const q = query(
            collection(db, 'users'),
            where('newsletterSubscription', '==', true)
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs
            .map(doc => doc.data() as User)
            .filter(user => user.subscribedServiceCategories && user.subscribedServiceCategories.length > 0);
        console.log(`Found ${users.length} users with subscriptions to specific categories.`);

        const userGroups = new Map<string, User[]>();

        users.forEach(user => {
            const key = user.subscribedServiceCategories!.sort().join(',');
            if (!userGroups.has(key)) userGroups.set(key, []);
            userGroups.get(key)!.push(user);
        });

        return userGroups;
    } catch (error) {
        console.error("Error fetching from 'users' collection. Check for data type inconsistencies in 'newsletterSubscription' (should be boolean).", error);
        throw new Error("Failed to fetch users");
    }
}

function composeEmail(services: CommunityServiceItem[], events: EventItem[]): string {
    // --- INICIO DEL TEMPLATE HTML ---

    // Estilos en línea para máxima compatibilidad con clientes de correo
    const colors = {
        primary: '#003366', // Ecuador Blue (asumido)
        secondary: '#FFD700', // Ecuador Yellow (asumido)
        background: '#f4f7f6',
        cardBackground: '#ffffff',
        text: '#333333',
        lightText: '#666666',
        white: '#ffffff'
    };

    const baseUrl = 'https://www.ecuadorencanada.com'; // <-- IMPORTANTE: Reemplazar con la URL real de tu sitio
    const logoUrl = `${baseUrl}/ecuanada.png`; // Asumiendo que el logo está en la raíz pública

    let servicesHtml = '';
    if (services.length > 0) {
        servicesHtml = `
            <h2 style="color: ${colors.primary}; font-size: 22px; margin-bottom: 20px;">Nuevos Servicios en la Comunidad</h2>
            ${services.map(s => `
                <div style="background-color: ${colors.cardBackground}; border-radius: 8px; padding: 25px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
                    <h3 style="color: ${colors.primary}; font-size: 18px; margin-top: 0; margin-bottom: 10px;">${s.serviceName}</h3>
                    <p style="color: ${colors.lightText}; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">${s.shortDescription}</p>
                    <a href="${baseUrl}/services/${s.id}" target="_blank" style="background-color: ${colors.primary}; color: ${colors.white}; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Ver Detalles
                    </a>
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
                    <p style="color: ${colors.lightText}; font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
                        <strong>Fecha:</strong> ${new Date(e.date.seconds * 1000).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <a href="${baseUrl}/events/${e.id}" target="_blank" style="background-color: ${colors.primary}; color: ${colors.white}; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Más Información
                    </a>
                </div>
            `).join('')}
        `;
    }

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novedades de la Comunidad EC-CA</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.background};">
            <tr>
                <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto;">
                        <!-- Header con Logo -->
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <img src="${logoUrl}" alt="Conexión EC-CA Logo" width="180" style="display: block;">
                            </td>
                        </tr>
                        <!-- Contenido Principal -->
                        <tr>
                            <td style="background-color: ${colors.cardBackground}; padding: 40px 30px; border-radius: 8px;">
                                <h1 style="color: ${colors.primary}; font-size: 28px; margin-top: 0; margin-bottom: 15px;">¡Hola!</h1>
                                <p style="color: ${colors.text}; font-size: 16px; line-height: 1.6;">
                                    Para que no te pierdas de nada, aquí tienes tu resumen con las últimas oportunidades y eventos en la comunidad de Ecuatorianos en Canadá que coinciden con tus intereses.
                                </p>
                                <div style="margin-top: 30px;">
                                    ${servicesHtml}
                                    ${eventsHtml}
                                </div>
                                <p style="color: ${colors.lightText}; font-size: 16px; line-height: 1.6; margin-top: 40px;">
                                    Puedes ver todas las novedades y gestionar tus preferencias visitando el portal.
                                </p>
                                <a href="${baseUrl}" target="_blank" style="background-color: ${colors.secondary}; color: ${colors.primary}; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">
                                    Ir al Portal
                                </a>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 20px 0; font-size: 12px; color: ${colors.lightText};">
                                <p>Recibes este correo porque te suscribiste a las notificaciones de Conexión EC-CA.</p>
                                <p>&copy; ${new Date().getFullYear()} Conexión EC-CA. Todos los derechos reservados.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
    // --- FIN DEL TEMPLATE HTML ---
}

// For production, use the schedule wrapper to run this function daily.
export const handler = schedule("@daily", sendPeriodicNotificationsHandler);

// For local testing via HTTP POST, export the handler directly.
// This avoids potential issues with the schedule() wrapper in the local dev environment.
// Remember to switch back to the scheduled export before deploying.
// export const handler = sendPeriodicNotificationsHandler;
