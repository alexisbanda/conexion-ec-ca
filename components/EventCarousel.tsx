// /home/alexis/Sites/Landings/conexion-ec-ca/components/EventCarousel.tsx
import React, { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventItem } from '../types';
import { LockClosedIcon, UserGroupIcon, MapPinIcon, CalendarDaysIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

// --- NUEVO: Importaciones de Swiper ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

// --- NUEVO: Estilos de Swiper ---
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- UTILITIES (Sin cambios) ---
const formatDate = (timestamp: Timestamp): string => {
  if (!timestamp?.seconds) return 'Fecha no disponible';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// --- EventCard COMPONENT (Sin cambios, tu componente ya está optimizado) ---
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
          className={`flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
          style={{ willChange: 'transform' }}
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
            decoding="async"
        />
        <div className="p-5 flex flex-col flex-grow">
          <h4 className="text-xl font-semibold text-ecuador-blue mb-2 font-montserrat truncate">{event.title}</h4>
          <div className="flex items-center text-sm text-ecuador-red mb-2">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPinIcon className="w-5 h-5 mr-2" />
            <span>{event.province || 'TBD'}{event.city ? `, ${event.city}` : ''}</span>
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

// --- MAIN CAROUSEL COMPONENT (Completamente reescrito con Swiper) ---
interface EventCarouselProps {
  events: EventItem[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

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
    // Contenedor principal para aplicar estilos personalizados a Swiper
    <div className="relative swiper-container-events">
      {/* NUEVO: Estilos personalizados para los controles de Swiper */}
      <style>{`
        .swiper-container-events .swiper-button-next,
        .swiper-container-events .swiper-button-prev {
          color: #002D62; /* ecuador-blue */
          background-color: white;
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .swiper-container-events .swiper-button-next::after,
        .swiper-container-events .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        .swiper-container-events .swiper-pagination-bullet {
          background-color: #002D62; /* ecuador-blue */
          opacity: 0.5;
        }
        .swiper-container-events .swiper-pagination-bullet-active {
          background-color: #D52B1E; /* ecuador-red */
          opacity: 1;
        }
      `}</style>
      
      <Swiper
        // Carga los módulos necesarios
        modules={[Navigation, Pagination, A11y, Autoplay]}
        // Espacio entre slides
        spaceBetween={24}
        // Configuración responsive
        breakpoints={{
          // mobile
          320: {
            slidesPerView: 1,
            spaceBetween: 16,
          },
          // tablet
          768: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          // desktop
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        // Habilita los botones de navegación
        navigation
        // Habilita la paginación con puntos clickeables
        pagination={{ clickable: true }}
        // Habilita el bucle infinito
        loop={true}
        // Configuración del auto-play
        autoplay={{
          delay: 5000, // 5 segundos
          disableOnInteraction: true, // Se detiene si el usuario interactúa
          pauseOnMouseEnter: true, // Se detiene al pasar el cursor por encima
        }}
        // Para accesibilidad
        a11y={{
          prevSlideMessage: 'Evento anterior',
          nextSlideMessage: 'Siguiente evento',
        }}
        className="pb-12" // Padding bottom para dar espacio a la paginación
      >
        {events.map((event) => (
          <SwiperSlide key={event.id} className="h-auto">
            <EventCard
              event={event}
              isAuthenticated={!!authContext?.isAuthenticated}
              onClick={handleCardClick}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};