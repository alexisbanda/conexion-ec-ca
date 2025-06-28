// /home/alexis/Sites/Landings/conexion-ec-ca/components/AddServiceForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { addService, updateService } from '../services/directoryService';
import { CommunityServiceItem, ServiceType } from '../types';

interface AddServiceFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    // Hacemos que pueda recibir datos iniciales para la edición
    initialData?: CommunityServiceItem | null;
}

export const AddServiceForm: React.FC<AddServiceFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const auth = useContext(AuthContext);

    // Determinamos si estamos en modo de edición
    const isEditing = !!initialData;

    // Usamos los datos iniciales para rellenar el formulario, o valores por defecto si no existen
    const [serviceName, setServiceName] = useState('');
    const [type, setType] = useState<ServiceType>(ServiceType.OFERTA);
    const [city, setCity] = useState('');
    const [website, setWebsite] = useState('');
    const [websiteText, setWebsiteText] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Este efecto se ejecuta si 'initialData' cambia, para rellenar el formulario
    useEffect(() => {
        if (initialData) {
            setServiceName(initialData.serviceName || '');
            setType(initialData.type || ServiceType.OFERTA);
            setCity(initialData.city || '');
            setWebsite(initialData.website || '');
            setWebsiteText(initialData.websiteText || '');
        }
    }, [initialData]);

    if (!auth?.user) {
        return <p className="text-red-500 p-4">Debes estar autenticado para gestionar servicios.</p>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!serviceName || !city) {
            setError('El nombre del servicio y la ciudad son obligatorios.');
            setIsSubmitting(false);
            return;
        }

        const serviceData = {
            serviceName,
            type,
            contact: auth.user!.email!,
            contactName: auth.user!.name || auth.user!.email!,
            city,
            website,
            websiteText,
            userId: auth.user!.id,
        };

        try {
            if (isEditing) {
                // Si estamos editando, llamamos a updateService
                await updateService(initialData.id, serviceData);
            } else {
                // Si no, llamamos a addService
                await addService(serviceData);
            }
            onSuccess();
        } catch (err) {
            console.error("Error al enviar el servicio:", err);
            setError('Ocurrió un error al guardar el servicio. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700">Nombre del Servicio/Demanda</label>
                <input id="serviceName" type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="Ej: Clases de Inglés, Busco empleo..."/>
            </div>

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value as ServiceType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
                    <option value={ServiceType.OFERTA}>Ofrezco un servicio</option>
                    <option value={ServiceType.DEMANDA}>Busco un servicio/ayuda</option>
                </select>
            </div>

            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="Ej: Vancouver, Toronto"/>
            </div>

            <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">Sitio Web / Red Social (Opcional)</label>
                <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="https://linkedin.com/in/tu-perfil"/>
            </div>

            <div>
                <label htmlFor="websiteText" className="block text-sm font-medium text-gray-700">Texto del Enlace (Opcional)</label>
                <input id="websiteText" type="text" value={websiteText} onChange={(e) => setWebsiteText(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="Ej: LinkedIn, Portafolio"/>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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