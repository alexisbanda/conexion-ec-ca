// /home/alexis/Sites/Landings/conexion-ec-ca/components/CommunityDirectory.tsx
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { CommunityServiceItem, ServiceType, ServiceCategory } from '../types';
import { LockClosedIcon, ExclamationCircleIcon, MagnifyingGlassIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { getServices } from '../services/directoryService';
import { ServiceCard } from './ServiceCard'; // <-- Importamos la nueva tarjeta

export const CommunityDirectory: React.FC = () => {
  const [services, setServices] = useState<CommunityServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- NUEVOS ESTADOS PARA FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterCity, setFilterCity] = useState<string>('Todas');

  const authContext = useContext(AuthContext);
  const isAuthenticated = !!authContext?.isAuthenticated;

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const servicesFromDB = await getServices();
        setServices(servicesFromDB);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los servicios. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // --- LISTAS DINÁMICAS PARA FILTROS ---
  const cities = useMemo(() => ['Todas', ...Array.from(new Set(services.map(s => s.city))).sort()], [services]);
  const categories = useMemo(() => ['Todas', ...Object.values(ServiceCategory)], []);
  const serviceTypes = ['Todos', ServiceType.OFERTA, ServiceType.DEMANDA];

  // --- LÓGICA DE FILTRADO MEJORADA ---
  const filteredServices = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return services.filter(service => {
      const typeMatch = filterType === 'Todos' || service.type === filterType;
      const cityMatch = filterCity === 'Todas' || service.city === filterCity;
      const categoryMatch = filterCategory === 'Todas' || service.category === filterCategory;
      const searchMatch = searchTerm === '' ||
          service.serviceName.toLowerCase().includes(lowercasedTerm) ||
          service.shortDescription.toLowerCase().includes(lowercasedTerm) ||
          service.contactName.toLowerCase().includes(lowercasedTerm);

      return typeMatch && cityMatch && categoryMatch && searchMatch;
    });
  }, [services, filterType, filterCity, filterCategory, searchTerm]);

  const handleLoginPrompt = () => {
    authContext?.openLoginModal();
  };

  return (
      <div className="w-full">
        <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat border-b pb-3">
             Directorio de Servicios
            </h3>
        <p className="text-gray-600 mb-6">
            Encuentra servicios, profesionales y demandas de ayuda dentro de nuestra comunidad. Usa los filtros para encontrar exactamente lo que necesitas.
        </p>

        {!isAuthenticated && (
            <div className="bg-ecuador-yellow-light border-l-4 border-ecuador-yellow text-gray-700 p-4 mb-6 rounded-md flex items-center">
              <LockClosedIcon className="w-6 h-6 mr-3 text-ecuador-blue" />
              <p className="text-sm">
                Para ver la información de contacto, por favor{' '}
                <button onClick={handleLoginPrompt} className="font-semibold text-ecuador-red hover:underline">inicia sesión</button>
                {' '}o{' '}
                <button onClick={authContext?.openRegisterModal} className="font-semibold text-ecuador-red hover:underline">regístrate</button>.
              </p>
            </div>
        )}

        {/* --- NUEVA SECCIÓN DE FILTROS --- */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input id="searchTerm" type="text" placeholder="Ej: 'contabilidad', 'clases'..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-9 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow text-sm" />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-2.5 top-[34px]" />
            </div>
            <div>
              <label htmlFor="serviceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select id="serviceTypeFilter" value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow text-sm">
                {serviceTypes.map(type => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select id="categoryFilter" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow text-sm">
                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}n              </select>
            </div>
            <div>
              <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <select id="cityFilter" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow text-sm">
                {cities.map(city => (<option key={city} value={city}>{city}</option>))}n              </select>
            </div>
          </div>
        </div>

        {/* --- VISTA DE TARJETAS --- */}
        {loading ? (
            <div className="text-center py-10"><p className="text-gray-500">Cargando servicios...</p></div>
        ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md flex items-center" role="alert">
              <ExclamationCircleIcon className="w-6 h-6 mr-3" />
              <p>{error}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                      <ServiceCard key={service.id} service={service} isAuthenticated={isAuthenticated} />
                  ))
              ) : (
                  <div className="col-span-full text-center py-16 bg-white rounded-lg border border-dashed">
                    <p className="text-gray-500">No se encontraron servicios que coincidan con tu búsqueda.</p>
                    <p className="text-sm text-gray-400 mt-2">Intenta ajustar los filtros.</p>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};