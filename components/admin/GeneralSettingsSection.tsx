
import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
import { getGeneralSettings, updateGeneralSettings, GeneralSettings } from '../../services/adminService';
import { AuthContext } from '../../contexts/AuthContext';

export const GeneralSettingsSection: React.FC = () => {
    const { user } = useContext(AuthContext) || {};
    const [settings, setSettings] = useState<GeneralSettings>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const currentSettings = await getGeneralSettings();
                setSettings(currentSettings);
            } catch (error) {
                console.error("Error fetching general settings:", error);
                toast.error('No se pudo cargar la configuración general.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!user?.id) {
            toast.error("No se pudo identificar al usuario.");
            return;
        }

        setUploading(true);
        // Usamos una ruta bajo 'users' que generalmente está permitida para el propio usuario
        // O si no, intentamos imitar el patrón de otros archivos aceptados
        const storageRef = ref(storage, `users/${user.id}/settings/logo_${Date.now()}_${file.name}`);
        const toastId = toast.loading('Subiendo logo...');

        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setSettings(prev => ({ ...prev, logoUrl: downloadURL }));
            toast.success('Logo subido con éxito.', { id: toastId });
        } catch (error) {
            console.error("Error al subir el logo:", error);
            // Si falla users/, intentamos una ruta pública más generica si existe, o avisamos
            toast.error('Error de permisos al subir. Verifique las reglas de Storage.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateGeneralSettings(settings);
            toast.success('¡Configuración general guardada!');
        } catch (error) {
            console.error("Error saving general settings:", error);
            toast.error('Hubo un error al guardar la configuración.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                 <h3 className="text-2xl font-bold text-ecuador-blue mb-4 font-montserrat">
                    General
                </h3>
                <p>Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <form onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold text-ecuador-blue mb-4 font-montserrat">
                    General
                </h3>
                <p className="text-gray-600 mb-6">
                    Personaliza la apariencia básica del sitio.
                </p>

                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-800 mb-2">
                        Logo del Sitio
                    </label>
                    <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                            {settings.logoUrl ? (
                                <img 
                                    src={settings.logoUrl} 
                                    alt="Logo actual" 
                                    className="h-16 w-auto object-contain border border-gray-200 rounded-md p-1"
                                />
                            ) : (
                                <div className="h-16 w-32 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 text-sm">
                                    Sin Logo
                                </div>
                            )}
                        </div>
                        <label className="block">
                            <span className="sr-only">Elegir logo</span>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploading || isSaving}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-ecuador-blue file:text-white
                                  hover:file:bg-blue-700
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                "
                            />
                        </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Recomendado: Imagen PNG con fondo transparente, altura mín. 50px.</p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || uploading}
                        className="bg-ecuador-blue hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar General'}
                    </button>
                </div>
            </form>
        </div>
    );
};
