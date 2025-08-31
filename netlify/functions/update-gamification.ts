import { Handler } from "@netlify/functions";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, doc, updateDoc, getDoc, increment, arrayUnion, DocumentData } from "firebase/firestore";

interface GamificationRequest {
    userId: string;
    actionType: 'COMPLETE_PROFILE' | 'CREATE_SERVICE' | 'CREATE_EVENT' | 'SERVICE_APPROVED' | 'EVENT_APPROVED';
}

const pointValues: Record<string, number> = {
    COMPLETE_PROFILE: 100,
    CREATE_SERVICE: 75,
    CREATE_EVENT: 75,
    SERVICE_APPROVED: 50,
    EVENT_APPROVED: 50,
};

const directBadgeAwards: Record<string, string> = {
    COMPLETE_PROFILE: '¡Hola, Mundo!',
    SERVICE_APPROVED: 'El Emprendedor/a',
    EVENT_APPROVED: 'El Anfitrión/a',
};

function getLevelForPoints(points: number): string {
    if (points >= 3000) return 'Embajador/a';
    if (points >= 1500) return 'Pilar de la Comunidad';
    if (points >= 500) return 'Colaborador/a Activo/a';
    return 'Socio/a';
}

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
    app = initializeApp({ 
        apiKey: process.env.VITE_FIREBASE_API_KEY, 
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN, 
        projectId: process.env.VITE_FIREBASE_PROJECT_ID 
    });
    db = getFirestore(app);
} else {
    app = getApp();
    db = getFirestore(app);
}

const handler: Handler = async (event, _context) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return { statusCode: 400, body: 'Bad Request' };
    }

    try {
        const { userId, actionType } = JSON.parse(event.body) as GamificationRequest;

        if (!userId || !actionType) {
            return { statusCode: 400, body: 'userId and actionType are required.' };
        }

        const pointsToAdd = pointValues[actionType];
        if (pointsToAdd === undefined) {
            return { statusCode: 400, body: `Unknown actionType: ${actionType}` };
        }

        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            return { statusCode: 404, body: 'User not found.' };
        }

        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
        const newTotalPoints = currentPoints + pointsToAdd;

        // Preparar actualizaciones
        const updates: DocumentData = {
            points: increment(pointsToAdd)
        };

        // Contadores específicos
        if (actionType === 'SERVICE_APPROVED') {
            updates.servicesCount = increment(1);
        }
        if (actionType === 'EVENT_APPROVED') {
            updates.eventsCount = increment(1);
        }

        // Verificar insignias
        const badgeToAward = directBadgeAwards[actionType];
        if (badgeToAward && !userData.badges?.includes(badgeToAward)) {
            updates.badges = arrayUnion(badgeToAward);
        }

        // Verificar nivel
        const currentLevel = userData.membershipLevel || 'Socio/a';
        const newLevel = getLevelForPoints(newTotalPoints);
        if (newLevel !== currentLevel) {
            updates.membershipLevel = newLevel;
        }

        // Ejecutar actualización
        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({
                message: `Gamification updated for action ${actionType}`,
                pointsAdded: pointsToAdd,
                newTotalPoints: newTotalPoints,
                levelChanged: newLevel !== currentLevel,
                newLevel: newLevel !== currentLevel ? newLevel : undefined
            })
        };

    } catch (error) {
        console.error("Error in gamification engine:", error);
        return { statusCode: 500, body: `Internal Server Error: ${error.message}` };
    }
};

export { handler };