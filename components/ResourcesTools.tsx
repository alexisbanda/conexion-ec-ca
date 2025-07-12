import React, { useState, useContext } from 'react';
import { Resource, Tool, ModalState, ModalContentType } from '../types';
import { BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ScaleIcon, MapPinIcon, LockClosedIcon, ChevronDownIcon } from './icons';
import { Modal } from './Modal';
import { CommunityDirectory } from './CommunityDirectory';
import { AuthContext } from '../contexts/AuthContext';

// --- MEJORA: Componente de Acordeón Reutilizable ---
interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

const Accordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="border rounded-md">
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-gray-50"
                    >
                        <span>{item.title}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openIndex === index && <div className="p-4 border-t bg-gray-50">{item.content}</div>}
                </div>
            ))}
        </div>
    );
};


// --- MEJORA: Contenido de guías enfocado en las necesidades del migrante ---
const essentialGuidesData: Resource[] = [
  {
    id: 'guide1',
    icon: <HomeIcon className="w-10 h-10" />,
    title: 'Guía de Vivienda en BC',
    description: 'Aprende a buscar, entender contratos y conocer tus derechos como inquilino.',
    details: 'Encontrar tu primer hogar en Canadá puede ser un desafío. Esta guía te lleva de la mano, desde la búsqueda inicial hasta la firma del contrato, para que tomes decisiones informadas y seguras.',
    isPremium: true, // Requiere registro para descargar
    knowledgePoints: [
        { question: '¿Cuáles son mis derechos y obligaciones como inquilino en BC?' },
        { question: '¿Cómo identificar y evitar estafas de alquiler comunes?' },
        { question: '¿Qué significan los términos "damage deposit" y "utilities"?' },
        { question: '¿Necesito un historial de crédito para poder alquilar?' },
    ]
  },
  {
    id: 'guide2',
    icon: <BriefcaseIcon className="w-10 h-10" />,
    title: 'Guía Laboral Canadiense',
    description: 'Adapta tu CV, optimiza tu LinkedIn y prepárate para las entrevistas de trabajo.',
    details: 'El mercado laboral canadiense tiene sus propias reglas. Te enseñamos a "traducir" tu experiencia al formato local, a crear un perfil de LinkedIn que atraiga reclutadores y a responder con confianza en las entrevistas.',
    isPremium: true,
    knowledgePoints: [
        { question: '¿Cuál es la diferencia clave entre un "resume" y un CV en Canadá?' },
        { question: '¿Cómo responder a la pregunta "Háblame de ti" (Tell me about yourself)?' },
        { question: '¿Debo incluir una foto o mi edad en el currículum?' },
        { question: '¿Qué son las "soft skills" y por qué son tan importantes aquí?' },
    ]
  },
  {
    id: 'guide3',
    icon: <CurrencyDollarIcon className="w-10 h-10" />,
    title: 'Finanzas para Recién Llegados',
    description: 'Abre una cuenta bancaria, entiende el puntaje de crédito y los impuestos básicos.',
    details: 'Navegar el sistema financiero es clave para tu estabilidad. Esta guía desmitifica conceptos como el puntaje de crédito y los impuestos, dándote una base sólida para empezar con el pie derecho.',
    isPremium: true,
    knowledgePoints: [
        { question: '¿Qué necesito para abrir mi primera cuenta bancaria en Canadá?' },
        { question: '¿Qué es el "credit score" y cómo empiezo a construirlo desde cero?' },
        { question: '¿Tengo que declarar impuestos en mi primer año aunque no haya trabajado?' },
        { question: '¿Qué son las TFSA y RRSP y cuál me conviene más?' },
    ]
  },
  {
    id: 'guide4',
    icon: <AcademicCapIcon className="w-10 h-10" />,
    title: 'Validación de Títulos',
    description: 'Descubre cómo iniciar el proceso para que tu profesión sea reconocida en Canadá.',
    details: '¿Eres ingeniero, médico o contador? El proceso para validar tus credenciales puede ser complejo. Te damos el mapa inicial con los organismos clave (como WES) y los pasos a seguir para que tu valiosa experiencia sea reconocida aquí.',
    isPremium: true,
    knowledgePoints: [
        { question: '¿Qué es una Evaluación de Credenciales Educativas (ECA) y para qué sirve?' },
        { question: '¿Cuál es la diferencia entre WES, ICAS e IQAS?' },
        { question: '¿Mi título será reconocido automáticamente o necesito certificaciones adicionales?' },
        { question: '¿Dónde puedo encontrar información sobre los cuerpos regulatorios de mi profesión?' },
    ]
  },
];

