
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SETTINGS_DOC_PATH = 'settings/notifications';

export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'bi-weekly';

export interface NotificationSettings {
    frequency: NotificationFrequency;
    // Podríamos añadir más settings aquí en el futuro, como la hora del envío
    // lastSent?: string; // Para la lógica quincenal
}

/**
 * Obtiene la configuración de notificaciones desde Firestore.
 * Si no existe, devuelve una configuración por defecto.
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as NotificationSettings;
    } else {
        // Si no hay configuración guardada, devolvemos un valor por defecto
        return { frequency: 'daily' };
    }
};

/**
 * Guarda o actualiza la configuración de notificaciones en Firestore.
 * @param settings El objeto de configuración a guardar.
 */
export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
    const docRef = doc(db, SETTINGS_DOC_PATH);
    // setDoc con { merge: true } para no sobreescribir otros campos en el futuro
    await setDoc(docRef, settings, { merge: true });
};
