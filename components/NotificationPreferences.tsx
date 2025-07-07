import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ServiceCategory } from '../types';
import { updateUserSubscriptions } from '../services/userService';
import toast from 'react-hot-toast';

// Helper para obtener todas las categorías del enum y poder iterar sobre ellas
const serviceCategories = Object.values(ServiceCategory);

export const NotificationPreferences: React.FC = () => {
    const auth = useContext(AuthContext);
    const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Inicializamos el estado con las suscripciones que el usuario ya tiene guardadas
    useEffect(() => {
        if (auth?.user?.subscribedServiceCategories) {
            setSelectedCategories(auth.user.subscribedServiceCategories);
        }
    }, [auth?.user]);

    const handleCheckboxChange = (category: ServiceCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category) // Si ya está, la quitamos (uncheck)
                : [...prev, category]             // Si no está, la añadimos (check)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user) {
            toast.error('Debes iniciar sesión para guardar tus preferencias.');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserSubscriptions(auth.user.id, selectedCategories);
            // Es crucial refrescar los datos del usuario en el contexto global
            // para que toda la aplicación refleje los cambios.
            await auth.refreshUserData();
            toast.success('¡Preferencias guardadas con éxito!');
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al guardar. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!auth?.user) {
        return <div>Cargando preferencias...</div>;
    }

    return (
        <div className="w-full">
            <h3 className="text-2xl font-bold text-ecuador-blue mb-2 font-montserrat">
                Preferencias de Notificación
            </h3>
            <p className="text-gray-600 mb-6">
                Recibe un correo cuando se publiquen nuevos servicios en las categorías que te interesan.
            </p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {serviceCategories.map(category => (
                        <label key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-ecuador-yellow">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCheckboxChange(category)}
                            />
                            <span className="text-gray-800 font-medium">{category}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-ecuador-blue hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                </div>
            </form>
        </div>
    );
};