// /home/alexis/Sites/Landings/conexion-ec-ca/components/AddServiceForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { addService, updateService } from '../services/directoryService';
import { CommunityServiceItem, ServiceType, ServiceCategory } from '../types';

interface AddServiceFormProps {
    onSuccess: () => void;
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
        city: '',
        shortDescription: '',
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
                city: initialData.city || '',
                shortDescription: initialData.shortDescription || '',
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

        if (!formData.serviceName || !formData.city || !formData.shortDescription) {
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
            const promise = isEditing
                ? updateService(initialData!.id, serviceData)
                : addService(serviceData);

            await toast.promise(promise, {
                loading: 'Guardando...',
                success: `¡Servicio ${isEditing ? 'actualizado' : 'agregado'}! Pasará a revisión.`,
                error: 'No se pudo guardar el servicio.',
            });

            onSuccess();
        } catch (err) {
            console.error("Error al enviar el servicio:", err);
            setError('Ocurrió un error al guardar. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilo original de los inputs para mantener la consistencia visual
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

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

            <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">Descripción Corta *</label>
                <textarea id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required rows={3} className={inputStyle} placeholder="Describe brevemente qué ofreces o buscas."/>
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputStyle}>
                    {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad *</label>
                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} required className={inputStyle} placeholder="Ej: Vancouver, Toronto"/>
            </div>

            <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (Opcional)</label>
                <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={inputStyle} placeholder="Ej: 593991234567"/>
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

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50">
                    {isSubmitting ? (isEditing ? 'Guardando...' : 'Agregando...') : (isEditing ? 'Guardar Cambios' : 'Agregar Servicio')}
                </button>
            </div>
        </form>
    );
};