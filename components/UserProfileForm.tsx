// /home/alexis/Sites/Landings/conexion-ec-ca/components/UserProfileForm.tsx
import React, { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import { User } from '../types';
import { Timestamp } from 'firebase/firestore';

// ... (interfaz y función timestampToDateString no cambian)
interface UserProfileFormProps {
    user: User;
    onSuccess: () => void;
}

const timestampToDateString = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0];
};


export const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onSuccess }) => {
    const auth = useContext(AuthContext);

    const [formData, setFormData] = useState({
        city: user.city || '',
        arrivalDateCanada: timestampToDateString(user.arrivalDateCanada),
        immigrationStatus: user.immigrationStatus || '',
        supportNeeded: user.supportNeeded || [],
        message: user.message || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... (funciones handleChange y handleSupportChange no cambian)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            supportNeeded: checked
                ? [...prev.supportNeeded, value]
                : prev.supportNeeded.filter(item => item !== value),
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user?.id) {
            toast.error('No se pudo identificar al usuario.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToUpdate = {
                ...formData,
                arrivalDateCanada: formData.arrivalDateCanada ? new Date(formData.arrivalDateCanada) : undefined,
            };
            await updateUserProfile(auth.user.id, dataToUpdate);

            // --- INICIO DE LA MODIFICACIÓN ---
            // ¡LA CLAVE! Llamamos a la función para refrescar los datos en el contexto.
            await auth.refreshUserData();
            // --- FIN DE LA MODIFICACIÓN ---

            toast.success('Perfil actualizado con éxito.');
            onSuccess(); // Cierra el modal después de refrescar y notificar
        } catch (error) {
            toast.error('No se pudo actualizar el perfil.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (el resto del return del formulario no cambia)
    const supportOptions = ['Empleo', 'Vivienda', 'Idioma', 'Comunidad', 'Asesoría', 'Otro'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="profile-city" className="block text-sm font-medium text-gray-700">Ciudad donde vives</label>
                    <input id="profile-city" name="city" type="text" value={formData.city} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
                <div>
                    <label htmlFor="profile-arrivalDate" className="block text-sm font-medium text-gray-700">¿Cuándo llegaste a Canadá?</label>
                    <input id="profile-arrivalDate" name="arrivalDateCanada" type="date" value={formData.arrivalDateCanada} onChange={handleChange} className="mt-1 w-full input-style" />
                </div>
            </div>
            <div>
                <label htmlFor="profile-immigrationStatus" className="block text-sm font-medium text-gray-700">Estatus migratorio</label>
                <select id="profile-immigrationStatus" name="immigrationStatus" value={formData.immigrationStatus} onChange={handleChange} className="mt-1 w-full input-style">
                    <option value="">Selecciona una opción</option>
                    <option value="Residente Permanente">Residente Permanente</option>
                    <option value="Estudiante">Estudiante</option>
                    <option value="Trabajador Temporal">Trabajador Temporal</option>
                    <option value="Refugiado">Refugiado</option>
                    <option value="Ciudadano">Ciudadano</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">¿Qué tipo de apoyo necesitas?</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {supportOptions.map(option => (
                        <label key={option} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" value={option} checked={formData.supportNeeded.includes(option)} onChange={handleSupportChange} className="rounded text-ecuador-blue focus:ring-ecuador-yellow" />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="profile-message" className="block text-sm font-medium text-gray-700">Mensaje o comentario</label>
                <textarea id="profile-message" name="message" value={formData.message} onChange={handleChange} rows={3} className="mt-1 w-full input-style"></textarea>
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmitting} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};