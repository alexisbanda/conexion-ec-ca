// /home/alexis/Sites/Landings/conexion-ec-ca/components/EventCarousel.tsx
import React, { useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventItem } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, LockClosedIcon, UserGroupIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

// --- UTILITIES ---
const formatDate = (timestamp: Timestamp): string => {
  if (!timestamp?.seconds) return 'Fecha no disponible';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// --- OPTIMIZATION 1: EXTRACT CARD TO A MEMOIZED COMPONENT ---
// Al mover la tarjeta a su propio componente y envolverla en React.memo,
// evitamos que se vuelva a renderizar innecesariamente. Solo se actualizará
// si sus props (event, isAuthenticated, onClick) cambian.
interface EventCardProps {
  event: EventItem;
  isAuthenticated: boolean;
  onClick: (event: EventItem) => void;
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, isAuthenticated, onClick }) => {
  const rsvpCount = event.rsvps?.length || 0;
  const isLocked = event.isPremium && !isAuthenticated;

  return (
      <div
          className={`flex-shrink-0 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
          // --- OPTIMIZATION 2: CSS HINT FOR SMOOTHER ANIMATIONS ---
          // 'will-change' le dice al navegador que se prepare para animar la propiedad 'transform',
          // lo que a menudo resulta en un rendimiento más fluido al delegarlo a la GPU.
          style={{ scrollSnapAlign: 'start', willChange: 'transform' }}
          onClick={() => onClick(event)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onClick(event)}
          aria-label={`Ver detalles de ${event.title}`}
      >
        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold rounded-lg z-10">
              <LockClosedIcon className="w-8 h-8 mr-2" />
              Exclusivo Miembros
            </div>
        )}
        <img
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/400/200`}
            alt={event.title}
            className="w-full h-48 object-cover"
            loading="lazy"
            // --- OPTIMIZATION 3: ASYNCHRONOUS IMAGE DECODING ---
            // 'decoding="async"' le permite al navegador decodificar la imagen fuera del hilo principal,
            // mejorando la capacidad de respuesta y reduciendo el "jank" o lag.
            decoding="async"
        />
        <div className="p-5 flex flex-col h-full">
          <h4 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat truncate">{event.title}</h4>
          <div className="flex items-center text-sm text-ecuador-red mb-2">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-ecuador-blue mb-3">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            <span>{rsvpCount} Asistente{rsvpCount !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-gray-600 text-sm mb-4 h-16 overflow-hidden text-ellipsis">{event.description}</p>
          <div className="mt-auto">
          <span className="text-sm font-semibold text-ecuador-red hover:text-red-700 transition-colors">
            {isLocked ? 'Iniciar Sesión para ver' : 'Más información'} &rarr;
          </span>
          </div>
        </div>
      </div>
  );
});

// --- MAIN CAROUSEL COMPONENT ---
interface EventCarouselProps {
  events: EventItem[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // --- OPTIMIZATION 4: MEMOIZE CALLBACKS ---
  // Usamos useCallback para asegurarnos de que la función handleCardClick no se
  // recree en cada render, lo que es una buena práctica, especialmente cuando
  // se pasa como prop a un componente memoizado como EventCard.
  const handleCardClick = useCallback((event: EventItem) => {
    if (event.isPremium && !authContext?.isAuthenticated) {
      authContext?.openLoginModal();
    } else {
      navigate(`/events/${event.id}`);
    }
  }, [authContext, navigate]);

  if (events.length === 0) {
    return <p className="text-gray-600 text-center py-8">No se encontraron eventos con ese criterio.</p>;
  }

  return (
      <div className="relative">
        <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
        >
          {events.map((event) => (
              <EventCard
                  key={event.id}
                  event={event}
                  isAuthenticated={!!authContext?.isAuthenticated}
                  onClick={handleCardClick}
              />
          ))}
        </div>
        {events.length > 2 && (
            <>
              <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 hidden sm:block"
                  aria-label="Evento anterior"
              >
                <ChevronLeftIcon className="w-6 h-6 text-ecuador-blue" />
              </button>
              <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 hidden sm:block"
                  aria-label="Siguiente evento"
              >
                <ChevronRightIcon className="w-6 h-6 text-ecuador-blue" />
              </button>
            </>
        )}
      </div>
  );
};