// /home/alexis/Sites/Landings/conexion-ec-ca/services/newsService.ts
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
    limit, // <-- Importar 'limit'
    startAfter, // <-- Importar 'startAfter'
    DocumentSnapshot, // <-- Importar el tipo para el cursor
    serverTimestamp
} from 'firebase/firestore';
import { NewsItem } from '../types';
export const NEWS_PAGE_SIZE = 5; // Mostraremos 5 noticias por página
type NewsData = Omit<NewsItem, 'id'>;

// Obtiene solo las noticias publicadas y ordenadas por fecha de publicación
export const getPublicNews = async (): Promise<NewsItem[]> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const newsCollection = collection(db, 'news');
    const q = query(
        newsCollection,
        where('published', '==', true),
        orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
};

/**
 * Obtiene una "página" de noticias públicas.
 * @param lastVisible - El último documento de la página anterior para saber desde dónde empezar.
 */
export const getPaginatedPublicNews = async (lastVisible: DocumentSnapshot | null = null) => {
    if (!db) throw new Error("Firestore no está inicializado.");

    const newsCollection = collection(db, 'news');

    // Construimos la consulta base
    const constraints = [
        where('published', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(NEWS_PAGE_SIZE)
    ];

    // Si tenemos un cursor (no es la primera página), lo añadimos a la consulta
    if (lastVisible) {
        constraints.push(startAfter(lastVisible));
    }

    const q = query(newsCollection, ...constraints);
    const querySnapshot = await getDocs(q);

    const news = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));

    // Devolvemos tanto las noticias como el último documento para usarlo como cursor en la siguiente llamada
    return {
        news,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
};


// Obtiene todas las noticias para el panel de admin
export const getAllNews = async (): Promise<NewsItem[]> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const newsCollection = collection(db, 'news');
    const q = query(newsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
};

// Crea una nueva noticia
export const createNews = async (data: Omit<NewsData, 'published'>): Promise<void> => {
    if (!db) throw new Error("Firestore no inicializado.");
    await addDoc(collection(db, 'news'), {
        ...data,
        published: false, // Por defecto no se publica
    });
};

// Actualiza una noticia existente
export const updateNews = async (id: string, data: Partial<NewsData>): Promise<void> => {
    if (!db) throw new Error("Firestore no inicializado.");
    const newsDoc = doc(db, 'news', id);
    await updateDoc(newsDoc, data);
};

// Elimina una noticia
export const deleteNews = async (id: string): Promise<void> => {
    if (!db) throw new Error("Firestore no inicializado.");
    await deleteDoc(doc(db, 'news', id));
};