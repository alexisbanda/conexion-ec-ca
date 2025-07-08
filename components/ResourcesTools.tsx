import React, { useState, useContext } from 'react'; // Import useContext
import { Resource, Tool, ModalState, ModalContentType } from '../types';
import { ECUADOR_COLORS } from '../constants';
import { BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ScaleIcon, MapPinIcon, LinkIcon, LockClosedIcon } from './icons'; // Import LockClosedIcon
import { Modal } from './Modal';
import { CommunityDirectory } from './CommunityDirectory';
import { AuthContext } from '../contexts/AuthContext'; // Import AuthContext

// Datos de Recursos
const resourcesData: Resource[] = [
  {
    id: 'res2',
    icon: <AcademicCapIcon className="w-10 h-10" />,
    title: 'Recursos Educativos',
    description: 'Encuentra programas de estudio, becas y cómo validar tus títulos.',
    details: 'Explora opciones para continuar tu educación en Canadá. Información sobre universidades, colleges, programas de ESL, becas disponibles para estudiantes internacionales y el proceso de evaluación de credenciales educativas (ECA).'
  },
  {
    id: 'res3',
    icon: <HomeIcon className="w-10 h-10" />,
    title: 'Búsqueda de Vivienda',
    description: 'Consejos y plataformas para encontrar tu nuevo hogar en Canadá.',
    details: 'Te ofrecemos estrategias para buscar alquileres, entender los tipos de vivienda, interpretar contratos de arrendamiento y conocer tus derechos como inquilino. Incluye enlaces a sitios web populares de búsqueda de vivienda.'
  },
  {
    id: 'res5',
    icon: <BriefcaseIcon className="w-10 h-10" />,
    title: 'Guía Legal para Inmigrantes (Premium)',
    description: 'Acceso a información legal detallada sobre derechos y obligaciones en Canadá.',
    details: 'Esta guía exclusiva para miembros cubre aspectos legales clave, como el sistema de leyes laborales, derechos del consumidor y cómo acceder a servicios legales gratuitos o de bajo costo. Solo para miembros.',
    isPremium: true // <-- MARCADO COMO PREMIUM
  },
  {
    id: 'res6',
    icon: <AcademicCapIcon className="w-10 h-10" />,
    title: 'Plantillas de CV Canadiense (Premium)',
    description: 'Descarga plantillas de currículum vitae y cartas de presentación adaptadas al formato canadiense.',
    details: 'Optimiza tu búsqueda de empleo con nuestras plantillas profesionales. Incluyen ejemplos y consejos para destacar tus habilidades y experiencia de acuerdo con las expectativas del mercado laboral canadiense. Solo para miembros.',
    isPremium: true // <-- MARCADO COMO PREMIUM
  },
];

// Placeholder Tool Components (mantienen su funcionalidad simulada)
const CurrencyConverterTool: React.FC = () => (
    <div>
      <p className="mb-4 text-sm text-gray-600">Convierte divisas fácilmente. (Herramienta en desarrollo)</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">De:</label>
          <select id="fromCurrency" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
            <option>USD</option><option>CAD</option><option>EUR</option>
          </select>
          <input type="number" placeholder="Cantidad" className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
        </div>
        <div>
          <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-1">A:</label>
          <select id="toCurrency" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
            <option>CAD</option><option>USD</option><option>EUR</option>
          </select>
          <input type="number" placeholder="Resultado" readOnly className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
        </div>
      </div>
      <button className="mt-4 bg-ecuador-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Convertir (Simulado)</button>
    </div>
);

const UnitConverterTool: React.FC = () => (
    <div>
      <p className="mb-4 text-sm text-gray-600">Convierte unidades de medida comunes. (Herramienta en desarrollo)</p>
      {/* Basic UI structure */}
      <p>Ej. Celsius a Fahrenheit, Kilogramos a Libras, etc.</p>
      <input type="text" placeholder="Valor a convertir" className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
      <button className="mt-4 bg-ecuador-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Convertir (Simulado)</button>
    </div>
);

