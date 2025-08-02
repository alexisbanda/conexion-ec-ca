import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EventItem } from '../types';
import { getEventById } from '../services/eventService';
import { CalendarDaysIcon, MapPinIcon, UserGroupIcon, LinkIcon } from './icons';
import { Timestamp } from 'firebase/firestore';
import { RsvpSection } from './RsvpSection';

// --- Helper Functions for Formatting ---

const formatEventDate = (timestamp: Timestamp): string => {
    if (!timestamp?.seconds) return 'Fecha no disponible';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
    });
};

const formatEventTime = (timestamp: Timestamp): string => {
    if (!timestamp?.seconds) return 'Hora no disponible';
    return new Date(timestamp.seconds * 1000).toLocaleTimeString('es-ES', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

// --- Main Component ---

export const EventDetailPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;
        setLoading(true);
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
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('¡Enlace copiado al portapapeles!');
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Cargando evento...</div>;
    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
    if (!event) return null;

    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(event.city || '')},${encodeURIComponent(event.province || '')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* --- Hero Banner --- */}
            <motion.div 
                className="relative w-full h-72 md:h-96 bg-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <img
                    src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/400`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-12 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold font-montserrat drop-shadow-lg">{event.title}</h1>
                    {event.isPremium && (
                        <span className="mt-2 inline-block bg-ecuador-yellow text-ecuador-blue text-sm font-bold px-3 py-1 rounded-full">EVENTO PREMIUM</span>
                    )}
                </div>
            </motion.div>

            {/* --- Main Content Area --- */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="lg:grid lg:grid-cols-3 lg:gap-x-12 xl:gap-x-16">
                    
                    {/* --- Left Column --- */}
                    <main className="lg:col-span-2 space-y-12">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Acerca de este evento</h2>
                            <div className="prose max-w-none text-gray-700 text-lg leading-relaxed">
                                <p>{event.description}</p>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Asistentes</h2>
                            <div className="flex items-center text-gray-600">
                                <UserGroupIcon className="w-8 h-8 mr-3 text-ecuador-red" />
                                <span className="text-xl">{event.rsvps?.length || 0} miembros de la comunidad van a asistir.</span>
                            </div>
                            <p className="mt-2 text-gray-500">¡Regístrate para ver quién más viene!</p>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Comparte con tus amigos</h2>
                            <button 
                                onClick={handleCopyLink}
                                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                <LinkIcon className="w-5 h-5" />
                                Copiar enlace del evento
                            </button>
                        </motion.section>
                    </main>

                    {/* --- Right Column (Sticky) --- */}
                    <aside className="lg:col-span-1 mt-12 lg:mt-0">
                        <motion.div 
                            className="sticky top-24 space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start mb-4">
                                        <CalendarDaysIcon className="w-6 h-6 mr-4 text-ecuador-red flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{formatEventDate(event.date)}</h3>
                                            <p className="text-gray-600">{formatEventTime(event.date)}</p>
                                        </div>
                                    </div>
                                    {(event.province || event.city) && (
                                        <div className="flex items-start">
                                            <MapPinIcon className="w-6 h-6 mr-4 text-ecuador-red flex-shrink-0 mt-1" />
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">{event.province}</h3>
                                                <p className="text-gray-600">{event.city}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-6 border-t border-gray-200">
                                    <RsvpSection event={event} onRsvpUpdate={fetchEvent} />
                                </div>
                            </div>
                            
                            {(event.city || event.province) && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
                                    <iframe
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={mapSrc}>
                                    </iframe>
                                </div>
                            )}
                        </motion.div>
                    </aside>
                </div>
            </div>
        </div>
    );
};
