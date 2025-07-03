// /home/alexis/Sites/Landings/conexion-ec-ca/components/UserDetailsDisplay.tsx
import React from 'react';
import { User } from '../types';
import { Timestamp } from 'firebase/firestore';

interface UserDetailsDisplayProps {
    user: User;
}

// Copiamos la función auxiliar para formatear la fecha
const timestampToDateString = (timestamp: Timestamp | undefined, placeholder = 'No especificado'): string => {
    if (!timestamp) return placeholder;
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

export const UserDetailsDisplay: React.FC<UserDetailsDisplayProps> = ({ user }) => {
    return (
        <div className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <h4 className="font-semibold text-gray-600">Fecha de Registro</h4>
                    <p className="text-gray-800">{timestampToDateString(user.createdAt)}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">Llegada a Canadá</h4>
                    <p className="text-gray-800">{timestampToDateString(user.arrivalDateCanada)}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">Ciudad</h4>
                    <p className="text-gray-800">{user.city || 'No especificada'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">Estatus Migratorio</h4>
                    <p className="text-gray-800">{user.immigrationStatus || 'No especificado'}</p>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-600">Apoyo que necesita</h4>
                <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1">
                    {user.supportNeeded && user.supportNeeded.length > 0
                        ? user.supportNeeded.join(', ')
                        : 'No especificó áreas de apoyo.'}
                </p>
            </div>

            <div>
                <h4 className="font-semibold text-gray-600">Mensaje del usuario</h4>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap">
                    {user.message || 'No proporcionó un mensaje.'}
                </p>
            </div>

            <div>
                <h4 className="font-semibold text-gray-600">Suscripción a Noticias</h4>
                <p className="text-gray-800">
                    {user.newsletterSubscription ? 'Sí, desea recibir noticias.' : 'No, no desea recibir noticias.'}
                </p>
            </div>
        </div>
    );
};