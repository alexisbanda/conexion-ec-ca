// /home/alexis/Sites/Landings/conexion-ec-ca/services/userService.ts
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { User, RegistrationData, UserStatus } from '../types';

/**
 * Crea un nuevo documento de usuario en Firestore con los datos del registro inicial.
 * @param uid El ID del usuario de Firebase Auth.
 * @param data Los datos completos del formulario de registro.
 */
export const createUserDocument = async (uid: string, data: RegistrationData): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");

    // Excluimos la contraseña para no guardarla en la base de datos.
    const { password, ...userData } = data;

    const userDocRef = doc(db, 'users', uid);
    try {
        // Preparamos los datos para guardar, incluyendo todos los campos del registro.
        const dataToSave: Partial<User> = {
            id: uid,
            name: userData.name,
            email: userData.email,
            city: userData.city || '',
            immigrationStatus: userData.immigrationStatus || '',
            supportNeeded: userData.supportNeeded || [],
            message: userData.message || '',
            newsletterSubscription: userData.newsletterSubscription ?? false,
            role: 'member',
            status: UserStatus.PENDIENTE,
            onboardingCompleted: false, // El onboarding aún no se ha completado.
            createdAt: serverTimestamp(),
        };

        // Convertimos la fecha de llegada a Timestamp de Firestore si el usuario la proporcionó.
        if (userData.arrivalDateCanada) {
            dataToSave.arrivalDateCanada = Timestamp.fromDate(new Date(userData.arrivalDateCanada));
        }

        await setDoc(userDocRef, dataToSave);
        console.log(`Documento de usuario creado para ${uid}`);

    } catch (error) {
        console.error("Error al crear el documento del usuario: ", error);
        throw error;
    }
};

/**
 * Actualiza el perfil de un usuario con los datos del wizard de onboarding.
 * @param uid El ID del usuario.
 * @param data Los datos recopilados del wizard.
 */
export const updateOnboardingData = async (uid: string, data: Partial<User>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', uid);
    try {
        const dataToUpdate = { ...data };

        // Convertimos la fecha de nacimiento a Timestamp si existe.
        if (dataToUpdate.birthDate) {
            dataToUpdate.birthDate = Timestamp.fromDate(new Date(dataToUpdate.birthDate as any));
        }

        await updateDoc(userDocRef, {
            ...dataToUpdate,
            onboardingCompleted: true, // Marcamos el wizard como completado.
        });
        console.log(`Datos de onboarding del usuario ${uid} actualizados.`);
    } catch (error) {
        console.error("Error al actualizar los datos de onboarding: ", error);
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
    const q = query(usersCollection, where("status", "==", UserStatus.PENDIENTE));
    const usersSnapshot = await getDocs(q);
    const userList: User[] = [];
    usersSnapshot.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as User);
    });
    return userList;
};

/**
 * Actualiza el estado de un usuario (Aprobado, Rechazado).
 */
export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { status });
    console.log(`Estado del usuario ${userId} actualizado a ${status}.`);
};

/**
 * Actualiza los datos de un perfil de usuario desde el modal de perfil.
 * Solo permite modificar un subconjunto de campos.
 */
export const updateUserProfile = async (uid: string, data: Partial<Pick<User, 'city' | 'message' | 'immigrationStatus' | 'supportNeeded' | 'arrivalDateCanada'>>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', uid);
    try {
        const updatableData: { [key: string]: any } = {};

        if (data.city !== undefined) updatableData.city = data.city;
        if (data.message !== undefined) updatableData.message = data.message;
        if (data.immigrationStatus !== undefined) updatableData.immigrationStatus = data.immigrationStatus;
        if (data.supportNeeded !== undefined) updatableData.supportNeeded = data.supportNeeded;

        // Manejo especial para la fecha
        if (data.arrivalDateCanada !== undefined) {
            // El formulario envía un objeto Date, lo convertimos a Timestamp
            updatableData.arrivalDateCanada = Timestamp.fromDate(new Date(data.arrivalDateCanada as any));
        }

        if (Object.keys(updatableData).length > 0) {
            await updateDoc(userDocRef, updatableData);
            console.log(`Perfil del usuario ${uid} actualizado.`);
        }
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario: ", error);
        throw error;
    }
};

/**
 * Actualiza las suscripciones de servicio de un usuario.
 * @param uid El ID del usuario.
 * @param subscriptions Un array con las categorías de servicio a las que el usuario está suscrito.
 */
export const updateUserSubscriptions = async (uid: string, subscriptions: ServiceCategory[]): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, {
            subscribedServiceCategories: subscriptions
        });
        console.log(`Suscripciones del usuario ${uid} actualizadas.`);
    } catch (error) {
        console.error("Error al actualizar las suscripciones del usuario: ", error);
        throw error;
    }
};