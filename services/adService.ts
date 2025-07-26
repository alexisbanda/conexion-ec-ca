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
import { AdSlotItem } from '../types';

const ADS_COLLECTION = 'ads_slots';
const adsCollectionRef = collection(db, ADS_COLLECTION);

export const uploadAdImage = async (file: File): Promise<string> => {
  const filePath = `ads/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const createAd = async (
  adData: Omit<AdSlotItem, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(adsCollectionRef, {
    ...adData,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getAds = async (): Promise<AdSlotItem[]> => {
  const q = query(adsCollectionRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AdSlotItem)
  );
};

export const updateAd = async (
  id: string,
  updates: Partial<Omit<AdSlotItem, 'id'>>
): Promise<void> => {
  const adDocRef = doc(db, ADS_COLLECTION, id);
  await updateDoc(adDocRef, updates);
};

export const deleteAd = async (id: string, imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code !== 'storage/object-not-found') {
      console.error('Error al eliminar la imagen de Storage:', error);
    }
  }

  const adDocRef = doc(db, ADS_COLLECTION, id);
  await deleteDoc(adDocRef);
};

export const getActiveAds = async (location?: string): Promise<AdSlotItem[]> => {
  const now = Timestamp.now();

  const queryConstraints = [
    where('isActive', '==', true),
    orderBy('priority', 'asc'),
  ];

  // Si se especifica una ubicación (slot), la añadimos al filtro.
  if (location) {
    queryConstraints.push(where('location', '==', location));
  }

  const q = query(adsCollectionRef, ...queryConstraints);

  const querySnapshot = await getDocs(q);
  const allActiveAds = querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as AdSlotItem)
  );

  // Filtra por fecha, pero ya no por provincia. El componente se encargará de eso.
  return allActiveAds.filter(ad => 
    (!ad.startDate || ad.startDate <= now) && (!ad.endDate || ad.endDate >= now)
  );
};