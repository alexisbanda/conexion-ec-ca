// /home/alexis/Sites/Landings/conexion-ec-ca/components/ContentForm.tsx
import React, { useState, useEffect } from 'react';
import { EventItem, NewsItem } from '../types';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Tipos para hacer el componente más robusto
type ContentItemData = Partial<EventItem> & Partial<NewsItem>;
type ContentType = 'event' | 'news';

interface ContentFormProps {
    itemType: ContentType;
    initialData?: ContentItemData | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

// Helper para convertir Timestamp de Firestore a un string 'YYYY-MM-DD' para inputs de fecha
const timestampToDateString = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
};

export const ContentForm: React.FC<ContentFormProps> = ({ itemType, initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<ContentItemData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Pre-populamos el formulario, asegurando que las fechas se conviertan a string
            setFormData({
                ...initialData,
                date: initialData.date ? timestampToDateString(initialData.date) as any : '',
                publishedAt: initialData.publishedAt ? timestampToDateString(initialData.publishedAt) as any : '',
            });
        } else {
            // Valores por defecto para un nuevo item
            const defaultDate = new Date().toISOString().split('T')[0];
            setFormData(itemType === 'event' ? { date: defaultDate as any } : { publishedAt: defaultDate as any });
        }
    }, [initialData, itemType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('El título es obligatorio.');
            return;
        }

        setIsSubmitting(true);
        try {
            // --- INICIO DE LA CORRECCIÓN ---
            // Creamos una copia mutable para poder limpiarla
            const dataToSubmit: { [key: string]: any } = { ...formData };

            // Convertimos las fechas y eliminamos los campos irrelevantes del otro tipo
            if (itemType === 'event') {
                if (dataToSubmit.date) {
                    dataToSubmit.date = Timestamp.fromDate(new Date(dataToSubmit.date as any));
                }
                // Eliminamos los campos que solo pertenecen a 'news'
                delete dataToSubmit.publishedAt;
                delete dataToSubmit.summary;
                delete dataToSubmit.link;

            } else if (itemType === 'news') {
                if (dataToSubmit.publishedAt) {
                    dataToSubmit.publishedAt = Timestamp.fromDate(new Date(dataToSubmit.publishedAt as any));
                }
                // Eliminamos los campos que solo pertenecen a 'event'
                delete dataToSubmit.date;
                delete dataToSubmit.description;
                delete dataToSubmit.imageUrl;
                delete dataToSubmit.isPremium;
            }
            // --- FIN DE LA CORRECCIÓN ---

            await onSubmit(dataToSubmit);

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error('No se pudo guardar el contenido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                <input id="title" name="title" type="text" value={formData.title || ''} onChange={handleChange} required className="mt-1 w-full input-style" />
            </div>

            {itemType === 'event' && (
                <>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha del Evento</label>
                        <input id="date" name="date" type="date" value={formData.date as any || ''} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL de la Imagen (Opcional)</label>
                        <input id="imageUrl" name="imageUrl" type="url" value={formData.imageUrl || ''} onChange={handleChange} className="mt-1 w-full input-style" />
                    </div>
                    <div className="flex items-center">
                        <input id="isPremium" name="isPremium" type="checkbox" checked={!!formData.isPremium} onChange={handleChange} className="h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow" />
                        <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-900">¿Es un evento premium (solo para miembros)?</label>
                    </div>
                </>
            )}

            {itemType === 'news' && (
                <>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Resumen</label>
                        <textarea id="summary" name="summary" value={formData.summary || ''} onChange={handleChange} rows={3} required className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700">Enlace a la Noticia Completa</label>
                        <input id="link" name="link" type="url" value={formData.link || ''} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700">Fecha de Publicación</label>
                        <input id="publishedAt" name="publishedAt" type="date" value={formData.publishedAt as any || ''} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};