// /home/alexis/Sites/Landings/conexion-ec-ca/services/userService.ts
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { User, RegistrationData, UserStatus } from '../types'; // <-- Importar UserStatus

/**
 * Crea un nuevo documento de usuario en Firestore con datos adicionales.
 */
export const createUserDocument = async (uid: string, data: RegistrationData): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");

    const { password, ...userData } = data;

    const userDocRef = doc(db, 'users', uid);
    try {
        await setDoc(userDocRef, {
            ...userData,
            role: 'member',
            status: UserStatus.PENDIENTE, // <-- Usar enum
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error al crear el documento del usuario: ", error);
        throw error;
    }
};

/**
 * Obtiene los datos adicionales de un usuario desde la colección 'users'.
 */
export const getUserData = async (uid: string): Promise<User | null> => {
    if (!db) return null;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
};

/**
 * Obtiene todos los usuarios para el panel de administración.
 */
export const getAllUsers = async (): Promise<User[]> => {
    if (!db) return [];
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const userList: User[] = [];
    usersSnapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as User);
    });
    return userList;
};

/**
 * Obtiene todos los usuarios pendientes de aprobación.
 */
export const getPendingUsers = async (): Promise<User[]> => {
    if (!db) return [];
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("status", "==", UserStatus.PENDIENTE)); // <-- Usar enum
    const usersSnapshot = await getDocs(q);
    const userList: User[] = [];
    usersSnapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as User);
    });
    return userList;
};

/**
 * Actualiza el estado de un usuario.
 */
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => { // <-- Usar enum
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { status });
    console.log(`Estado del usuario ${userId} actualizado a ${status}.`);
};

/**
 * Actualiza los datos de un perfil de usuario en Firestore.
 * El usuario solo puede modificar los campos permitidos.
 * @param uid - El ID del usuario a actualizar.
 * @param data - Un objeto con los campos a actualizar (ej. { city: 'Nueva Ciudad', message: 'Nuevo mensaje' }).
 */
export const updateUserProfile = async (uid:string, data: Partial<Pick<User, 'city' | 'message' | 'immigrationStatus' | 'supportNeeded'>>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', uid);
    try {
        // Creamos un objeto con solo los campos que el usuario puede actualizar para evitar que modifiquen su rol o estado.
        const updatableData: { [key: string]: any } = {};

        if (data.city !== undefined) updatableData.city = data.city;
        if (data.message !== undefined) updatableData.message = data.message;
        if (data.immigrationStatus !== undefined) updatableData.immigrationStatus = data.immigrationStatus;
        if (data.supportNeeded !== undefined) updatableData.supportNeeded = data.supportNeeded;
        if (data.arrivalDateCanada !== undefined) updatableData.arrivalDateCanada = data.arrivalDateCanada;
        if (Object.keys(updatableData).length > 0) {
            await updateDoc(userDocRef, updatableData);
            console.log(`Perfil del usuario ${uid} actualizado.`);
        }
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario: ", error);
        throw error;
    }
};