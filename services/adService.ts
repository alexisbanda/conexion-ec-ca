import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { AdSlotItem } from '../types'; // ¡Importante! Asegúrate de que la definición de este tipo refleje el nuevo modelo de datos con el objeto anidado `adData`.

// Ejemplo de cómo debería verse el tipo AdSlotItem actualizado en `types.ts`:
// adData: { imageUrl: string; targetUrl: string; sponsorName?: string; };
// location: string; ... y los otros campos como isActive, priority, etc.

const ADS_COLLECTION = 'ads_slots';
const adsCollectionRef = collection(db, ADS_COLLECTION);

/**
 * Sube una imagen de anuncio a Firebase Storage.
 * @param file El archivo de imagen a subir.
 * @returns La URL pública de la imagen subida.
 */
export const uploadAdImage = async (file: File): Promise<string> => {
  const filePath = `ads/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/**
 * Crea un nuevo anuncio en la colección 'ads_slots'.
 * @param adData Los datos del anuncio a crear.
 * @returns El ID del documento recién creado.
 */
export const createAd = async (
  adData: Omit<AdSlotItem, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(adsCollectionRef, {
    ...adData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * Obtiene todos los anuncios de la base de datos, ordenados por fecha de creación.
 * @returns Un array de objetos AdSlotItem.
 */
export const getAds = async (): Promise<AdSlotItem[]> => {
  const q = query(adsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AdSlotItem)
  );
};

/**
 * Actualiza un anuncio existente en Firestore.
 * @param id El ID del anuncio a actualizar.
 * @param updates Un objeto con los campos a actualizar.
 */
export const updateAd = async (
  id: string,
  updates: Partial<Omit<AdSlotItem, 'id'>>
): Promise<void> => {
  const adDocRef = doc(db, ADS_COLLECTION, id);
  await updateDoc(adDocRef, updates);
};

/**
 * Elimina un anuncio de Firestore y su imagen de Storage.
 * @param id El ID del anuncio a eliminar.
 * @param imageUrl La URL de la imagen para borrarla de Storage.
 */
export const deleteAd = async (id: string, imageUrl: string): Promise<void> => {
  // Eliminar la imagen de Storage
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    // Si la imagen no existe o la URL es inválida, no detener la operación.
    // Solo registrar el error.
    if (error.code !== 'storage/object-not-found') {
      console.error('Error al eliminar la imagen de Storage:', error);
    }
  }

  // Eliminar el documento de Firestore
  const adDocRef = doc(db, ADS_COLLECTION, id);
  await deleteDoc(adDocRef);
};

/**
 * Obtiene solo los anuncios activos y vigentes para mostrar en el frontend.
 * Puede filtrar por una ubicación específica para mayor eficiencia.
 * @returns Un array de objetos AdSlotItem activos y ordenados por prioridad.
 * @param location - (Opcional) El identificador de la ubicación para filtrar los anuncios (ej. 'benefits_section').
 */
export const getActiveAds = async (location?: string): Promise<AdSlotItem[]> => {
  const now = Timestamp.now();

  // Construimos la consulta dinámicamente
  const queryConstraints = [
    where('isActive', '==', true),
    orderBy('priority', 'asc') // Menor número = mayor prioridad
  ];

  if (location) {
    queryConstraints.push(where('location', '==', location));
  }

  const q = query(
    adsCollectionRef,
    ...queryConstraints
  );

  const querySnapshot = await getDocs(q);
  const allActiveAds = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AdSlotItem)
  );

  // Filtrar por rango de fechas en el cliente, ya que Firestore tiene limitaciones
  // para consultas complejas con rangos y desigualdades en campos distintos.
  return allActiveAds.filter(ad => 
    (!ad.startDate || ad.startDate <= now) && (!ad.endDate || ad.endDate >= now)
  );
};