
import React, { useState }  from 'react';
import { EventItem, NewsItem as NewsItemType } from '../types';
import { ECUADOR_COLORS } from '../constants';
import { EventCarousel } from './EventCarousel';
import { MagnifyingGlassIcon, NewspaperIcon, LinkIcon, CalendarDaysIcon } from './icons';

const upcomingEventsData: EventItem[] = [
  { id: 'ev1', title: 'Festival Gastronómico Ecuatoriano', date: '15 Agosto, 2024', description: 'Disfruta de la auténtica comida ecuatoriana, música en vivo y actividades culturales para toda la familia.', imageUrl: 'https://picsum.photos/seed/foodfest/400/200' },
  { id: 'ev2', title: 'Taller: Emprende en Canadá', date: '22 Agosto, 2024', description: 'Aprende los pasos clave para iniciar tu propio negocio en Canadá, con expertos y casos de éxito.', imageUrl: 'https://picsum.photos/seed/workshop/400/200' },
  { id: 'ev3', title: 'Noche de Cine Latino', date: '05 Septiembre, 2024', description: 'Proyección de una película latinoamericana aclamada, seguida de un debate ameno.', imageUrl: 'https://picsum.photos/seed/movienight/400/200' },
  { id: 'ev4', title: 'Celebración Día de la Independencia', date: '10 Septiembre, 2024', description: 'Conmemoración patria con actos cívicos, danzas folklóricas y mucha alegría.', imageUrl: 'https://picsum.photos/seed/independenceday/400/200' },
];

const newsData: NewsItemType[] = [
  { id: 'n1', title: 'Nuevas políticas migratorias para 2024', summary: 'Canadá anuncia actualizaciones en sus programas de inmigración que podrían beneficiar a...', link: '#' },
  { id: 'n2', title: 'Comunidad ecuatoriana celebra éxito en torneo deportivo local', summary: 'El equipo "Los Cóndores" se alza con la victoria en el campeonato de fútbol...', link: '#' },
  { id: 'n3', title: 'Guía actualizada de recursos para recién llegados', summary: 'Conexión Migrante lanza una nueva versión de su guía con información vital para...', link: '#' },
];

export const EventsNews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Add actual search/filter logic here if needed
  };

  // Basic filtering example (case-insensitive)
  const filteredEvents = upcomingEventsData.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="events-news" className="py-16 md:py-24 bg-ecuador-blue-light">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Eventos y Noticias</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Mantente al día con nuestros próximos eventos y las últimas noticias relevantes para nuestra comunidad.
          </p>
        </div>

        {/* Eventos */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-4 sm:mb-0 font-montserrat flex items-center">
              <CalendarDaysIcon className="w-7 h-7 mr-3 text-ecuador-red"/>Próximos Eventos
            </h3>
            <div className="relative w-full sm:w-auto">
              <input 
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecuador-yellow focus:border-transparent w-full sm:w-64"
                aria-label="Buscar eventos por palabra clave"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <EventCarousel events={searchTerm ? filteredEvents : upcomingEventsData} />
          <div className="text-center mt-8">
            <a 
              href="#calendar" 
              className="text-ecuador-red font-semibold hover:underline"
              aria-label="Ver calendario completo de eventos"
            >
              Ver Calendario Completo &rarr;
            </a>
          </div>
        </div>

        {/* Noticias */}
        <div>
          <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat flex items-center">
            <NewspaperIcon className="w-7 h-7 mr-3 text-ecuador-red"/>Noticias Destacadas
          </h3>
          <div className="space-y-6">
            {newsData.map((news) => (
              <div key={news.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-semibold text-ecuador-blue mb-2">{news.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{news.summary}</p>
                <a 
                  href={news.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-semibold text-ecuador-red hover:text-red-700 transition-colors flex items-center"
                  aria-label={`Leer más sobre ${news.title}`}
                >
                  Leer más <LinkIcon className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
