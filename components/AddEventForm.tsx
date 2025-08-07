import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { createEvent } from '../services/eventService';
import { EventItem, ServiceCategory } from '../types';
import { PaperAirplaneIcon } from './icons';
import { cityData } from '../constants';
import { storage } from '../firebaseConfig';

// Opciones para el selector de categorías de eventos
const EVENT_CATEGORIES = Object.values(ServiceCategory);

interface AddEventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<EventItem> | null;
}

export const AddEventForm: React.FC<AddEventFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const auth = useContext(AuthContext);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? initialData.date.toDate().toISOString().split('T')[0] : '',
    imageUrl: initialData?.imageUrl || '',
    province: initialData?.province || '',
    city: initialData?.city || '',
    category: initialData?.category || EVENT_CATEGORIES[0],
    referenceUrl: initialData?.referenceUrl || '',
    isPremium: initialData?.isPremium || false,
    published: initialData?.published || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth?.user) return;

    const storageRef = ref(storage, `events/${auth.user.id}_${Date.now()}_${file.name}`);
    const toastId = toast.loading('Subiendo imagen...');

    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
        toast.success('Imagen subida con éxito.', { id: toastId });
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        toast.error('Error al subir la imagen.', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth?.user) {
        toast.error('Debes iniciar sesión para crear un evento.');
        return;
    }
    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        date: Timestamp.fromDate(new Date(formData.date)),
        userId: auth.user.id,
      };
      
      await createEvent(eventData);

      toast.success('¡Evento creado con éxito!');
      onSuccess();
    } catch (error) {
      toast.error('Hubo un error al crear el evento. Inténtalo de nuevo.');
      console.error('Event creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "peer w-full bg-gray-100 border-b-2 border-gray-300 text-gray-800 placeholder-transparent focus:outline-none focus:border-ecuador-blue transition-colors p-2 rounded-t-md";
  const labelStyle = "absolute left-2 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-ecuador-blue peer-focus:text-sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat border-b pb-3">
          {isEditing ? 'Editar Evento' : 'Publicar un Nuevo Evento'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={inputStyle} placeholder="Título del Evento" />
                <label htmlFor="title" className={labelStyle}>Título del Evento</label>
            </div>
            <div className="relative">
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className={inputStyle} placeholder="Fecha del Evento" />
                <label htmlFor="date" className={labelStyle}>Fecha del Evento</label>
            </div>
        </div>

        <div className="relative">
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className={inputStyle} placeholder="Descripción"></textarea>
            <label htmlFor="description" className={labelStyle}>Descripción</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
                <select id="province" name="province" value={formData.province} onChange={handleChange} required className={inputStyle}>
                    <option value="">Selecciona una provincia</option>
                    {cityData.map(p => <option key={p.provincia} value={p.provincia}>{p.provincia}</option>)}
                </select>
                <label htmlFor="province" className={labelStyle}>Provincia</label>
            </div>
            <div className="relative">
                <select id="city" name="city" value={formData.city} onChange={handleChange} required className={inputStyle} disabled={!formData.province}>
                    <option value="">Selecciona una ciudad</option>
                    {formData.province && cityData.find(p => p.provincia === formData.province)?.ciudades.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label htmlFor="city" className={labelStyle}>Ciudad</label>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
                <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputStyle}>
                    {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <label htmlFor="category" className={labelStyle}>Categoría</label>
            </div>
            <div className="relative">
                <input type="url" id="referenceUrl" name="referenceUrl" value={formData.referenceUrl} onChange={handleChange} className={inputStyle} placeholder="URL de Referencia" />
                <label htmlFor="referenceUrl" className={labelStyle}>URL de Referencia (Ej: link de registro)</label>
            </div>
        </div>

        <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Imagen del Evento (Opcional)</label>
            <input type="file" id="imageUpload" onChange={handleImageUpload} className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:font-semibold file:bg-ecuador-yellow-light file:text-ecuador-blue hover:file:bg-yellow-200" />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Vista previa" className="mt-2 h-20 w-auto rounded-md" />}
        </div>

        <div className="flex items-center space-x-8">
            <label htmlFor="isPremium" className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="isPremium" name="isPremium" checked={formData.isPremium} onChange={handleChange} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-blue border-gray-300 rounded" />
                <span className="text-gray-700">¿Es un evento Premium?</span>
            </label>
            <label htmlFor="published" className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="published" name="published" checked={formData.published} onChange={handleChange} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-blue border-gray-300 rounded" />
                <span className="text-gray-700">¿Publicar inmediatamente?</span>
            </label>
        </div>

        <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md text-sm transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50">
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Evento')}
            </button>
        </div>
      </form>
    </motion.div>
  );
};

