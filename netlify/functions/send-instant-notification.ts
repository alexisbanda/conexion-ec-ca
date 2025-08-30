
import { Handler } from "@netlify/functions";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { CommunityServiceItem, EventItem, User } from "../../types";

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
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

export const handler: Handler = async (event, _context) => {
    if (!db) {
        console.error("Firestore is not initialized. Exiting function. Check server environment variables.");
        return { statusCode: 500, body: "Server configuration error: Database not initialized." };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { itemId, itemType } = JSON.parse(event.body || '{}');

    if (!itemId || !itemType) {
        return { statusCode: 400, body: 'itemId and itemType are required' };
    }

    try {
        let item: CommunityServiceItem | EventItem | null = null;
        const docRef = doc(db, itemType, itemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            item = { id: docSnap.id, ...docSnap.data() } as DocumentData as CommunityServiceItem | EventItem;
        } else {
            return { statusCode: 404, body: 'Item not found' };
        }

        // --- REFACTOR START ---
        // Paso 1: Identificar Audiencia Relevante
        if (!item.category) {
            return { statusCode: 400, body: "Item does not have a category, cannot send instant notification." };
        }
        const users = await getUsersSubscribedToCategory(item.category);
        // --- REFACTOR END ---
        if (users.length === 0) {
            return { statusCode: 200, body: "No subscribed users." };
        }

        const emailHtml = composeEmail(item, itemType);
        const recipientEmails = users.map(u => u.email).filter(e => e) as string[];

        await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
            from: `Conexión EC-CA <${process.env.MAILGUN_FROM_EMAIL}>`,
            to: "christian.alexis.banda@gmail.com", // For testing
            //bcc: recipientEmails, // Use in production
            subject: `¡Nueva publicación en la comunidad! ${(item as EventItem).title || (item as CommunityServiceItem).serviceName}`,
            html: emailHtml,
        });

        await updateDoc(docRef, { isNotified: true });

        return { statusCode: 200, body: 'Email sent successfully' };

    } catch (error) {
        console.error("Error sending instant email:", error);
        return { statusCode: 500, body: 'Error sending email' };
    }
};

async function getUsersSubscribedToCategory(category: string): Promise<User[]> {
    try {
        const q = query(
            collection(db, 'users'),
            where('newsletterSubscription', '==', true),
            where('subscribedServiceCategories', 'array-contains', category)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error("Error fetching from 'users' collection. Check for data type inconsistencies. 'newsletterSubscription' should be boolean and 'subscribedServiceCategories' should be an array.", error);
        throw new Error("Failed to fetch users for instant notification");
    }
}

function composeEmail(item: CommunityServiceItem | EventItem, itemType: string): string {
    let itemHtml = '';
    if (itemType === 'services') {
        const service = item as CommunityServiceItem;
        itemHtml = `
            <h2>Nuevo Servicio en la Comunidad</h2>
            <p><b>${service.serviceName}</b>: ${service.shortDescription}</p>
        `;
    } else {
        const event = item as EventItem;
        itemHtml = `
            <h2>Próximo Evento</h2>
            <p><b>${event.title}</b>: ${new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
        `;
    }

    return `
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h1>¡Hola!</h1>
            <p>Hay una nueva publicación en la comunidad de Ecuatorianos en Canadá que podría interesarte.</p>
            ${itemHtml}
            <p>Puedes ver más detalles visitando el portal.</p>
            <p>¡Que tengas un excelente día!</p>
        </div>
    `;
}
