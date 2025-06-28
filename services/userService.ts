// /home/alexis/Sites/Landings/conexion-ec-ca/services/userService.ts
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User } from '../types';

/**
 * Obtiene los datos adicionales de un usuario desde la colección 'users'.
 * @param uid - El UID del usuario.
 * @returns El rol del usuario u otros datos, o null si no existe.
 */
export const getUserData = async (uid: string): Promise<Pick<User, 'role'> | null> => {
    if (!db) return null;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return userDoc.data() as Pick<User, 'role'>;
    }
    return null;
};

/**
 * Obtiene todos los usuarios para el panel de administración.
 * (Esta la usaremos más adelante)
 */
export const getAllUsers = async (): Promise<User[]> => {
    if (!db) return [];
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const userList: User[] = [];
    usersSnapshot.forEach(doc => {
        // Nota: Esto solo trae datos de Firestore, no de Auth.
        // Para un panel completo, se necesitaría combinar información.
        userList.push({ id: doc.id, ...doc.data() } as User);
    });
    return userList;
};