// Datos de Herramientas
const toolsData: Tool[] = [
  { id: 'tool1', icon: <CurrencyDollarIcon className="w-10 h-10" />, title: 'Conversor de Divisas', description: 'Calcula tipos de cambio actualizados entre diferentes monedas.', modalContent: <CurrencyConverterTool /> },
  { id: 'tool2', icon: <ScaleIcon className="w-10 h-10" />, title: 'Conversor de Medidas', description: 'Convierte unidades de peso, longitud, temperatura y más.', modalContent: <UnitConverterTool /> },
  {
    id: 'tool3',
    icon: <MapPinIcon className="w-10 h-10" />,
    title: 'Directorio Comunitario',
    description: 'Encuentra negocios y servicios ofrecidos por miembros de la comunidad.',
    modalContent: <CommunityDirectory />,
    isPremium: true // <-- MARCADO COMO PREMIUM (acceso completo y añadir servicio)
  },
];

export const ResourcesTools: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const authContext = useContext(AuthContext); // Usar AuthContext

  const openResourceModal = (resource: Resource) => {
    // Si el recurso es premium y el usuario NO está autenticado
    if (resource.isPremium && !authContext?.isAuthenticated) {
      authContext?.openLoginModal(); // Abrir modal de login
      return; // Detener la ejecución
    }
    setModalState({
      isOpen: true,
      title: resource.title,
      content: <p className="text-gray-600 whitespace-pre-line">{resource.details || resource.description}</p>,
      type: ModalContentType.RESOURCE_DETAILS,
      fullWidth: false,
    });
  };

  const openToolModal = (tool: Tool) => {
    // Si la herramienta es premium y el usuario NO está autenticado
    if (tool.isPremium && !authContext?.isAuthenticated) {
      authContext?.openLoginModal(); // Abrir modal de login
      return; // Detener la ejecución
    }
    const isCommunityDirectory = tool.id === 'tool3';
    setModalState({
      isOpen: true,
      title: tool.title,
      content: tool.modalContent,
      type: isCommunityDirectory ? ModalContentType.COMMUNITY_DIRECTORY : ModalContentType.TOOL_CONTENT,
      fullWidth: isCommunityDirectory, // Set fullWidth to true for the directory
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  return (
      <section id="resources-tools" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Tu Caja de Herramientas en Canadá</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Hemos creado estas guías y utilidades para que tu camino sea más sencillo. Son para ti, úsalas cuando las necesites.
            </p>
          </div>

          {/* Herramientas */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 text-center md:text-left font-montserrat">Herramientas Prácticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {toolsData.map((tool) => (
                  <div
                      key={tool.id}
                      className={`bg-ecuador-blue-light p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center relative ${tool.isPremium && !authContext?.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} // <-- Clases condicionales
                      onClick={() => openToolModal(tool)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(tool)}
                      aria-label={`Abrir herramienta ${tool.title}`}
                  >
                    {/* Overlay para contenido premium */}
                    {tool.isPremium && !authContext?.isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-lg font-bold rounded-lg">
                          <LockClosedIcon className="w-8 h-8 mr-2" />
                          Miembros
                        </div>
                    )}
                    <div className="text-ecuador-red mb-4">{tool.icon}</div>
                    <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{tool.title}</h4>
                    <p className="text-gray-600 text-sm flex-grow">{tool.description}</p>
                    <button className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                      {tool.isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión' : 'Abrir herramienta'} &rarr; {/* <-- Texto de botón condicional */}
                    </button>
                  </div>
              ))}
            </div>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 text-center md:text-left font-montserrat">Recursos Útiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {resourcesData.map((resource) => (
                  <div
                      key={resource.id}
                      className={`bg-ecuador-yellow-light p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center relative ${resource.isPremium && !authContext?.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} // <-- Clases condicionales
                      onClick={() => openResourceModal(resource)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openResourceModal(resource)}
                      aria-label={`Abrir detalles de ${resource.title}`}
                  >
                    {/* Overlay para contenido premium */}
                    {resource.isPremium && !authContext?.isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-lg font-bold rounded-lg">
                          <LockClosedIcon className="w-8 h-8 mr-2" />
                          Miembros
                        </div>
                    )}
                    <div className="text-ecuador-red mb-4">{resource.icon}</div>
                    <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{resource.title}</h4>
                    <p className="text-gray-600 text-sm flex-grow">{resource.description}</p>
                    <button className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                      {resource.isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión' : 'Saber más'} &rarr; {/* <-- Texto de botón condicional */}
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </div>
        <Modal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={modalState.title}
            fullWidth={modalState.fullWidth}
        >
          {modalState.content}
        </Modal>
      </section>
  );
};