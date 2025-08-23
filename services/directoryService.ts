// /home/alexis/Sites/Landings/conexion-ec-ca/src/services/directoryService.ts
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';import { CommunityServiceItem, ServiceStatus } from '../types'; // <-- Importar 'ServiceStatus'

// Este tipo representa los datos que enviamos para crear un nuevo servicio.
// Omitimos 'id' (lo genera Firestore) y 'createdAt' (lo genera el servidor de Firestore).
type NewServiceData = Omit<CommunityServiceItem, 'id' | 'createdAt' | 'status'>;

/**
 * Obtiene solo los servicios APROBADOS para el directorio público.
 */
export const getServices = async (): Promise<CommunityServiceItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const servicesCollection = collection(db, 'services');
        // MODIFICACIÓN: Añadimos el filtro 'where' para traer solo los aprobados.
        const q = query(
            servicesCollection,
            where('status', '==', ServiceStatus.APROBADO), // <-- ¡LA CLAVE!
            orderBy('createdAt', 'desc')
        );
        // --- INICIO DE LA CORRECCIÓN ---
        // --- INICIO DE LA CORRECCIÓN ---
        // ¡ESTA ES LA LÍNEA QUE FALTABA! Ejecutamos la consulta.
        const querySnapshot = await getDocs(q);
        // --- FIN DE LA CORRECCIÓN ---

        const services: CommunityServiceItem[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as CommunityServiceItem);
        });
        return services; // <-- ¡CLAVE! Devolver el array de servicios.
        // --- FIN DE LA CORRECCIÓN ---

    } catch (error) {
        // --- INICIO DE LA CORRECCIÓN ---
        console.error("Error al obtener los servicios públicos: ", error);
        return []; // Devuelve un array vacío en caso de error para evitar que la UI se rompa.
        // --- FIN DE LA CORRECCIÓN ---
    }
};

/**
 * Agrega un nuevo servicio con estado PENDIENTE por defecto.
 */
export const addService = async (serviceData: NewServiceData): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const servicesCollection = collection(db, 'services');
        await addDoc(servicesCollection, {
            ...serviceData,
            status: ServiceStatus.PENDIENTE, // <-- ¡LA CLAVE!
            createdAt: serverTimestamp()
        });
        console.log("Servicio agregado con éxito, pendiente de aprobación.");
    } catch (error) {
        // --- INICIO DE LA CORRECCIÓN ---
        console.error("Error al agregar el servicio: ", error);
        // Re-lanzamos el error para que el componente que llama (AddServiceForm) pueda manejarlo.
        throw error;
        // --- FIN DE LA CORRECCIÓN ---
    }
};

/**
 * Obtiene TODOS los servicios de un usuario específico, sin importar su estado.
 * @param userId - El UID del usuario.
 * @returns Una promesa que se resuelve con un array de sus CommunityServiceItem.
 */
export const getUserServices = async (userId: string): Promise<CommunityServiceItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const servicesCollection = collection(db, 'services');
        const q = query(
            servicesCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const services: CommunityServiceItem[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as CommunityServiceItem);
        });
        return services;
    } catch (error) {
        console.error("Error al obtener los servicios del usuario: ", error);
        return [];
    }
};

/**
 * Elimina un servicio de Firestore.
 */
export const deleteService = async (serviceId: string): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const serviceDocRef = doc(db, 'services', serviceId);
        await deleteDoc(serviceDocRef);
        console.log("Servicio eliminado con éxito.");
    } catch (error) {
        console.error("Error al eliminar el servicio: ", error);
        throw error;
    }
};

/**
 * Actualiza un servicio en Firestore.
 */
export const updateService = async (serviceId: string, data: Partial<CommunityServiceItem>): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const serviceDocRef = doc(db, 'services', serviceId);
        await updateDoc(serviceDocRef, {
            ...data,
            status: ServiceStatus.PENDIENTE
        });
        console.log("Servicio actualizado, pendiente de re-aprobación.");
    } catch (error) {
        console.error("Error al actualizar el servicio: ", error);
        throw error;
    }
};

/**
 * Obtiene todos los servicios para el panel de administración, con filtros opcionales.
 */
export const getAllServicesForAdmin = async (filters?: { province?: string }): Promise<CommunityServiceItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const servicesCollection = collection(db, 'services');
        const queryConstraints = [orderBy('createdAt', 'asc')];

        if (filters?.province) {
            queryConstraints.push(where('province', '==', filters.province));
        }

        const q = query(servicesCollection, ...queryConstraints);
        const querySnapshot = await getDocs(q);

        const services: CommunityServiceItem[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as CommunityServiceItem);
        });
        return services;
    } catch (error) {
        console.error("Error al obtener los servicios para admin: ", error);
        return [];
    }
};

/**
 * Actualiza el estado de un servicio (ej. para aprobar o rechazar).
 */
export const updateServiceStatus = async (serviceId: string, status: ServiceStatus): Promise<void> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const serviceDocRef = doc(db, 'services', serviceId);
        await updateDoc(serviceDocRef, { status });
        console.log(`Estado del servicio ${serviceId} actualizado a ${status}.`);
    } catch (error) {
        console.error("Error al actualizar el estado del servicio: ", error);
        throw error;
    }
};

/**
 * Obtiene los últimos servicios APROBADOS de una ciudad específica.
 * @param city - La ciudad para filtrar los servicios.
 * @param limit - El número máximo de servicios a obtener.
 * @returns Una promesa que se resuelve con un array de CommunityServiceItem.
 */
export const getServicesByCity = async (city: string, limitNum: number): Promise<CommunityServiceItem[]> => {
    if (!db) throw new Error("Firestore no está inicializado.");
    try {
        const servicesCollection = collection(db, 'services');
        const q = query(
            servicesCollection,
            where('status', '==', ServiceStatus.APROBADO),
            where('city', '==', city),
            orderBy('createdAt', 'desc'),
        );
        const querySnapshot = await getDocs(q);

        const services: CommunityServiceItem[] = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as CommunityServiceItem);
        });
        return services;
    } catch (error) {
        console.error(`Error al obtener los servicios de ${city}: `, error);
        return [];
    }
};