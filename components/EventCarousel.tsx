import React, { useRef, useContext } from 'react'; // Import useContext
import { EventItem } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, LockClosedIcon } from './icons'; // Import LockClosedIcon
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

interface EventCarouselProps {
  events: EventItem[];
  onEventClick: (event: EventItem) => void; // Prop para manejar clics
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events, onEventClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const authContext = useContext(AuthContext); // Usar AuthContext

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (events.length === 0) {
    return <p className="text-gray-600 text-center">No se encontraron eventos con ese criterio.</p>;
  }

  return (
      <div className="relative">
        <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
        >
          {events.map((event) => (
              <div
                  key={event.id}
                  className={`flex-shrink-0 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative cursor-pointer ${event.isPremium && !authContext?.isAuthenticated ? 'opacity-60' : ''}`}
                  style={{ scrollSnapAlign: 'start' }}
                  onClick={() => onEventClick(event)} // Usar el manejador de clics
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && onEventClick(event)}
                  aria-label={`Ver detalles de ${event.title}`}
              >
                {/* Overlay para contenido premium */}
                {event.isPremium && !authContext?.isAuthenticated && (
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
                />
                <div className="p-5">
                  <h4 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat truncate">{event.title}</h4>
                  <div className="flex items-center text-sm text-ecuador-red mb-2">
                    <CalendarDaysIcon className="w-5 h-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 h-20 overflow-hidden text-ellipsis">{event.description}</p>
                  <span className="text-sm font-semibold text-ecuador-red hover:text-red-700 transition-colors">
                {event.isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión para ver' : 'Más información'} &rarr;
              </span>
                </div>
              </div>
          ))}
        </div>
        {events.length > 1 && (
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