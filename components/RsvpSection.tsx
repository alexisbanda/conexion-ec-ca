// /home/alexis/Sites/Landings/conexion-ec-ca/components/RsvpSection.tsx
import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { EventItem } from '../types';
import { rsvpToEvent, cancelRsvp } from '../services/eventService';
import { CheckCircleIcon, UserGroupIcon } from './icons';

interface RsvpSectionProps {
    event: EventItem;
    onRsvpUpdate: () => void; // Función para que el componente padre refresque los datos
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ event, onRsvpUpdate }) => {
    const auth = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si el contexto de autenticación no está listo, no mostramos nada.
    if (!auth) return null;

    const { user, isAuthenticated, openLoginModal } = auth;
    const rsvpCount = event.rsvps?.length || 0;
    // Verificamos si el UID del usuario actual está en la lista de RSVPs del evento
    const hasRsvpd = user ? event.rsvps?.includes(user.id) : false;

    const handleRsvp = async () => {
        // Si el usuario no está logueado, le pedimos que inicie sesión.
        if (!isAuthenticated || !user) {
            openLoginModal();
            return;
        }

        setIsSubmitting(true);
        try {
            if (hasRsvpd) {
                // Si ya había confirmado, cancelamos la asistencia
                await cancelRsvp(event.id, user.id);
                toast.success('Tu asistencia ha sido cancelada.');
            } else {
                // Si no, confirmamos la asistencia
                await rsvpToEvent(event.id, user.id);
                toast.success('¡Gracias por confirmar tu asistencia!');
            }
            // Le decimos al componente padre que los datos han cambiado para que los vuelva a cargar
            onRsvpUpdate();
        } catch (error) {
            console.error("Error al procesar RSVP:", error);
            toast.error('Ocurrió un error. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-10 p-6 bg-white rounded-lg shadow-md border-t-4 border-ecuador-yellow">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center">
                    <UserGroupIcon className="w-8 h-8 text-ecuador-blue mr-3" />
                    <div>
                        <p className="text-xl font-bold text-gray-800">{rsvpCount} Asistente{rsvpCount !== 1 ? 's' : ''}</p>
                        <p className="text-sm text-gray-500">han confirmado su asistencia.</p>
                    </div>
                </div>
                <button
                    onClick={handleRsvp}
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-md transition-colors text-white disabled:opacity-60
                        ${hasRsvpd
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-ecuador-red hover:bg-red-700'
                    }`}
                >
                    {isSubmitting ? 'Procesando...' : (
                        hasRsvpd ? (
                            <span className="flex items-center justify-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Asistiendo</span>
                        ) : (
                            'Confirmar Asistencia'
                        )
                    )}
                </button>
            </div>
        </div>
    );
};