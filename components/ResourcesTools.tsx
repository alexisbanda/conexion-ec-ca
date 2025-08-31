import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { regions } from './NationalRegionSelector';
import { Guide, Tool, ModalState, ModalContentType, GuideStage } from '../types';
import { BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ScaleIcon, MapPinIcon, LockClosedIcon, ChevronDownIcon, HeartIcon, BookOpenIcon, UsersIcon, GlobeAltIcon, DocumentCheckIcon, GiftIcon, IdeaIcon, TagIcon, ChevronRightIcon, BuildingLibraryIcon, ArrowTrendingUpIcon, SparklesIcon, CheckCircleIcon } from './icons';
import { Modal } from './Modal';
import { CommunityDirectory } from './CommunityDirectory';
import { AuthContext } from '../contexts/AuthContext';
import { AdSlot } from './AdSlot';
import regionalToolsConfig from '../regionalToolsConfig.json';
import { EmailGateForm } from './EmailGateForm';
import { getPublicGuides } from '../services/guideService'; // IMPORTAMOS EL NUEVO SERVICIO
import { DEFAULT_REGION } from '../constants';

const iconMap: { [key: string]: React.ReactElement } = {
  GiftIcon: <GiftIcon className="w-10 h-10" />,
  IdeaIcon: <IdeaIcon className="w-10 h-10" />,
  // Añadimos iconos genéricos para las guías
  BriefcaseIcon: <BriefcaseIcon className="w-10 h-10" />,
  AcademicCapIcon: <AcademicCapIcon className="w-10 h-10" />,
  HomeIcon: <HomeIcon className="w-10 h-10" />,
  CurrencyDollarIcon: <CurrencyDollarIcon className="w-10 h-10" />,
  BookOpenIcon: <BookOpenIcon className="w-10 h-10" />,
  UsersIcon: <UsersIcon className="w-10 h-10" />,
  ArrowTrendingUpIcon: <ArrowTrendingUpIcon className="w-10 h-10" />,
  BuildingLibraryIcon: <BuildingLibraryIcon className="w-10 h-10" />,
  SparklesIcon: <SparklesIcon className="w-10 h-10" />,
};

// Función para obtener un ícono basado en el título o etapa de la guía
const getIconForGuide = (guide: Guide): React.ReactElement => {
    const title = guide.title.toLowerCase();
    if (title.includes('vivienda') || title.includes('casa')) return iconMap.HomeIcon;
    if (title.includes('laboral') || title.includes('empleo') || title.includes('emprendimiento')) return iconMap.BriefcaseIcon;
    if (title.includes('finanzas') || title.includes('crédito') || title.includes('inversiones')) return iconMap.CurrencyDollarIcon;
    if (title.includes('títulos') || title.includes('ciudadanía')) return iconMap.AcademicCapIcon;
    if (title.includes('comunitaria')) return iconMap.UsersIcon;
    return iconMap.BookOpenIcon; // Icono por defecto
};


interface RedirectPromptProps {
    toolName: string;
    url: string;
    onClose: () => void;
}

const RedirectPrompt: React.FC<RedirectPromptProps> = ({ toolName, url, onClose }) => {
    const handleRedirect = () => {
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="text-center p-6 space-y-4">
            <h4 className="text-xl font-bold text-gray-800">Acceder a {toolName}</h4>
            <p className="text-gray-700">
                Estás a punto de ser redirigido a un sitio web externo para utilizar esta herramienta.
            </p>
            <p className="text-sm text-gray-500">
                Al continuar, abandonas el portal de Conexión EC-CA.
            </p>
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={onClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-2xl transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleRedirect}
                    className="bg-ecuador-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl transition-colors"
                >
                    Continuar al sitio
                </button>
            </div>
        </div>
    );
};

