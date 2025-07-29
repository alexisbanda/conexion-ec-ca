// /home/alexis/Sites/Landings/conexion-ec-ca/components/ContentForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { EventItem, NewsItem } from '../types';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { cityData } from '../constants';

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

    // --- ESTADOS PARA SEGMENTACIÓN ---
    const [province, setProvince] = useState<string>('Todas');
    const [city, setCity] = useState<string>('Todas');

    const provinces = useMemo(() => ['Todas', ...cityData.map(p => p.provincia)], []);
    const cities = useMemo(() => {
        if (province === 'Todas') return ['Todas'];
        const selectedProvince = cityData.find(p => p.provincia === province);
        return selectedProvince ? ['Todas', ...selectedProvince.ciudades] : ['Todas'];
    }, [province]);


    useEffect(() => {
        if (initialData) {
            // Pre-populamos el formulario, asegurando que las fechas se conviertan a string
            setFormData({
                ...initialData,
                date: initialData.date ? timestampToDateString(initialData.date) as any : '',
                publishedAt: initialData.publishedAt ? timestampToDateString(initialData.publishedAt) as any : '',
            });
            if (itemType === 'event') {
                setProvince((initialData as EventItem).province || 'Todas');
                setCity((initialData as EventItem).city || 'Todas');
            }
            if (itemType === 'news') {
                setProvince((initialData as NewsItem).province || 'Todas');
                setCity((initialData as NewsItem).city || 'Todas');
            }
        } else {
            // Valores por defecto para un nuevo item
            const defaultDate = new Date().toISOString().split('T')[0];
            setFormData(itemType === 'event' ? { date: defaultDate as any } : { publishedAt: defaultDate as any });
            if (itemType === 'event' || itemType === 'news') {
                setProvince('Todas');
                setCity('Todas');
            }
        }
    }, [initialData, itemType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProvince(e.target.value);
        setCity('Todas'); // Reset city when province changes
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('El título es obligatorio.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToSubmit: { [key: string]: any } = { ...formData };

            if (itemType === 'event') {
                if (dataToSubmit.date) {
                    dataToSubmit.date = Timestamp.fromDate(new Date(dataToSubmit.date as any));
                }
                delete dataToSubmit.publishedAt;
                delete dataToSubmit.summary;
                delete dataToSubmit.link;

                // Añadir campos de segmentación
                dataToSubmit.province = province === 'Todas' ? '' : province;
                dataToSubmit.city = city === 'Todas' ? '' : city;

            } else if (itemType === 'news') {
                if (dataToSubmit.publishedAt) {
                    dataToSubmit.publishedAt = Timestamp.fromDate(new Date(dataToSubmit.publishedAt as any));
                }
                delete dataToSubmit.date;
                delete dataToSubmit.description;
                delete dataToSubmit.imageUrl;
                delete dataToSubmit.isPremium;

                // Añadir campos de segmentación
                dataToSubmit.province = province === 'Todas' ? '' : province;
                dataToSubmit.city = city === 'Todas' ? '' : city;
            }

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

                    {/* --- SECCIÓN DE SEGMENTACIÓN --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700">Segmentar por Provincia</label>
                            <select id="province" value={province} onChange={handleProvinceChange} className="mt-1 block w-full input-style">
                                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Dejar en 'Todas' para un evento global.</p>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Segmentar por Ciudad</label>
                            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} disabled={province === 'Todas'} className="mt-1 block w-full input-style disabled:bg-gray-100">
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Dejar en 'Todas' para aplicar a toda la provincia.</p>
                        </div>
                    </div>

                    <div className="flex items-center pt-4">
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

                    {/* --- SECCIÓN DE SEGMENTACIÓN PARA NOTICIAS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                        <div>
                            <label htmlFor="province-news" className="block text-sm font-medium text-gray-700">Segmentar por Provincia</label>
                            <select id="province-news" value={province} onChange={handleProvinceChange} className="mt-1 block w-full input-style">
                                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Dejar en 'Todas' para una noticia global.</p>
                        </div>
                        <div>
                            <label htmlFor="city-news" className="block text-sm font-medium text-gray-700">Segmentar por Ciudad</label>
                            <select id="city-news" value={city} onChange={(e) => setCity(e.target.value)} disabled={province === 'Todas'} className="mt-1 block w-full input-style disabled:bg-gray-100">
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Dejar en 'Todas' para aplicar a toda la provincia.</p>
                        </div>
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