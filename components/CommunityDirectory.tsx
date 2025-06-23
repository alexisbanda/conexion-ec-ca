import React, { useState, useMemo, useContext } from 'react'; // Import useContext
import { CommunityServiceItem, ServiceType } from '../types';
import { PlusCircleIcon, LockClosedIcon } from './icons'; // Import PlusCircleIcon and LockClosedIcon
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext
import { ECUADOR_COLORS } from '../constants'; // Import ECUADOR_COLORS for styling

const initialServicesData: CommunityServiceItem[] = [
  { id: '1', serviceName: 'Traducción Español-Inglés', type: ServiceType.OFERTA, contact: 'juan@example.com', city: 'Vancouver', website: 'https://linkedin.com/in/juan', websiteText: 'LinkedIn' },
  { id: '2', serviceName: 'Cuidado Infantil', type: ServiceType.DEMANDA, contact: 'maria@example.com', city: 'Toronto' },
  { id: '3', serviceName: 'Clases de Inglés', type: ServiceType.OFERTA, contact: 'ana@example.com', city: 'Montreal', website: 'https://facebook.com/ana', websiteText: 'Facebook' },
  { id: '4', serviceName: 'Busco empleo en construcción', type: ServiceType.DEMANDA, contact: 'carlos@example.com', city: 'Vancouver' },
  { id: '5', serviceName: 'Diseño Gráfico', type: ServiceType.OFERTA, contact: 'sofia@example.com', city: 'Toronto', website: 'https://sofiadesign.com', websiteText: 'Sitio Web' },
  { id: '6', serviceName: 'Clases de Programación Web', type: ServiceType.OFERTA, contact: 'luis@example.com', city: 'Calgary' },
  { id: '7', serviceName: 'Necesito ayuda con mudanza', type: ServiceType.DEMANDA, contact: 'pedro@example.com', city: 'Montreal' },
  { id: '8', serviceName: 'Servicio de Catering Ecuatoriano', type: ServiceType.OFERTA, contact: 'elena@example.com', city: 'Vancouver', website: 'https://elena-catering.ca', websiteText: 'Sitio Web' },
];

export const CommunityDirectory: React.FC = () => {
  const [services, setServices] = useState<CommunityServiceItem[]>(initialServicesData);
  const [filterType, setFilterType] = useState<string>('Todos'); // 'Todos', 'Oferta', 'Demanda'
  const [filterCity, setFilterCity] = useState<string>('Todas las ciudades');

  const authContext = useContext(AuthContext); // Use AuthContext
  const isAuthenticated = authContext?.isAuthenticated; // Get authentication status

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

  const handleAddService = () => {
    // Placeholder for adding service functionality (e.g., open a modal)
    alert('Funcionalidad "Agregar Servicio" estará disponible pronto.');
  };

  const handleLoginPrompt = () => {
    authContext?.openLoginModal(); // Open login modal if not authenticated
  };

  return (
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm w-full max-w-4xl mx-auto my-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-montserrat">Directorio de Servicios Comunitarios</h2>

        {!isAuthenticated && (
            <div className="bg-ecuador-yellow-light border-l-4 border-ecuador-yellow text-gray-700 p-4 mb-6 rounded-md flex items-center">
              <LockClosedIcon className="w-6 h-6 mr-3 text-ecuador-blue" />
              <p className="text-sm">
                Para ver la información de contacto completa y agregar tu propio servicio, por favor{' '}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Filters */}
          <div>
            <label htmlFor="serviceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio</label>
            <select
                id="serviceTypeFilter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow bg-gray-50 text-sm"
                aria-label="Filtrar por tipo de servicio"
            >
              {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <select
                id="cityFilter"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-ecuador-yellow focus:border-ecuador-yellow bg-gray-50 text-sm"
                aria-label="Filtrar por ciudad"
            >
              {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Add Service Button (Conditional) */}
          <div className="sm:mt-auto">
            {isAuthenticated ? (
                <button
                    onClick={handleAddService}
                    className="w-full bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                    aria-label="Agregar nuevo servicio al directorio"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Agregar Servicio
                </button>
            ) : (
                <button
                    onClick={handleLoginPrompt}
                    className="w-full bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-md text-sm cursor-pointer flex items-center justify-center"
                    aria-label="Iniciar sesión para agregar servicio"
                >
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                  Agregar Servicio (Miembros)
                </button>
            )}
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-ecuador-blue">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Servicio
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Ciudad
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Sitio / Red
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{service.serviceName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.type === ServiceType.OFERTA ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.type}
                    </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {isAuthenticated ? service.contact : (
                            <span className="text-gray-400 flex items-center">
                        <LockClosedIcon className="w-4 h-4 mr-1" /> Solo Miembros
                      </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{service.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isAuthenticated ? (
                            service.website ? (
                                <a
                                    href={service.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ecuador-blue hover:text-blue-700 hover:underline"
                                >
                                  {service.websiteText || 'Visitar'}
                                </a>
                            ) : (
                                <span className="text-gray-400">No disponible</span>
                            )
                        ) : (
                            <span className="text-gray-400 flex items-center">
                        <LockClosedIcon className="w-4 h-4 mr-1" /> Solo Miembros
                      </span>
                        )}
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No se encontraron servicios que coincidan con los filtros seleccionados.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
};