
import { Handler, schedule } from "@netlify/functions";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, getDocs, query, where, writeBatch, doc, getDoc, setDoc } from "firebase/firestore";
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { NotificationSettings as FrontendNotificationSettings } from "../../services/adminService";

interface NotificationSettings extends FrontendNotificationSettings {
    lastSent?: string;
}
import { CommunityServiceItem, EventItem, User } from "../../types";

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

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const sendPeriodicNotifications: Handler = async (event, context) => {
    console.log("Executing periodic notification function...");

    const { force } = JSON.parse(event.body || '{}');

    // 1. Get Notification Settings
    const settingsDocRef = doc(db, 'settings', 'notifications');
    const settingsDoc = await getDoc(settingsDocRef);
    if (!settingsDoc.exists) {
        console.log("Notification settings not found. Exiting.");
        return { statusCode: 200, body: "Notification settings not found." };
    }
    const settings = settingsDoc.data() as NotificationSettings;

    const today = new Date().toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"

    // 2. Frequency Check
    let shouldSend = false;
    if (force) {
        shouldSend = true;
    } else {
        switch (settings.frequency) {
            case 'daily':
                shouldSend = true;
                break;
            case 'weekly':
                // Assuming weekly is on Monday
                if (today === 'Monday') {
                    shouldSend = true;
                }
                break;
            case 'bi-weekly':
                if (today === 'Monday') {
                    const lastSent = settings.lastSent ? new Date(settings.lastSent) : null;
                    if (!lastSent) {
                        shouldSend = true; // First time sending
                    } else {
                        const todayDate = new Date();
                        const diffTime = Math.abs(todayDate.getTime() - lastSent.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays >= 14) {
                            shouldSend = true;
                        }
                    }
                }
                break;
            case 'instant':
                // This is handled by another function.
                console.log("Instant frequency is ignored by the periodic job.");
                return { statusCode: 200, body: "Instant frequency is ignored." };
        }
    }

    if (!shouldSend) {
        console.log(`Not sending today. Frequency is ${settings.frequency}. Today is ${today}.`);
        return { statusCode: 200, body: "Not a scheduled day." };
    }

    // 3. Fetch New Content
    const newServices = await getNewServices();
    const newEvents = await getNewEvents();

    if (newServices.length === 0 && newEvents.length === 0) {
        console.log("No new content to send.");
        return { statusCode: 200, body: "No new content." };
    }

    // 4. Fetch Users
    const users = await getSubscribedUsers();
    if (users.length === 0) {
        console.log("No subscribed users to send to.");
        return { statusCode: 200, body: "No subscribed users." };
    }

    // 5. Compose and Send Email
    try {
        const emailHtml = composeEmail(newServices, newEvents);
        const recipientEmails = users.map(u => u.email).filter(e => e) as string[];

        await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
            from: `Conexión EC-CA <${process.env.MAILGUN_FROM_EMAIL}>`,
            to: "christian.alexis.banda@gmail.com", // For testing
            // bcc: recipientEmails, // Use in production
            subject: "Novedades en la comunidad de Ecuatorianos en Canadá",
            html: emailHtml,
        });

        // 6. Update Content
        const batch = writeBatch(db);
        newServices.forEach(item => {
            const docRef = doc(db, 'services', item.id);
            batch.update(docRef, { isNotified: true });
        });
        newEvents.forEach(item => {
            const docRef = doc(db, 'events', item.id);
            batch.update(docRef, { isNotified: true });
        });
        await batch.commit();

        // Update lastSent date
        const settingsDocRef = doc(db, 'settings', 'notifications');
        await setDoc(settingsDocRef, { lastSent: new Date().toISOString() }, { merge: true });

        console.log(`Successfully sent notifications to ${recipientEmails.length} users.`);
        return { statusCode: 200, body: "Emails sent successfully." };

    } catch (error) {
        console.error("Error sending emails:", error);
        return { statusCode: 500, body: "Error sending emails." };
    }
};


async function getNewServices(): Promise<CommunityServiceItem[]> {
    const q = query(
        collection(db, 'services'),
        where('isNotified', '==', false),
        where('status', '==', 'Aprobado')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityServiceItem));
}

async function getNewEvents(): Promise<EventItem[]> {
    const q = query(
        collection(db, 'events'),
        where('isNotified', '==', false),
        where('published', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
}

async function getSubscribedUsers(): Promise<User[]> {
    const q = query(
        collection(db, 'users'),
        where('newsletterSubscription', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as User);
}

function composeEmail(services: CommunityServiceItem[], events: EventItem[]): string {
    let servicesHtml = '';
    if (services.length > 0) {
        servicesHtml = `
            <h2>Nuevos Servicios en la Comunidad</h2>
            <ul>
                ${services.map(s => `<li><b>${s.serviceName}</b>: ${s.shortDescription}</li>`).join('')}
            </ul>
        `;
    }

    let eventsHtml = '';
    if (events.length > 0) {
        eventsHtml = `
            <h2>Próximos Eventos</h2>
            <ul>
                ${events.map(e => `<li><b>${e.title}</b>: ${new Date(e.date.seconds * 1000).toLocaleDateString()}</li>`).join('')}
            </ul>
        `;
    }

    return `
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h1>¡Hola!</h1>
            <p>Aquí tienes las últimas novedades de la comunidad de Ecuatorianos en Canadá.</p>
            ${servicesHtml}
            ${eventsHtml}
            <p>Puedes ver más detalles visitando el portal.</p>
            <p>¡Que tengas un excelente día!</p>
        </div>
    `;
}


export const handler = schedule("@daily", sendPeriodicNotifications);
