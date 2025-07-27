// /home/alexis/Sites/Landings/conexion-ec-ca/components/EventsNews.tsx
import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EventItem, NewsItem } from '../types';
import { EventCarousel } from './EventCarousel';
import { MagnifyingGlassIcon, NewspaperIcon, LinkIcon, CalendarDaysIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { getPublicEvents } from '../services/eventService';
// --- CORRECCIÓN: Limpiamos las importaciones de newsService ---
import { getPaginatedPublicNews, NEWS_PAGE_SIZE } from '../services/newsService';
import { DocumentSnapshot } from 'firebase/firestore';
import { regions } from './NationalRegionSelector';

export const EventsNews: React.FC = () => {
  const { region: regionPath } = useParams<{ region: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const authContext = useContext(AuthContext);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lastNewsDoc, setLastNewsDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [isMoreNewsLoading, setIsMoreNewsLoading] = useState(false);

  useEffect(() => {
    const region = regions.find(r => r.path === `/${regionPath}`);
    if (region) {
      setSearchTerm(region.name);
    }
  }, [regionPath]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [eventsData, initialNewsData] = await Promise.all([
          getPublicEvents(),
          getPaginatedPublicNews()
        ]);
        setEvents(eventsData);
        setNews(initialNewsData.news);
        setLastNewsDoc(initialNewsData.lastVisible);
        setHasMoreNews(initialNewsData.news.length === NEWS_PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("No se pudo cargar el contenido. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleLoadMoreNews = async () => {
    if (!lastNewsDoc || !hasMoreNews) return;

    setIsMoreNewsLoading(true);
    try {
      const newNewsData = await getPaginatedPublicNews(lastNewsDoc);
      setNews(prevNews => [...prevNews, ...newNewsData.news]);
      setLastNewsDoc(newNewsData.lastVisible);
      setHasMoreNews(newNewsData.news.length === NEWS_PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching more news:", err);
      setError("No se pudieron cargar más noticias.");
    } finally {
      setIsMoreNewsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
      const term = searchTerm.toLowerCase();
      // Si no hay provincia definida en el evento, se muestra en todas las regiones.
      if (!event.province) {
        return true;
      }
      return (
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          (event.province && event.province.toLowerCase().includes(term)) ||
          (event.city && event.city.toLowerCase().includes(term))
      );
  });

  return (
      <section id="events-news" className="py-14 md:py-16 bg-ecuador-blue-light">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Eventos y Noticias</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Mantente al día con nuestros próximos eventos y las últimas noticias relevantes para nuestra comunidad.
            </p>
          </div>

          {/* --- INICIO DEL CÓDIGO RESTAURADO --- */}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecuador-yellow focus:border-transparent w-full sm:w-64"
                    aria-label="Buscar eventos por palabra clave"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            {loading ? (
                <p className="text-center text-gray-500">Cargando eventos...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <EventCarousel events={searchTerm ? filteredEvents : events} />
            )}
          </div>
          {/* --- FIN DEL CÓDIGO RESTAURADO --- */}

          {/* Noticias */}
          <div>
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat flex items-center">
              <NewspaperIcon className="w-7 h-7 mr-3 text-ecuador-red"/>Noticias Destacadas
            </h3>
            {loading ? (
                <p className="text-center text-gray-500">Cargando noticias...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : (
                <div className="space-y-6">
                  {news.map((newsItem) => (
                      <div key={newsItem.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h4 className="text-xl font-semibold text-ecuador-blue mb-2">{newsItem.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{newsItem.summary}</p>
                        <a
                            href={newsItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-ecuador-red hover:text-red-700 transition-colors flex items-center"
                            aria-label={`Leer más sobre ${newsItem.title}`}
                        >
                          Leer más <LinkIcon className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                  ))}
                </div>
            )}

            <div className="text-center mt-8">
              {hasMoreNews && !loading && (
                  <button
                      onClick={handleLoadMoreNews}
                      disabled={isMoreNewsLoading}
                      className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isMoreNewsLoading ? 'Cargando...' : 'Cargar más noticias'}
                  </button>
              )}
              {!hasMoreNews && !loading && news.length > 0 && (
                  <p className="text-gray-500 text-sm">Has llegado al final de las noticias.</p>
              )}
            </div>
          </div>
        </div>
      </section>
  );
};