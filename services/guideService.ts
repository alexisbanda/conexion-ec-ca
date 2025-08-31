// services/guideService.ts

import { db } from '../firebaseConfig';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { Guide } from '../types';
import { DEFAULT_REGION } from '../constants';

/**
 * Crea un nuevo documento de guía en la colección 'guides' de Firestore.
 */
export const createGuide = async (guideData: Omit<Guide, 'id' | 'createdAt'>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    await addDoc(collection(db, 'guides'), {
        ...guideData,
        createdAt: serverTimestamp(),
    });
};

/**
 * Obtiene las guías para la vista pública, opcionalmente filtradas por región.
 * Siempre incluirá las guías de la región por defecto.
 * @param regionName - El nombre de la región a filtrar (ej. 'Ontario').
 */
export const getPublicGuides = async (regionName?: string): Promise<Guide[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const guidesCollection = collection(db, 'guides');
    
    const queryConstraints: any[] = [orderBy('createdAt', 'desc')];

    // Si se especifica una región, filtra por esa región Y por la región por defecto
    if (regionName && regionName !== DEFAULT_REGION) {
        queryConstraints.push(where('region', 'in', [regionName, DEFAULT_REGION]));
    } else {
        // Si no hay región o es la de por defecto, solo muestra las de por defecto
        queryConstraints.push(where('region', '==', DEFAULT_REGION));
    }

    const q = query(guidesCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guide));
};

/**
 * Obtiene las guías para el panel de administración, con filtros opcionales.
 * @param filters Un objeto opcional con filtros, ej. { region: 'Ontario' }.
 */
export const getGuidesForAdmin = async (filters?: { region?: string }): Promise<Guide[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    
    const guidesCollection = collection(db, 'guides');
    const queryConstraints: any[] = [orderBy('createdAt', 'desc')];

    // Si se provee un filtro de región, se añade a la consulta.
    if (filters?.region) {
        queryConstraints.push(where('region', '==', filters.region));
    }

    const q = query(guidesCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guide));
};

/**
 * Actualiza una guía existente en Firestore.
 */
export const updateGuide = async (id: string, data: Partial<Omit<Guide, 'id'>>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const guideDocRef = doc(db, 'guides', id);
    await updateDoc(guideDocRef, data);
};

/**
 * Elimina una guía (documento de Firestore y archivo de Storage).
 */
export const deleteGuide = async (guide: Guide): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");

    const storage = getStorage();
    const fileRef = ref(storage, guide.downloadUrl);
    try {
        await deleteObject(fileRef);
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            throw error;
        }
        console.warn(`Archivo no encontrado en Storage: ${guide.downloadUrl}. Se borrará solo el documento.`);
    }

    const guideDocRef = doc(db, 'guides', guide.id);
    await deleteDoc(guideDocRef);
};
