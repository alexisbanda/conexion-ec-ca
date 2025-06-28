// /home/alexis/Sites/Landings/conexion-ec-ca/components/CommunityDirectory.tsx
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { CommunityServiceItem, ServiceType } from '../types';
import { LockClosedIcon, ExclamationCircleIcon } from './icons'; // Ya no necesitamos PlusCircleIcon
import { AuthContext } from '../contexts/AuthContext';
import { getServices } from '../services/directoryService';

export const CommunityDirectory: React.FC = () => {
  const [services, setServices] = useState<CommunityServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterCity, setFilterCity] = useState<string>('Todas las ciudades');

  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;

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
  }, []); // El efecto solo se ejecuta una vez al montar

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(services.map(s => s.city))).sort();
    return ['Todas las ciudades', ...uniqueCities];
  }, [services]);

  const serviceTypes = ['Todos', ServiceType.OFERTA, ServiceType.DEMANDA];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const typeMatch = filterType === 'Todos' || service.type === filterType;
      const cityMatch = filterCity === 'Todas las ciudades' || service.city === filterCity;
      return typeMatch && cityMatch;
    });
  }, [services, filterType, filterCity]);

  const handleLoginPrompt = () => {
    authContext?.openLoginModal();
  };

  return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm w-full max-w-4xl mx-auto my-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-montserrat">Directorio de Servicios Comunitarios</h2>

        {!isAuthenticated && (
            <div className="bg-ecuador-yellow-light border-l-4 border-ecuador-yellow text-gray-700 p-4 mb-6 rounded-md flex items-center">
              <LockClosedIcon className="w-6 h-6 mr-3 text-ecuador-blue" />
              <p className="text-sm">
                Para ver la información de contacto completa, por favor{' '}
                <button onClick={handleLoginPrompt} className="font-semibold text-ecuador-red hover:underline">
                  inicia sesión
                </button>
                {' '}o{' '}
                <button onClick={authContext?.openRegisterModal} className="font-semibold text-ecuador-red hover:underline">
                  regístrate
                </button>
                {' '}como miembro.
              </p>
            </div>
        )}

        {/* --- INICIO DE LA CORRECCIÓN: FILTROS SIMPLIFICADOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="serviceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
            <select id="serviceTypeFilter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow bg-gray-50 text-sm" aria-label="Filtrar por tipo de servicio">
              {serviceTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <select id="cityFilter" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow bg-gray-50 text-sm" aria-label="Filtrar por ciudad">
              {cities.map(city => (<option key={city} value={city}>{city}</option>))}
            </select>
          </div>
        </div>
        {/* --- FIN DE LA CORRECCIÓN --- */}

        {loading ? (
            <div className="text-center py-10"><p className="text-gray-500">Cargando servicios...</p></div>
        ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md flex items-center" role="alert">
              <ExclamationCircleIcon className="w-6 h-6 mr-3" />
              <p>{error}</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* ... (código de la tabla sin cambios) ... */}
                <thead className="bg-ecuador-blue">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Servicio</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Contacto</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Ciudad</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Sitio / Red</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700">{service.serviceName}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.type === ServiceType.OFERTA ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {service.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {isAuthenticated ? (service.contactName || service.contact) : (<span className="text-gray-400 flex items-center"><LockClosedIcon className="w-4 h-4 mr-1" /> Solo Miembros</span>)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">{service.city}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isAuthenticated ? (
                                service.website ? (<a href={service.website} target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:text-blue-700 hover:underline">{service.websiteText || 'Visitar'}</a>) : (<span className="text-gray-400">No disponible</span>)
                            ) : (
                                <span className="text-gray-400 flex items-center"><LockClosedIcon className="w-4 h-4 mr-1" /> Solo Miembros</span>
                            )}
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No se encontraron servicios que coincidan con los filtros seleccionados.</td></tr>
                )}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};