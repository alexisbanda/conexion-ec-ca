// /home/alexis/Sites/Landings/conexion-ec-ca/components/AddServiceForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { AuthContext } from '../contexts/AuthContext';
import { addService, updateService } from '../services/directoryService';
import { cityData } from '../constants';
import { CommunityServiceItem, ServiceType, ServiceCategory } from '../types';
import { storage } from '../firebaseConfig'; // Importa la configuración de Firebase Storage

interface AddServiceFormProps {
    onSuccess: () => void; // Callback para cuando el formulario se envía correctamente
    onCancel: () => void;
    initialData?: CommunityServiceItem | null;
}

// Opciones para el selector de categorías
const SERVICE_CATEGORIES = Object.values(ServiceCategory);

export const AddServiceForm: React.FC<AddServiceFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const auth = useContext(AuthContext);
    const isEditing = !!initialData;

    // Estado unificado para todos los campos del formulario
    const [formData, setFormData] = useState({
        serviceName: '',
        type: ServiceType.OFERTA,
        province: '',
        city: '',
        shortDescription: '',
        imageUrl: '', // Nueva propiedad para la URL de la imagen
        cost: 0, // Nueva propiedad para el costo del servicio
        category: SERVICE_CATEGORIES[0],
        whatsapp: '',
        instagram: '',
        website: '',
        websiteText: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                serviceName: initialData.serviceName || '',
                type: initialData.type || ServiceType.OFERTA,
                province: initialData.province || '',
                city: initialData.city || '',
                shortDescription: initialData.shortDescription || '',
                imageUrl: initialData.imageUrl || '', // Establecer la URL de la imagen si existe
                cost: initialData.cost || 0, // Establecer el costo si existe
                category: initialData.category || SERVICE_CATEGORIES[0],
                whatsapp: initialData.whatsapp || '',
                instagram: initialData.instagram || '',
                website: initialData.website || '',
                websiteText: initialData.websiteText || '',
            });
        }
    }, [initialData]);

    if (!auth?.user) {
        return <p className="text-red-500 p-4">Debes estar autenticado para gestionar servicios.</p>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.serviceName || !formData.city || !formData.shortDescription || !formData.category) {
            setError('El nombre, la descripción y la ciudad son obligatorios.');
            return;
        }
        setIsSubmitting(true);

        const serviceData = {
            ...formData,
            contact: auth.user!.email!,
            contactName: auth.user!.name || auth.user!.email!,
            userId: auth.user!.id,
        };

        try {
            if (isEditing) {
                await toast.promise(updateService(initialData!.id, serviceData), {
                    loading: 'Guardando cambios...',
                    success: '¡Servicio actualizado con éxito!',
                    error: 'No se pudo actualizar el servicio.',
                });
            } else {
                const newServiceId = await addService(serviceData);
                toast.success('¡Servicio agregado! Pasará a revisión.');

                // Tareas de fondo: se ejecutan en paralelo pero el flujo principal espera a que todas terminen
                await Promise.all([
                    fetch('/.netlify/functions/send-transactional-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ recipientEmail: auth.user!.email!, recipientName: auth.user!.name || auth.user!.email!, emailType: 'submission-confirmation', item: { name: serviceData.serviceName, type: 'Servicio', id: newServiceId } }),
                    }),
                    fetch('/.netlify/functions/notify-admins', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itemType: 'Servicio', itemId: newServiceId, province: serviceData.province, itemName: serviceData.serviceName }),
                    }),
                    fetch('/.netlify/functions/update-gamification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: auth.user!.id, actionType: 'CREATE_SERVICE' }),
                    })
                ]).catch(backgroundError => {
                    // Atrapamos errores aquí para que no detengan el flujo principal
                    console.error("Failed to send background notifications or points:", backgroundError);
                });
            }

            onSuccess(); // Se llama solo después de que todo el bloque try haya tenido éxito

        } catch (err) {
            console.error("Error submitting service:", err);
            toast.error('Ocurrió un error al guardar. Inténtalo de nuevo.');
            setError('Ocurrió un error al guardar. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para la subida de imágenes a Firebase Storage
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const storageRef = ref(storage, `services/${auth.user!.id}_${Date.now()}_${file.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Actualizar el formData con la URL de descarga
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
            toast.success('Imagen subida correctamente.');
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error('Error al subir la imagen. Intenta de nuevo.');
        }
    };

    // Limitar la descripción a 200 caracteres y mostrar el contador
    const maxDescriptionLength = 200;
    const descriptionRemainingChars = maxDescriptionLength - formData.shortDescription.length;

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (value.length <= maxDescriptionLength) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };


    // Estilos de formulario unificados, basados en AddEventForm.tsx para una apariencia moderna.
    const inputStyle = "peer w-full bg-gray-100 border-b-2 border-gray-300 text-gray-800 placeholder-transparent focus:outline-none focus:border-ecuador-blue transition-colors p-2 rounded-t-md";
    const labelStyle = "absolute left-2 -top-5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-ecuador-blue peer-focus:text-sm";

    return (
        <div className="p-1">
            <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat border-b pb-3">
                {isEditing ? 'Editar Servicio' : 'Publicar un Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <input id="serviceName" name="serviceName" type="text" value={formData.serviceName} onChange={handleChange} required className={inputStyle} placeholder="Nombre del Servicio/Demanda *" />
                        <label htmlFor="serviceName" className={labelStyle}>Nombre del Servicio/Demanda *</label>
                    </div>
                    <div className="relative">
                        <select id="type" name="type" value={formData.type} onChange={handleChange} required className={inputStyle}>
                            <option value={ServiceType.OFERTA}>Ofrezco un servicio</option>
                            <option value={ServiceType.DEMANDA}>Busco un servicio/ayuda</option>
                        </select>
                        <label htmlFor="type" className={labelStyle}>Tipo *</label>
                    </div>
                </div>

                <div className="relative">
                    <textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleDescriptionChange} required rows={3} className={inputStyle} placeholder="Descripción Corta *" />
                    <label htmlFor="shortDescription" className={labelStyle}>Descripción Corta *</label>
                    <div className="text-right text-xs text-gray-500 mt-1">{formData.shortDescription.length}/{maxDescriptionLength}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <select id="category" name="category" value={formData.category} onChange={handleChange} required className={inputStyle}>
                            {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <label htmlFor="category" className={labelStyle}>Categoría *</label>
                    </div>
                    <div className="relative">
                        <input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} className={inputStyle} placeholder="Costo (Opcional)" min="0" />
                        <label htmlFor="cost" className={labelStyle}>Costo (Opcional)</label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <select id="province" name="province" value={formData.province} onChange={handleChange} required className={inputStyle}>
                            <option value="">Selecciona una provincia</option>
                            {cityData.map(province => (
                                <option key={province.provincia} value={province.provincia}>{province.provincia}</option>
                            ))}
                        </select>
                        <label htmlFor="province" className={labelStyle}>Provincia *</label>
                    </div>
                    <div className="relative">
                        <select id="city" name="city" value={formData.city} onChange={handleChange} required className={inputStyle} disabled={!formData.province}>
                            <option value="">Selecciona una ciudad</option>
                            {formData.province && cityData.find(p => p.provincia === formData.province)?.ciudades.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <label htmlFor="city" className={labelStyle}>Ciudad *</label>
                    </div>
                </div>

                <div>
                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Imagen del Servicio (Opcional)</label>
                    <input id="imageUpload" type="file" onChange={handleImageUpload} className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:font-semibold file:bg-ecuador-yellow-light file:text-ecuador-blue hover:file:bg-yellow-200" />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Vista previa" className="mt-2 h-20 w-auto rounded-md" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={inputStyle} placeholder="WhatsApp (Opcional)" />
                        <label htmlFor="whatsapp" className={labelStyle}>WhatsApp (Opcional)</label>
                    </div>
                    <div className="relative">
                        <input id="instagram" name="instagram" type="text" value={formData.instagram} onChange={handleChange} className={inputStyle} placeholder="Instagram (Opcional)" />
                        <label htmlFor="instagram" className={labelStyle}>Instagram (Opcional)</label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <input id="website" name="website" type="url" value={formData.website} onChange={handleChange} className={inputStyle} placeholder="Otro Sitio Web (Opcional)" />
                        <label htmlFor="website" className={labelStyle}>Otro Sitio Web (Opcional)</label>
                    </div>
                    <div className="relative">
                        <input id="websiteText" name="websiteText" type="text" value={formData.websiteText} onChange={handleChange} className={inputStyle} placeholder="Texto del Enlace (Opcional)" />
                        <label htmlFor="websiteText" className={labelStyle}>Texto del Enlace (Opcional)</label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t mt-8">
                    <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50">
                        {isSubmitting ? (isEditing ? 'Guardando...' : 'Agregando...') : (isEditing ? 'Guardar Cambios' : 'Agregar Servicio')}
                    </button>
                </div>
            </form>
        </div>
    );
};