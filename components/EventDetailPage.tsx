// /home/alexis/Sites/Landings/conexion-ec-ca/components/EventDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EventItem } from '../types';
import { getEventById } from '../services/eventService';
import { CalendarDaysIcon } from './icons';
import { Timestamp } from 'firebase/firestore';
import { RsvpSection } from './RsvpSection';

const formatDate = (timestamp: Timestamp): string => {
    if (!timestamp?.seconds) return 'Fecha no disponible';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

export const EventDetailPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;
        try {
            const eventData = await getEventById(eventId);
            if (eventData) {
                setEvent(eventData);
            } else {
                setError('El evento que buscas no existe o fue eliminado.');
            }
        } catch (err) {
            console.error("Error detallado al obtener el evento:", err);
            setError('No se pudo cargar la información del evento.');
        } finally {
            if (loading) {
                setLoading(false);
            }
        }
    }, [eventId, loading]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    if (loading) return <div className="text-center py-40">Cargando evento...</div>;
    if (error) return <div className="text-center py-40 text-red-500">{error}</div>;
    if (!event) return null;

    return (
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Envolvemos todo en un div que ocupa toda la pantalla y tiene el color de fondo.
        <div className="bg-gray-50 min-h-screen">
            {/* 2. La sección interior ahora solo necesita el padding para empujar el contenido hacia abajo. */}
            <section className="pt-24 md:pt-32 pb-24 md:pb-32">
                <div className="container mx-auto px-6">
                    <img
                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/400`}
                        alt={event.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg mb-8"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold text-ecuador-blue mb-4 font-montserrat">{event.title}</h1>
                    <div className="flex items-center text-lg text-ecuador-red mb-6 font-semibold">
                        <CalendarDaysIcon className="w-6 h-6 mr-2" />
                        <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="prose max-w-none text-gray-700 mb-8">
                        <p>{event.description}</p>
                    </div>

                    <RsvpSection event={event} onRsvpUpdate={fetchEvent} />

                    {/* Aquí irá la Galería de Fotos en el futuro */}
                </div>
            </section>
        </div>
        // --- FIN DE LA CORRECCIÓN ---
    );
};