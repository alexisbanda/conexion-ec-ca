import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { AdSlotItem } from '../../types'; // ¡Importante! Asegúrate de que este tipo refleje el nuevo modelo con `adData` anidado.
import { createAd, updateAd, uploadAdImage } from '../../services/adService';

// --- Icono de Spinner (local para simplicidad) ---
const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 109 9" />
  </svg>
);

interface AdFormProps {
  ad?: AdSlotItem | null; // Anuncio para editar, o null para crear uno nuevo
  onSave: () => void;     // Callback para refrescar la lista después de guardar
  onCancel: () => void;    // Callback para cerrar el formulario
}

export const AdForm: React.FC<AdFormProps> = ({ ad, onSave, onCancel }) => {
  // Estados para el objeto anidado `adData`
  const [targetUrl, setTargetUrl] = useState('');
  const [sponsorName, setSponsorName] = useState('');

  // Estados para el documento raíz `ad_slot`
  const [location, setLocation] = useState('benefits_section');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [priority, setPriority] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ad) {
      // Rellenar desde el objeto anidado adData
      setTargetUrl(ad.adData.targetUrl);
      setSponsorName(ad.adData.sponsorName || '');
      setImagePreview(ad.adData.imageUrl);

      // Rellenar campos del nivel raíz
      setLocation(ad.location);
      setIsActive(ad.isActive);
      setPriority(ad.priority);
      // Convierte Timestamps de Firestore a string 'yyyy-MM-dd' para los inputs de fecha
      setStartDate(ad.startDate ? ad.startDate.toDate().toISOString().split('T')[0] : '');
      setEndDate(ad.endDate ? ad.endDate.toDate().toISOString().split('T')[0] : '');
    } else {
      // Resetea el formulario para un nuevo anuncio
      setTargetUrl('');
      setSponsorName('');
      setLocation('benefits_section');
      setIsActive(true);
      setPriority(1);
      setImageFile(null);
      setImagePreview(null);
      setStartDate('');
      setEndDate('');
    }
  }, [ad]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!imageFile && !ad) {
      setError('La imagen del anuncio es obligatoria para crear un nuevo anuncio.');
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = ad?.adData.imageUrl || '';

      if (imageFile) {
        // Si hay una nueva imagen, la subimos
        imageUrl = await uploadAdImage(imageFile);
      }

      // Construye el nuevo objeto `ad_slot` con la estructura anidada
      const adSlotData = {
        location,
        isActive,
        priority,
        adData: {
          targetUrl,
          sponsorName,
          imageUrl,
        },
        // Convierte strings de fecha a Timestamps de Firestore, o null si están vacíos
        startDate: startDate ? Timestamp.fromDate(new Date(startDate)) : null,
        endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : null,
      };

      if (ad) {
        await updateAd(ad.id, adSlotData);
      } else {
        // Aseguramos el tipado correcto para la creación
        await createAd(adSlotData as Omit<AdSlotItem, 'id' | 'createdAt'>);
      }

      onSave(); // Llama al callback para refrescar y cerrar
    } catch (err) {
      console.error('Error al guardar el anuncio:', err);
      setError('Hubo un error al guardar el anuncio. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Imagen del Anuncio</label>
          <div className="mt-2 flex items-center space-x-4">
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-contain rounded-md border bg-white p-1" />}
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ecuador-yellow-light file:text-ecuador-blue hover:file:bg-ecuador-yellow cursor-pointer"/>
          </div>
        </div>

        <div>
          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">URL de Destino</label>
          <input type="url" id="targetUrl" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required placeholder="https://ejemplo.com/producto" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"/>
        </div>

        <div>
          <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-700">Nombre del Patrocinador (Opcional)</label>
          <input type="text" id="sponsorName" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Ej: Mi Empresa Inc." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación del Espacio</label>
            <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
              <option value="benefits_section">Sección de Beneficios</option>
              <option value="event_detail">Detalle de Evento</option>
              <option value="dashboard_services">Dashboard (Servicios)</option>
              <option value="directory_sidebar">Directorio (Barra Lateral)</option>
              <option value="sticky_banner_left">Banner Fijo (Izquierda)</option>
              <option value="sticky_banner_right">Banner Fijo (Derecha)</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridad</label>
            <input type="number" id="priority" value={priority} onChange={(e) => setPriority(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"/>
            <p className="text-xs text-gray-500 mt-1">Menor número = mayor prioridad.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de Inicio (Opcional)</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de Fin (Opcional)</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"/>
          </div>
        </div>

        <div className="flex items-center pt-2">
          <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 rounded text-ecuador-blue focus:ring-ecuador-blue border-gray-300"/>
          <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700">Anuncio Activado</label>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

        <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
          <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-blue hover:bg-blue-700 focus:outline-none disabled:opacity-50 flex items-center">
            {isLoading && <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
            {isLoading ? 'Guardando...' : 'Guardar Anuncio'}
          </button>
        </div>
      </form>
  );
};