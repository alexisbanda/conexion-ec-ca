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
                // Lógica para actualizar un servicio existente
                await toast.promise(updateService(initialData!.id, serviceData), {
                    loading: 'Guardando cambios...',
                    success: '¡Servicio actualizado con éxito!',
                    error: 'No se pudo actualizar el servicio.',
                });
            } else {
                // Lógica para agregar un nuevo servicio
                const newServiceId = await addService(serviceData);
                toast.success('¡Servicio agregado! Pasará a revisión.');

                // Enviar correo de confirmación al usuario
                try {
                    await fetch('/.netlify/functions/send-transactional-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipientEmail: auth.user!.email!,
                            recipientName: auth.user!.name || auth.user!.email!,
                            emailType: 'submission-confirmation',
                            item: {
                                name: serviceData.serviceName,
                                type: 'Servicio',
                                id: newServiceId,
                            },
                        }),
                    });
                } catch (emailError) {
                    console.error("Submission confirmation email failed to send:", emailError);
                }

                // Notificar a los administradores relevantes
                try {
                    await fetch('/.netlify/functions/notify-admins', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            itemType: 'Servicio',
                            itemId: newServiceId,
                            province: serviceData.province,
                            itemName: serviceData.serviceName,
                        }),
                    });
                } catch (adminEmailError) {
                    console.error("Admin notification email failed to send:", adminEmailError);
                }
            }

            onSuccess(); // Cierra el modal o actualiza la UI
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


    // Estilo original de los inputs para mantener la consistencia visual
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";

    return (
        <div className="p-1">
            <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat border-b pb-3">
                {isEditing ? 'Editar Servicio' : 'Publicar un Nuevo Servicio'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm md:col-span-2">{error}</div>}

                {/* --- INICIO DE LA CUADRÍCULA DE DOS COLUMNAS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">

                    {/* Columna 1 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Nombre del Servicio/Demanda *</label>
                            <input id="serviceName" name="serviceName" type="text" value={formData.serviceName} onChange={handleChange} required className={inputStyle} placeholder="Ej: Clases de Inglés, Busco empleo..."/>
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputStyle}>
                                <option value={ServiceType.OFERTA}>Ofrezco un servicio</option>
                                <option value={ServiceType.DEMANDA}>Busco un servicio/ayuda</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Descripción Corta *</label>
                            <textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required rows={4} className={inputStyle} placeholder="Describe brevemente qué ofreces o buscas (máx 200 caracteres)."/>
                        </div>
                         <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría *</label>
                            <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputStyle}>
                                {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provincia *</label>
                            <select id="province" name="province" value={formData.province} onChange={handleChange} required className={inputStyle}>
                                <option value="">Selecciona una provincia</option>
                                {cityData.map(province => (
                                    <option key={province.provincia} value={province.provincia}>{province.provincia}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad *</label>
                            <select id="city" name="city" value={formData.city} onChange={handleChange} required className={inputStyle} disabled={!formData.province}>
                                <option value="">Selecciona una ciudad</option>
                                {formData.province && cityData.find(p => p.provincia === formData.province)?.ciudades.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Columna 2 */}
                    <div className="space-y-4">
                       {/* Subir imagen (opcional) */}
                       <div>
                          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Imagen del Servicio (Opcional)</label>
                          <input type="file" onChange={handleImageUpload} className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:font-semibold file:bg-ecuador-yellow-light file:text-ecuador-blue hover:file:bg-yellow-200" />
                          {formData.imageUrl && <img src={formData.imageUrl} alt="Vista previa" className="mt-2 h-20 w-auto rounded-md" />}
                        </div>
                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Costo (Opcional)</label>
                            <input
                                id="cost"
                                name="cost"
                                type="number"
                                value={formData.cost}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Ej: 25 (dejar vacío si es gratis)"
                                min={0} // No permitir valores negativos
                            />
                        </div>
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (Opcional)</label>
                            <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={inputStyle} placeholder="CódigoDePaísNúmero (sin +)"/>
                        </div>

                        <div>
                            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram (Opcional)</label>
                            <input id="instagram" name="instagram" type="text" value={formData.instagram} onChange={handleChange} className={inputStyle} placeholder="TuUsuario (sin @)"/>
                        </div>

                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Otro Sitio Web (Opcional)</label>
                            <input id="website" name="website" type="url" value={formData.website} onChange={handleChange} className={inputStyle} placeholder="https://linkedin.com/in/tu-perfil"/>
                        </div>

                        <div>
                            <label htmlFor="websiteText" className="block text-sm font-medium text-gray-700">Texto del Enlace (Opcional)</label>
                            <input id="websiteText" name="websiteText" type="text" value={formData.websiteText} onChange={handleChange} className={inputStyle} placeholder="Ej: LinkedIn, Portafolio"/>
                        </div>
                    </div>

                </div>
                {/* --- FIN DE LA CUADRÍCULA --- */}

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