// /home/alexis/Sites/Landings/conexion-ec-ca/services/eventService.ts
import { db } from '../firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc, // <-- ¡LA IMPORTACIÓN QUE FALTABA!
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { EventItem } from '../types';

// --- Funciones para el público ---

/**
 * Obtiene solo los eventos publicados para la página principal.
 */
export const getPublicEvents = async (): Promise<EventItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventsCollection = collection(db, 'events');
    const q = query(
        eventsCollection,
        where('published', '==', true),
        orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};

/**
 * Obtiene los datos de un evento específico por su ID.
 */
export const getEventById = async (eventId: string): Promise<EventItem | null> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const eventDocRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as EventItem;
    }
    return null;
};

/**
 * Obtiene los eventos creados por un usuario específico.
 */
export const getUserEvents = async (userId: string): Promise<EventItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventsCollection = collection(db, 'events');
    const q = query(
        eventsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};

/**
 * Obtiene los últimos eventos publicados de una ciudad específica.
 * @param city - La ciudad para filtrar los eventos.
 * @param limit - El número máximo de eventos a obtener.
 * @returns Una promesa que se resuelve con un array de EventItem.
 */
export const getEventsByCity = async (city: string, limitNum: number): Promise<EventItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventsCollection = collection(db, 'events');
    const q = query(
        eventsCollection,
        where('published', '==', true),
        where('city', '==', city),
        orderBy('date', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};


// --- Funciones para el Administrador ---

/**
 * Obtiene TODOS los eventos para el panel de administración, con filtros opcionales.
 */
export const getAllEventsForAdmin = async (filters?: { province?: string }): Promise<EventItem[]> => {
    if (!db) return [];
    const eventsCollection = collection(db, 'events');
    
    const queryConstraints = [orderBy('date', 'desc')];

    if (filters?.province) {
        queryConstraints.push(where('province', '==', filters.province));
    }

    const q = query(eventsCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};

/**
 * Crea un nuevo evento en Firestore.
 */
export const createEvent = async (data: Omit<EventItem, 'id' | 'createdAt' | 'rsvps'>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    await addDoc(collection(db, 'events'), {
        ...data,
        published: data.published ?? false,
        rsvps: [], // Inicializar la lista de RSVP vacía
        createdAt: serverTimestamp(),
    });
};

/**
 * Actualiza un evento existente en Firestore.
 */
export const updateEvent = async (id: string, data: Partial<EventItem>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventDocRef = doc(db, 'events', id);
    await updateDoc(eventDocRef, data);
};

/**
 * Elimina un evento de Firestore.
 */
export const deleteEvent = async (id: string): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventDocRef = doc(db, 'events', id);
    await deleteDoc(eventDocRef);
};


// --- Funciones para RSVP ---

/**
 * Agrega el UID de un usuario a la lista de RSVP de un evento.
 */
export const rsvpToEvent = async (eventId: string, userId: string): Promise<void> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const eventDocRef = doc(db, 'events', eventId);
    await updateDoc(eventDocRef, {
        rsvps: arrayUnion(userId)
    });
};

/**
 * Remueve el UID de un usuario de la lista de RSVP de un evento.
 */
export const cancelRsvp = async (eventId: string, userId: string): Promise<void> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const eventDocRef = doc(db, 'events', eventId);
    await updateDoc(eventDocRef, {
        rsvps: arrayRemove(userId)
    });
};

/**
 * Obtiene los eventos a los que un usuario ha confirmado asistencia.
 */
export const getEventsForUserRsvp = async (userId: string): Promise<EventItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const eventsCollection = collection(db, 'events');
    const q = query(
        eventsCollection,
        where('rsvps', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventItem));
};