import React, { useRef } from 'react';
import { EventItem } from '../types';
// import { ECUADOR_COLORS } from '../constants'; // ECUADOR_COLORS not directly used here anymore, Tailwind classes preferred
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from './icons';

interface EventCarouselProps {
  events: EventItem[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8; // Scroll by 80% of visible width
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  if (events.length === 0) {
    return <p className="text-gray-600 text-center">No hay eventos próximos por el momento.</p>;
  }

  return (
    <div className="relative">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide" // scrollbar-hide class uses global CSS from index.html
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {events.map((event) => (
          <div 
            key={event.id} 
            className="flex-shrink-0 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ scrollSnapAlign: 'start' }}
          >
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
              <a href="#" className="text-sm font-semibold text-ecuador-red hover:text-red-700 transition-colors" aria-label={`Más información sobre ${event.title}`}>
                Más información &rarr;
              </a>
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
      {/* 
        The .scrollbar-hide styles are now defined in index.html in a global <style> tag:
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      */}
    </div>
  );
};
