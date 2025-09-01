// components/admin/AddGuideForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes, getStorage, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext';
import { createGuide, updateGuide } from '../../services/guideService';
import { storage } from '../../firebaseConfig';
import { Guide, GuideStage, User } from '../../types';
import { PaperAirplaneIcon } from '../icons';
import { cityData } from '../../constants'; // <-- IMPORTAMOS LA DATA DE CIUDADES Y PROVINCIAS

interface AddGuideFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Guide | null;
  user: User | null; // Recibe el usuario para verificar su rol
}

const BLANK_FORM = {
  title: '',
  description: '',
  region: 'Canadá', // <-- Usamos el nombre completo por defecto
  stage: 'Recién Llegado' as GuideStage,
  isPremium: false,
};

export const AddGuideForm: React.FC<AddGuideFormProps> = ({ onSuccess, onCancel, initialData, user }) => {
  const isEditing = !!initialData;
  const isRegionalAdmin = user?.role === 'regional_admin';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [notifyMembers, setNotifyMembers] = useState(true);

  useEffect(() => {
    const getInitialFormState = () => {
      if (isEditing) {
        return {
          title: initialData.title,
          description: initialData.description,
          region: initialData.region,
          stage: initialData.stage,
          isPremium: initialData.isPremium,
        };
      }
      if (isRegionalAdmin && user.managedProvince) {
        return { ...BLANK_FORM, region: user.managedProvince };
      }
      return BLANK_FORM;
    };

    setFormData(getInitialFormState());
  }, [initialData, isEditing, isRegionalAdmin, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Debes ser admin para esta acción.');
    if (!file && !isEditing) return toast.error('Por favor, selecciona un archivo PDF para crear una guía.');

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? 'Actualizando guía...' : 'Creando guía...');

    try {
      let fileUrl = isEditing ? initialData.downloadUrl : '';

      if (file) {
        if (isEditing && initialData.downloadUrl) {
          try {
            const oldFileRef = ref(getStorage(), initialData.downloadUrl);
            await deleteObject(oldFileRef);
          } catch (error: any) {
            if (error.code !== 'storage/object-not-found') throw error;
          }
        }
        
        const newStorageRef = ref(storage, `guides/${formData.region}/${file.name}`);
        await uploadBytes(newStorageRef, file);
        fileUrl = await getDownloadURL(newStorageRef);
      }

      const guideData = {
        ...formData,
        downloadUrl: fileUrl,
      };

      if (isEditing) {
        await updateGuide(initialData.id, guideData);
      } else {
        await createGuide(guideData as Omit<Guide, 'id' | 'createdAt'>);
      }

      // Si la casilla está marcada, enviar la notificación.
      if (notifyMembers) {
        toast.loading('Enviando notificación a los socios...', { id: 'notifyToast' });
        try {
          const response = await fetch('/.netlify/functions/send-guide-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guideTitle: guideData.title,
              description: guideData.description,
              region: guideData.region,
              downloadUrl: guideData.downloadUrl,
            }),
          });
          if (!response.ok) throw new Error('El servidor de notificaciones respondió con un error.');
          toast.success('¡Notificación enviada!', { id: 'notifyToast' });
        } catch (notificationError) {
          console.error("Error al enviar notificación:", notificationError);
          toast.error('La guía se guardó, pero falló el envío de la notificación.', { id: 'notifyToast' });
        }
      }

      toast.success(isEditing ? '¡Guía actualizada!' : '¡Guía creada!', { id: toastId });
      onSuccess();
    } catch (error) {
      console.error("Error en la operación de guía:", error);
      toast.error('Hubo un error. Revisa los permisos.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "peer w-full bg-gray-100 border-b-2 border-gray-300 text-gray-800 placeholder-transparent focus:outline-none focus:border-ecuador-blue transition-colors p-2 rounded-t-md disabled:bg-gray-200 disabled:cursor-not-allowed";
  const labelStyle = "absolute left-2 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-ecuador-blue peer-focus:text-sm";

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat border-b pb-3">
        {isEditing ? `Editando Guía: ${initialData.title}` : 'Publicar una Nueva Guía'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={inputStyle} placeholder="Título de la Guía" />
          <label htmlFor="title" className={labelStyle}>Título de la Guía</label>
        </div>

        <div className="relative">
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={3} className={inputStyle} placeholder="Descripción"></textarea>
          <label htmlFor="description" className={labelStyle}>Descripción</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <select id="region" name="region" value={formData.region} onChange={handleChange} required className={inputStyle} disabled={isRegionalAdmin}>
              {/* Si es admin regional, su provincia se carga desde el useEffect */}
              {isRegionalAdmin ? (
                <option value={user.managedProvince}>{user.managedProvince}</option>
              ) : (
                // Si es admin general, mapeamos desde la constante
                <>
                  <option value="Canadá">Canadá (Default)</option>
                  {cityData.map(prov => (
                    <option key={prov.provincia} value={prov.provincia}>{prov.provincia}</option>
                  ))}
                </>
              )}
            </select>
            <label htmlFor="region" className={labelStyle}>Región</label>
          </div>
          <div className="relative">
            <select id="stage" name="stage" value={formData.stage} onChange={handleChange} required className={inputStyle}>
              <option value="Recién Llegado">Recién Llegado</option>
              <option value="Estableciéndose">Estableciéndose</option>
              <option value="Residente Establecido">Residente Establecido</option>
            </select>
            <label htmlFor="stage" className={labelStyle}>Etapa</label>
          </div>
        </div>

        <div>
          <label htmlFor="guideUpload" className="block text-sm font-medium text-gray-700 mb-1">
            {isEditing ? 'Reemplazar Archivo (Opcional)' : 'Archivo de la Guía (PDF)'}
          </label>
          <input type="file" id="guideUpload" onChange={handleFileChange} accept=".pdf" required={!isEditing} className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:font-semibold file:bg-ecuador-yellow-light file:text-ecuador-blue hover:file:bg-yellow-200" />
        </div>

        <div className="flex items-center space-x-8">
          <label htmlFor="isPremium" className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" id="isPremium" name="isPremium" checked={formData.isPremium} onChange={handleChange} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-blue border-gray-300 rounded" />
            <span className="text-gray-700">¿Es una guía Premium?</span>
          </label>

          <label htmlFor="notifyMembers" className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" id="notifyMembers" name="notifyMembers" checked={notifyMembers} onChange={(e) => setNotifyMembers(e.target.checked)} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-blue border-gray-300 rounded" />
            <span className="text-gray-700">Notificar a los socios</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
            {isEditing ? 'Cancelar Edición' : 'Cancelar'}
          </button>
          <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md text-sm transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50">
            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
            {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Guía')}
          </button>
        </div>
      </form>
    </div>
  );
};