// Placeholder Tool Components (mantienen su funcionalidad simulada)
const CurrencyConverterTool: React.FC = () => (
    <div>
      <p className="mb-4 text-sm text-gray-600">Convierte divisas fácilmente. (Herramienta de demostración)</p>
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
      <button className="mt-4 bg-ecuador-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Convertir</button>
    </div>
);

const UnitConverterTool: React.FC = () => (
    <div>
      <p className="mb-4 text-sm text-gray-600">Convierte unidades de medida comunes. (Herramienta de demostración)</p>
      {/* Basic UI structure */}
      <p>Ej. Celsius a Fahrenheit, Kilogramos a Libras, etc.</p>
      <input type="text" placeholder="Valor a convertir" className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
      <button className="mt-4 bg-ecuador-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Convertir (Simulado)</button>
    </div>
);

// Datos de Herramientas
const toolsData: Tool[] = [
  {
    id: 'tool3',
    icon: <MapPinIcon className="w-10 h-10" />,
    title: 'Directorio Comunitario',
    description: 'Encuentra negocios y servicios ofrecidos por miembros de la comunidad.',
    modalContent: <CommunityDirectory />,
    isPremium: true
  },
  { id: 'tool1', icon: <CurrencyDollarIcon className="w-10 h-10" />, title: 'Conversor de Divisas', description: 'Calcula tipos de cambio entre diferentes monedas.', modalContent: <CurrencyConverterTool /> },
  { id: 'tool2', icon: <ScaleIcon className="w-10 h-10" />, title: 'Conversor de Medidas', description: 'Convierte unidades de peso, longitud, temperatura y más.', modalContent: <UnitConverterTool /> },
];

export const ResourcesTools: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const authContext = useContext(AuthContext); // Usar AuthContext

  const openResourceModal = (resource: Resource) => {
    // El contenido del modal ahora es el acordeón
    const modalContent = (
        <div className="space-y-4">
            <p className="text-gray-600 whitespace-pre-line">{resource.details}</p>
            <h4 className="font-semibold text-gray-800 pt-4 border-t">En esta guía aprenderás sobre:</h4>
            <Accordion
                items={(resource.knowledgePoints || []).map(point => ({
                    title: point.question,
                    content: (
                        <div className="text-center p-4 bg-ecuador-yellow-light rounded-md">
                            <p className="text-sm text-gray-700 mb-3">Para ver la respuesta completa y descargar la guía, necesitas ser miembro de nuestra comunidad.</p>
                            <button
                                onClick={() => {
                                    closeModal(); // Cierra el modal actual
                                    authContext?.openRegisterModal(); // Abre el de registro
                                }}
                                className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-transform transform hover:scale-105"
                            >
                                Regístrate Gratis
                            </button>
                        </div>
                    )
                }))}
            />
        </div>
    );

    setModalState({
      isOpen: true,
      title: resource.title,
      content: modalContent,
      type: ModalContentType.RESOURCE_DETAILS,
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
      <section id="resources-tools" className="py-14 md:py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Tu Caja de Herramientas en Canadá</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Guías prácticas y herramientas para que tu camino sea más sencillo. Regístrate para acceder a todo el contenido.
            </p>
          </div>

          {/* --- SECCIÓN DE GUÍAS ESENCIALES --- */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat">Guías Esenciales para Recién Llegados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {essentialGuidesData.map((resource) => (
                  <div
                      key={resource.id}
                      className="bg-ecuador-yellow-light p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center relative"
                      onClick={() => openResourceModal(resource)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openResourceModal(resource)}
                      aria-label={`Abrir detalles de ${resource.title}`}
                  >
                    <div className="absolute top-2 right-2 flex items-center bg-ecuador-red text-white text-xs font-bold px-2 py-1 rounded-full">
                      <LockClosedIcon className="w-3 h-3 mr-1" /> Con Registro
                    </div>
                    <div className="text-ecuador-red mb-4">{resource.icon}</div>
                    <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{resource.title}</h4>
                    <p className="text-gray-600 text-sm flex-grow">{resource.description}</p>
                    <span className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                      Ver Contenido &rarr;
                    </span>
                  </div>
              ))}
            </div>
          </div>

          {/* --- SECCIÓN DE HERRAMIENTAS --- */}
          <div>
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat">Herramientas del Día a Día</h3>
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