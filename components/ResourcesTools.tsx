import React, { useState } from 'react';
import { Resource, Tool, ModalState, ModalContentType } from '../types';
import { ECUADOR_COLORS } from '../constants';
import { BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ScaleIcon, MapPinIcon, LinkIcon } from './icons';
import { Modal } from './Modal';
import { CommunityDirectory } from './CommunityDirectory'; // Import the new component

const resourcesData: Resource[] = [
  { id: 'res1', icon: <BriefcaseIcon className="w-10 h-10" />, title: 'Guía de Migración', description: 'Información esencial sobre visas, permisos de trabajo y residencia en Canadá.', details: 'Nuestra guía completa cubre los diferentes caminos migratorios, requisitos, procesos de solicitud y consejos útiles para navegar el sistema canadiense. Incluye enlaces a fuentes oficiales y checklists.' },
  { id: 'res2', icon: <AcademicCapIcon className="w-10 h-10" />, title: 'Recursos Educativos', description: 'Encuentra programas de estudio, becas y cómo validar tus títulos.', details: 'Explora opciones para continuar tu educación en Canadá. Información sobre universidades, colleges, programas de ESL, becas disponibles para estudiantes internacionales y el proceso de evaluación de credenciales educativas (ECA).' },
  { id: 'res3', icon: <HomeIcon className="w-10 h-10" />, title: 'Búsqueda de Vivienda', description: 'Consejos y plataformas para encontrar tu nuevo hogar en Canadá.', details: 'Te ofrecemos estrategias para buscar alquileres, entender los tipos de vivienda, interpretar contratos de arrendamiento y conocer tus derechos como inquilino. Incluye enlaces a sitios web populares de búsqueda de vivienda.' },
  { id: 'res4', icon: <LinkIcon className="w-10 h-10" />, title: 'Servicios de Asentamiento', description: 'Conecta con organizaciones que ofrecen apoyo gratuito a recién llegados.', details: 'Un directorio de agencias de asentamiento financiadas por el gobierno que proporcionan servicios gratuitos como orientación, clases de idiomas, talleres de empleo y más.' },
];

// Placeholder Tool Components
const CurrencyConverterTool: React.FC = () => (
  <div>
    <p className="mb-4 text-sm text-gray-600">Convierte divisas fácilmente. (Herramienta en desarrollo)</p>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700">De:</label>
        <select id="fromCurrency" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
          <option>USD</option><option>CAD</option><option>EUR</option>
        </select>
        <input type="number" placeholder="Cantidad" className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
      </div>
      <div>
        <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700">A:</label>
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


const toolsData: Tool[] = [
  { id: 'tool1', icon: <CurrencyDollarIcon className="w-10 h-10" />, title: 'Conversor de Divisas', description: 'Calcula tipos de cambio actualizados entre diferentes monedas.', modalContent: <CurrencyConverterTool /> },
  { id: 'tool2', icon: <ScaleIcon className="w-10 h-10" />, title: 'Conversor de Medidas', description: 'Convierte unidades de peso, longitud, temperatura y más.', modalContent: <UnitConverterTool /> },
  { id: 'tool3', icon: <MapPinIcon className="w-10 h-10" />, title: 'Directorio Comunitario', description: 'Encuentra negocios y servicios ofrecidos por miembros de la comunidad.', modalContent: <CommunityDirectory /> },
];

export const ResourcesTools: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const openResourceModal = (resource: Resource) => {
    setModalState({
      isOpen: true,
      title: resource.title,
      content: <p className="text-gray-600 whitespace-pre-line">{resource.details || resource.description}</p>,
      type: ModalContentType.RESOURCE_DETAILS,
      fullWidth: false,
    });
  };
  
  const openToolModal = (tool: Tool) => {
    // Check if the tool is the Community Directory to set fullWidth
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
          <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Recursos y Herramientas</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Accede a información valiosa y herramientas prácticas diseñadas para ayudarte en tu día a día.
          </p>
        </div>

        {/* Recursos */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 text-center md:text-left font-montserrat">Recursos Útiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resourcesData.map((resource) => (
              <div 
                key={resource.id} 
                className="bg-ecuador-yellow-light p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center"
                onClick={() => openResourceModal(resource)}
                role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openResourceModal(resource)}
                aria-label={`Abrir detalles de ${resource.title}`}
              >
                <div className="text-ecuador-red mb-4">{resource.icon}</div>
                <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{resource.title}</h4>
                <p className="text-gray-600 text-sm flex-grow">{resource.description}</p>
                 <button className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                    Saber más &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Herramientas */}
        <div>
          <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 text-center md:text-left font-montserrat">Herramientas Prácticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toolsData.map((tool) => (
              <div 
                key={tool.id} 
                className="bg-ecuador-blue-light p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center"
                onClick={() => openToolModal(tool)}
                role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(tool)}
                aria-label={`Abrir herramienta ${tool.title}`}
              >
                <div className="text-ecuador-red mb-4">{tool.icon}</div>
                <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{tool.title}</h4>
                <p className="text-gray-600 text-sm flex-grow">{tool.description}</p>
                <button className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                    Abrir herramienta &rarr;
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
        fullWidth={modalState.fullWidth} // Pass fullWidth to Modal
      >
        {modalState.content}
      </Modal>
    </section>
  );
};