export const ResourcesTools: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<GuideStage>('Recién Llegado');
  const authContext = useContext(AuthContext);

  // --- NUEVOS ESTADOS PARA DATOS DINÁMICOS ---
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);


  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const location = useLocation();
  const currentRegion = regions.find(r => r.path === location.pathname);
  const regionName = currentRegion ? currentRegion.name : DEFAULT_REGION;
  const regionId = currentRegion ? currentRegion.id : 'default';

  // --- CARGA DE DATOS DESDE FIRESTORE --- 
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoadingGuides(true);
        // Pasamos el nombre de la región actual al servicio para que filtre
        const fetchedGuides = await getPublicGuides(regionName);
        setGuides(fetchedGuides);
      } catch (error) {
        console.error("Error cargando las guías:", error);
        toast.error("No se pudieron cargar las guías en este momento.");
      } finally {
        setIsLoadingGuides(false);
      }
    };
    fetchGuides();
  }, [regionName]); // Se ejecuta de nuevo si la región cambia


  const toolsData = useMemo(() => {
    const regionalConfig = regionalToolsConfig[regionId as keyof typeof regionalToolsConfig] || regionalToolsConfig.default;
    const getToolConfig = (toolKey: 'tool4a' | 'tool5a') => {
      const config = regionalConfig[toolKey];
      return {
        ...config,
        icon: iconMap[config.icon as keyof typeof iconMap],
        modalContent: (onClose: any) => <RedirectPrompt toolName={config.title} url={config.url} onClose={onClose} />,
      };
    };

    return [
      {
        id: 'tool3',
        icon: <MapPinIcon className="w-10 h-10" />,
        title: 'Directorio Comunitario',
        description: 'Encuentra negocios y servicios ofrecidos por miembros de la comunidad.',
        modalContent: <CommunityDirectory />,
        isPremium: true,
        isFeatured: true,
        ctaText: 'Abrir Directorio'
      },
      { id: 'tool4a', ...getToolConfig('tool4a'), isPremium: false },
      { id: 'tool5a', ...getToolConfig('tool5a'), isPremium: false },
      {
        id: 'tool4',
        icon: <GlobeAltIcon className="w-10 h-10" />,
        title: 'Portal Oficial IRCC',
        description: 'Accede a información oficial sobre inmigración, visas y ciudadanía.',
        modalContent: (onClose: any) => <RedirectPrompt toolName="Portal Oficial IRCC" url="https://www.canada.ca/en/immigration-refugees-citizenship.html" onClose={onClose} />,
        isPremium: false,
        ctaText: 'Visitar IRCC'
      },
      {
        id: 'tool5',
        icon: <BriefcaseIcon className="w-10 h-10" />,
        title: 'Bolsa de Empleo Nacional',
        description: 'Explora miles de ofertas de trabajo en todo Canadá.',
        modalContent: (onClose: any) => <RedirectPrompt toolName="Job Bank de Canadá" url="https://www.jobbank.gc.ca/" onClose={onClose} />,
        isPremium: false,
        ctaText: 'Ir a Job Bank'
      },
      {
        id: 'tool7',
        icon: <CurrencyDollarIcon className="w-10 h-10" />,
        title: 'Conversor USD-CAD',
        description: 'Tasa de cambio entre monedas en tiempo real.',
        modalContent: (onClose: any) => <RedirectPrompt toolName="Conversor de Divisas" url="https://www.xe.com/currencyconverter/" onClose={onClose} />,
        isPremium: false,
        ctaText: 'Abrir Conversor'
      },
      {
        id: 'tool8',
        icon: <HeartIcon className="w-10 h-10" />,
        title: 'Recursos Salud Mental',
        description: 'Directorio de apoyo psicológico y bienestar en tu comunidad.',
        modalContent: (onClose: any) => <RedirectPrompt toolName="Recursos de Salud Mental" url="https://www.camh.ca/en/professionals/professionals--projects/immigrant-and-refugee-mental-health-project" onClose={onClose} />,
        isPremium: false,
        ctaText: 'Ver Recursos'
      },
    ];
  }, [regionId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const titleVariants = {
      hidden: { y: -20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.6
        }
      }
    };

  // YA NO SE USA LA DATA HARCODEADA. Se filtra el estado que viene de Firestore.
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => guide.stage === activeTab);
  }, [activeTab, guides]);

  // LÓGICA DE CLIC SIMPLIFICADA
  const handleGuideClick = (guide: Guide) => {
    if (guide.isPremium && !authContext?.isAuthenticated) {
      // Muestra el modal de login para contenido premium
      const modalContent = (
        <div className="text-center p-6 space-y-4">
          <LockClosedIcon className="w-16 h-16 mx-auto text-ecuador-red" />
          <h4 className="text-xl font-bold text-gray-800">Acceso Exclusivo para Miembros</h4>
          <p className="text-gray-700">
            Esta guía es un recurso premium. Para descargarla, por favor, inicia sesión o regístrate.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                closeModal();
                authContext?.openLoginModal();
              }}
              className="bg-ecuador-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                closeModal();
                authContext?.openRegisterModal();
              }}
              className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-2xl transition-colors"
            >
              Regístrate Gratis
            </button>
          </div>
        </div>
      );
      setModalState({ isOpen: true, title: guide.title, content: modalContent });
    } else {
      // Para usuarios logueados o guías gratuitas, abre la URL de descarga directamente.
      // La URL ya es la correcta y viene de Firestore.
      window.open(guide.downloadUrl, '_blank');
    }
  };

  const openToolModal = (tool: Tool) => {
    if (tool.isPremium && !authContext?.isAuthenticated) {
      authContext?.openLoginModal();
      return;
    }

    if (typeof tool.modalContent === 'function') {
        setModalState({
            isOpen: true,
            title: tool.title,
            content: tool.modalContent(closeModal),
            type: ModalContentType.TOOL_CONTENT,
        });
        return;
    }

    const isCommunityDirectory = tool.id === 'tool3';
    setModalState({
      isOpen: true,
      title: tool.title,
      content: tool.modalContent,
      type: isCommunityDirectory ? ModalContentType.COMMUNITY_DIRECTORY : ModalContentType.TOOL_CONTENT,
      fullWidth: isCommunityDirectory,
    });
  };


  return (
      <section id="resources-tools" className="py-14 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-8xl">
        <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={titleVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Tu Caja de Herramientas en {regionName}</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Guías prácticas y herramientas para que tu camino sea más sencillo. Regístrate para acceder a todo el contenido.
            </p>
          </motion.div>

          {/* --- SECCIÓN DE GUÍAS ESENCIALES --- */}
          <div className="mb-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat relative pb-2 border-b-2 border-ecuador-red inline-block whitespace-nowrap">
                    Guías por Etapa
                </h3>

                {/* Mobile Dropdown */}
                <div className="w-full md:hidden relative">
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as GuideStage)}
                        className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-ecuador-yellow"
                        aria-label="Seleccionar etapa de migrante"
                    >
                        {(['Recién Llegado', 'Estableciéndose', 'Residente Establecido'] as GuideStage[]).map(tab => (
                            <option key={tab} value={tab}>{tab}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center gap-2 p-1 rounded-full bg-ecuador-blue-light">
                    {(['Recién Llegado', 'Estableciéndose', 'Residente Establecido'] as GuideStage[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${activeTab === tab ? 'bg-white text-ecuador-blue shadow' : 'text-gray-600 hover:bg-white/60'} px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div
              className="mt-6 flex overflow-x-auto md:overflow-visible space-x-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:space-x-0 [grid-auto-rows:minmax(200px,auto)]"
              key={activeTab} // Add key to re-trigger animations
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {isLoadingGuides ? (
                <p className="col-span-full text-center">Cargando guías...</p>
              ) : (
                filteredGuides.map((guide) => (
                  <motion.div
                      key={guide.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                      className={`w-5/6 md:w-auto flex-shrink-0 bg-ecuador-yellow-light p-6 rounded-2xl shadow-md cursor-pointer flex flex-col items-center text-center relative`}
                      onClick={() => handleGuideClick(guide)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && handleGuideClick(guide)}
                      aria-label={`Abrir detalles de ${guide.title}`}
                  >
                    {guide.isPremium && (
                      <div className="absolute top-2 right-2 flex items-center bg-ecuador-red text-white text-xs font-bold px-2 py-1 rounded-full">
                        <LockClosedIcon className="w-3 h-3 mr-1" /> Exclusivo
                      </div>
                    )}
                    <div className="text-ecuador-red mb-4">{getIconForGuide(guide)}</div>
                    <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{guide.title}</h4>
                    <p className="text-gray-600 text-sm flex-grow">{guide.description}</p>
                    <span className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                      Descargar Guía &rarr;
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          {/* --- SECCIÓN DE HERRAMIENTAS --- */}
          <div>
            <motion.h3
              className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat relative pb-2 border-b-2 border-ecuador-red inline-block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={titleVariants}
            >
                Herramientas del Día a Día
            </motion.h3>
            <motion.div
              className="mt-6 flex overflow-x-auto md:overflow-visible space-x-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:space-x-0 [grid-auto-rows:minmax(200px,auto)]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {toolsData.length > 0 && (
                <motion.div
                    key={toolsData[0].id}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" }}
                    className="w-5/6 md:w-auto flex-shrink-0 lg:col-span-2 lg:row-span-2 rounded-2xl shadow-xl cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group"
                    onClick={() => openToolModal(toolsData[0])}
                    role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(toolsData[0])}
                    aria-label={`Abrir herramienta ${toolsData[0].title}`}
                >
                    <div className="absolute inset-0">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                            alt="Miembros de la comunidad conectando"
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-green-800/90"></div>
                    </div>

                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 transform rotate-45 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                    
                    {toolsData[0].isPremium && !authContext?.isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold rounded-2xl z-20">
                          <LockClosedIcon className="w-8 h-8 mr-2" />
                          Miembros
                        </div>
                    )}

                    <div className="relative z-10 flex flex-col justify-between items-center h-full p-8">
                        <div>
                            <div className="text-white mb-4">{toolsData[0].icon}</div>
                            <h4 className="text-3xl font-bold text-white mb-2">{toolsData[0].title}</h4>
                            <p className="text-green-100 text-base">{toolsData[0].description}</p>
                        </div>
                        <span className="mt-4 text-sm font-semibold text-white hover:text-gray-200 self-center transition-colors">
                            {toolsData[0].isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión' : 'Abrir Herramienta'} &rarr;
                        </span>
                    </div>
                </motion.div>
              )}

              {toolsData.slice(1, 6).map((tool, index) => {
                const layoutClasses = [
                    'lg:col-span-1 lg:row-span-1',
                    'lg:col-span-1 lg:row-span-2',
                    'lg:col-span-1 lg:row-span-1',
                    'lg:col-span-1 lg:row-span-1',
                    'lg:col-span-1 lg:row-span-1',
                ];
                return (
                  <motion.div
                      key={tool.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                      className={`w-5/6 md:w-auto flex-shrink-0 ${layoutClasses[index]} p-6 rounded-2xl shadow-md cursor-pointer flex flex-col items-center text-center relative overflow-hidden
                          ${tool.backgroundImageUrl ? 'bg-cover bg-center' : 'bg-ecuador-blue-light'}
                          ${tool.isPremium && !authContext?.isAuthenticated ? 'cursor-not-allowed' : ''}`}
                      style={tool.backgroundImageUrl ? { backgroundImage: `url(${tool.backgroundImageUrl})` } : {}}
                      onClick={() => openToolModal(tool)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(tool)}
                      aria-label={`Abrir herramienta ${tool.title}`}
                  >
                    {(tool.isPremium && !authContext?.isAuthenticated) || tool.backgroundImageUrl ? (
                        <div className={`absolute inset-0 flex items-center justify-center rounded-2xl z-10 
                                ${tool.isPremium && !authContext?.isAuthenticated ? 'bg-black bg-opacity-50 text-white text-lg font-bold' : 'bg-black bg-opacity-30'}
                                ${tool.backgroundImageUrl ? 'backdrop-blur-sm' : ''}`}>
                            {tool.isPremium && !authContext?.isAuthenticated && (
                                <LockClosedIcon className="w-8 h-8 mr-2" />
                            )}
                        </div>
                    ) : null}

                    <div className="relative z-20 flex flex-col items-center text-center h-full w-full">
                        <div className={`${tool.backgroundImageUrl ? 'text-white' : 'text-ecuador-red'} mb-4`}>{tool.icon}</div>
                        <h4 className={`${tool.backgroundImageUrl ? 'text-white' : 'text-ecuador-blue'} text-lg font-semibold mb-2`}>{tool.title}</h4>
                        <p className={`${tool.backgroundImageUrl ? 'text-gray-200' : 'text-gray-600'} text-sm flex-grow`}>{tool.description}</p>
                        <button className={`mt-4 text-sm font-semibold self-center transition-colors 
                                ${tool.backgroundImageUrl ? 'text-white hover:text-gray-200' : 'text-ecuador-red hover:text-red-700'}`}>
                          {tool.isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión' : tool.ctaText || 'Abrir herramienta'} &rarr;
                        </button>
                    </div>
                  </motion.div>
                )
              })}
               <motion.div variants={itemVariants} className="w-5/6 md:w-auto flex-shrink-0 h-full lg:col-span-2 lg:row-span-1 rounded-2xl">
                <AdSlot location="tools_section_ad_demo" isDemoPlaceholder={true} baseBgColorClass="bg-ecuador-blue-light" className="col-span-1 h-full rounded-2xl" />
              </motion.div>
            </motion.div>
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
