// /home/alexis/Sites/Landings/conexion-ec-ca/components/EventDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EventItem } from '../types';
import { getEventById } from '../services/eventService';
import { CalendarDaysIcon, MapPinIcon } from './icons';
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
        <div className="bg-gray-50 min-h-screen">
            {/* HERO: Imagen de evento a todo el ancho */}
            <div className="relative w-full h-64 md:h-96">
                <img
                    src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/400`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                {/* Overlay oscuro para contraste */}
                <div className="absolute inset-0 bg-black/40" />
                {/* Título y fecha sobre la imagen (opcional, puedes quitar si prefieres abajo) */}
                {/* 
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-3xl md:text-5xl font-bold font-montserrat drop-shadow-lg">{event.title}</h1>
                    <div className="flex items-center justify-center text-lg mt-4 font-semibold">
                        <CalendarDaysIcon className="w-6 h-6 mr-2" />
                        <span>{formatDate(event.date)}</span>
                    </div>
                </div>
                */}
            </div>
            {/* Contenido principal debajo del hero */}
            <section className="pt-8 md:pt-12 pb-24 md:pb-32">
                <div className="container mx-auto px-6">
                    {/* Si no usas el título en el hero, muéstralo aquí */}
                    <h1 className="text-4xl md:text-5xl font-bold text-ecuador-blue mb-4 font-montserrat">{event.title}</h1>
                    <div className="flex flex-wrap items-center text-lg text-ecuador-red mb-6 font-semibold">
                        <div className="flex items-center mr-6 mb-2 md:mb-0">
                            <CalendarDaysIcon className="w-6 h-6 mr-2" />
                            <span>{formatDate(event.date)}</span>
                        </div>
                        {(event.province || event.city) && (
                            <div className="flex items-center text-gray-600">
                                <MapPinIcon className="w-6 h-6 mr-2" />
                                <span>{event.province}{event.city ? `, ${event.city}` : ''}</span>
                            </div>
                        )}
                    </div>
                    <div className="prose max-w-none text-gray-700 mb-8">
                        <p>{event.description}</p>
                    </div>
                    <RsvpSection event={event} onRsvpUpdate={fetchEvent} />
                    {/* Aquí irá la Galería de Fotos en el futuro */}
                </div>
            </section>
        </div>
    );
};