
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getNotificationSettings, updateNotificationSettings, NotificationSettings } from '../../services/adminService';

const FREQUENCY_OPTIONS = [
    { id: 'instant', label: 'Inmediata (al crear un nuevo item)' },
    { id: 'daily', label: 'Diaria (resumen a las 8:00 AM)' },
    { id: 'weekly', label: 'Semanal (resumen los lunes a las 8:00 AM)' },
    { id: 'bi-weekly', label: 'Quincenal (resumen cada dos lunes a las 8:00 AM)' },
];

export const NotificationSettingsSection: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({ frequency: 'daily' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const currentSettings = await getNotificationSettings();
                if (currentSettings) {
                    setSettings(currentSettings);
                }
            } catch (error) {
                console.error("Error fetching notification settings:", error);
                toast.error('No se pudo cargar la configuración de notificaciones.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings({ ...settings, frequency: e.target.value as NotificationSettings['frequency'] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateNotificationSettings(settings);
            toast.success('¡Configuración de notificaciones guardada!');
        } catch (error) {
            console.error("Error saving notification settings:", error);
            toast.error('Hubo un error al guardar las notificaciones.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleForceSend = async () => {
        if (!confirm("¿Estás seguro de que quieres enviar manualmente las notificaciones ahora? Esto enviará correos a todos los usuarios suscritos sobre los nuevos eventos y servicios no notificados.")) {
            return;
        }

        setIsSending(true);
        toast.loading('Enviando notificaciones...');

        try {
            // Workaround for netlify dev bug: Use GET with query param instead of POST with body.
            const response = await fetch('/.netlify/functions/send-periodic-notifications?force=true', {
                method: 'GET',
            });

            toast.dismiss();
            if (response.ok) {
                const body = await response.text();
                if (body === "No new content.") {
                    toast.success('¡No había contenido nuevo para notificar!');
                } else {
                    toast.success('¡Notificaciones enviadas con éxito!');
                }
            } else {
                throw new Error('La función de notificación devolvió un error.');
            }
        } catch (error) {
            toast.dismiss();
            console.error("Error forcing notification send:", error);
            toast.error('Hubo un error al intentar enviar las notificaciones.');
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-ecuador-blue mb-2 font-montserrat">Notificaciones</h3>
                <p>Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold text-ecuador-blue mb-2 font-montserrat">
                    Notificaciones
                </h3>
                <p className="text-gray-600 mb-6">
                    Define la frecuencia de envío de correos para nuevos servicios o eventos.
                </p>
                <div className="mb-6">
                    <label htmlFor="frequency" className="block text-lg font-medium text-gray-800 mb-2">
                        Frecuencia de Envío
                    </label>
                    <select
                        id="frequency"
                        value={settings.frequency}
                        onChange={handleFrequencyChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-ecuador-blue focus:border-ecuador-blue"
                        disabled={isSaving}
                    >
                        {FREQUENCY_OPTIONS.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={handleForceSend}
                        disabled={isSending || isSaving}
                        className="bg-ecuador-yellow hover:bg-yellow-500 text-ecuador-blue font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSending ? 'Enviando...' : 'Forzar Envío de Resumen'}
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || isSending}
                        className="bg-ecuador-blue hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Sección'}
                    </button>
                </div>
            </form>
        </div>
    );
};
