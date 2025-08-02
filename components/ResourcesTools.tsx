import React, { useState, useMemo, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { regions } from './NationalRegionSelector';
import { Resource, Tool, ModalState, ModalContentType } from '../types'; // Asegúrate de que Tool tenga backgroundImageUrl y ctaText
import { BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ScaleIcon, MapPinIcon, LockClosedIcon, ChevronDownIcon, HeartIcon, BookOpenIcon, UsersIcon, GlobeAltIcon, DocumentCheckIcon, GiftIcon, IdeaIcon, TagIcon, ChevronRightIcon } from './icons';
import { Modal } from './Modal';
import { CommunityDirectory } from './CommunityDirectory';
import { AuthContext } from '../contexts/AuthContext';
import { AdSlot } from './AdSlot'; // Importamos el componente AdSlot

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
                <div key={index} className="border rounded-xl">
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

// --- NUEVO COMPONENTE: Redirección a Enlace Externo ---
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

// --- DATOS DE GUÍAS ESENCIALES (MODIFICADOS PARA downloadUrl y answers) ---
// La definición de essentialGuidesData se queda dentro del componente ResourcesTools como antes.

// --- DATOS DE HERRAMIENTAS (REORGANIZADOS Y EXPANDIDOS CON IMÁGENES DE FONDO Y ctaText) ---
const toolsData: Tool[] = [
  { // 1. Directorio Comunitario (DESTACADO AHORA)
    id: 'tool3',
    icon: <MapPinIcon className="w-10 h-10" />,
    title: 'Directorio Comunitario',
    description: 'Encuentra negocios y servicios ofrecidos por miembros de la comunidad.',
    modalContent: <CommunityDirectory />,
    isPremium: true,
    isFeatured: true,
    ctaText: 'Abrir Directorio' // CTA específico
  },
  { // 2. AquiTodoEsGratis (CON IMAGEN DE FONDO)
    id: 'tool4a',
    icon: <GiftIcon className="w-10 h-10" />,
    title: 'Aquí todo es Gratis',
    description: 'Portal donde se ofrece y se pide todo GRATIS!.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Aquí todo es Gratis" url="https://ejemplo.com/aquitodoesgratis" onClose={onClose} />,
    isPremium: false,
    backgroundImageUrl: 'https://picsum.photos/seed/free_stuff/600/400',
    ctaText: 'Ir al Portal Gratis' // CTA específico
  },
  { // 3. GuiaDelEcuatorianoSabido (CON IMAGEN DE FONDO)
    id: 'tool5a',
    icon: <IdeaIcon className="w-10 h-10" />,
    title: 'Guía del Ecuatoriano Sabio',
    description: 'Las mejores sugerencias y tips para los que extrañan el país.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Guía del Ecuatoriano Sabio" url="https://ejemplo.com/guiasabio" onClose={onClose} />,
    isPremium: false,
    backgroundImageUrl: 'https://picsum.photos/seed/wise_ecuadorian/600/400',
    ctaText: 'Ir a la Guía' // CTA específico
  },
  { // 4. Enlace a IRCC
    id: 'tool4',
    icon: <GlobeAltIcon className="w-10 h-10" />,
    title: 'Portal Oficial IRCC',
    description: 'Accede a información oficial sobre inmigración, visas y ciudadanía.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Portal Oficial IRCC" url="https://www.canada.ca/en/immigration-refugees-citizenship.html" onClose={onClose} />,
    isPremium: false,
    ctaText: 'Visitar IRCC' // CTA específico
  },
  { // 5. Enlace a Job Bank
    id: 'tool5',
    icon: <BriefcaseIcon className="w-10 h-10" />,
    title: 'Bolsa de Empleo Nacional',
    description: 'Explora miles de ofertas de trabajo en todo Canadá.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Job Bank de Canadá" url="https://www.jobbank.gc.ca/" onClose={onClose} />,
    isPremium: false,
    ctaText: 'Ir a Job Bank' // CTA específico
  },
  { // 6. Enlace a Conversor de Dinero (Ahora como enlace externo)
    id: 'tool7',
    icon: <CurrencyDollarIcon className="w-10 h-10" />,
    title: 'Conversor USD-CAD',
    description: 'Tasa de cambio entre monedas en tiempo real.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Conversor de Divisas" url="https://www.xe.com/currencyconverter/" onClose={onClose} />,
    isPremium: false,
    ctaText: 'Abrir Conversor' // CTA específico
  },
  { // 7. Enlace a Salud Mental
    id: 'tool8',
    icon: <HeartIcon className="w-10 h-10" />,
    title: 'Recursos Salud Mental',
    description: 'Directorio de apoyo psicológico y bienestar en tu comunidad.',
    modalContent: (onClose: any) => <RedirectPrompt toolName="Recursos de Salud Mental" url="https://www.camh.ca/en/professionals/professionals--projects/immigrant-and-refugee-mental-health-project" onClose={onClose} />,
    isPremium: false,
    ctaText: 'Ver Recursos' // CTA específico
  },
];


export const ResourcesTools: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const authContext = useContext(AuthContext);

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const location = useLocation();
  const currentRegion = regions.find(r => r.path === location.pathname);
  const regionName = currentRegion ? currentRegion.name : 'Canadá';
  const shortName = currentRegion ? currentRegion.shortName : 'CA';

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


  const essentialGuidesData: Resource[] = useMemo(() => ([
    {
      id: 'guide1',
      icon: <HomeIcon className="w-10 h-10" />,
      title: `Guía de Vivienda en ${regionName}`,
      description: 'Aprende a buscar, entender contratos y conocer tus derechos como inquilino.',
      details: `Encontrar tu primer hogar en ${regionName} puede ser un desafío. Esta guía te lleva de la mano, desde la búsqueda inicial hasta la firma del contrato, para que tomes decisiones informadas y seguras.`,
      isPremium: true,
      downloadUrl: `/${shortName}/guia-vivienda-premium.pdf`,
      knowledgePoints: [
          { question: '¿Cuáles son mis derechos y obligaciones como inquilino?', answer: 'Tus derechos incluyen privacidad, un lugar seguro y el derecho a no ser discriminado.' },
          { question: '¿Cómo identificar y evitar estafas de alquiler comunes?', answer: 'Desconfía de precios demasiado bajos, presión para pagar rápido o solicitudes de información personal excesiva.' },
          { question: '¿Qué significan los términos "damage deposit" y "utilities"?', answer: 'El "damage deposit" es un depósito reembolsable por daños. "Utilities" son servicios públicos como luz, agua, gas.' },
          { question: '¿Necesito un historial de crédito para poder alquilar?', answer: 'No siempre es obligatorio, pero ayuda. Puedes ofrecer referencias de empleadores o de arrendadores anteriores.' },
      ]
    },
    {
      id: 'guide2',
      icon: <BriefcaseIcon className="w-10 h-10" />,
      title: `Guía Laboral en ${regionName}`,
      description: `Adapta tu CV, optimiza tu LinkedIn y prepárate para las entrevistas de trabajo en ${regionName}.`,
      details: `El mercado laboral de ${regionName} tiene sus propias reglas. Te enseñamos a "traducir" tu experiencia al formato local, a crear un perfil de LinkedIn que atrae reclutadores y a responder con confianza en las entrevistas.`,
      isPremium: true,
      downloadUrl: `/${shortName}/guia-laboral-premium.pdf`,
      knowledgePoints: [
          { question: `¿Cuál es la diferencia clave entre un "resume" y un CV en ${regionName}?`, answer: `En ${regionName}, "resume" es más común y conciso (1-2 páginas), mientras CV (Curriculum Vitae) es más largo y detallado para academia/investigación.` },
          { question: '¿Cómo responder a la pregunta "Háblame de ti" (Tell me about yourself)?', answer: 'Usa la fórmula "presente-pasado-futuro": quién eres ahora, qué hiciste relevante y qué buscas a futuro.' },
          { question: `¿Debo incluir una foto o mi edad en el currículum en ${regionName}?`, answer: `No, en ${regionName} no se recomienda incluir foto, edad o estado civil para evitar discriminación.` },
          { question: '¿Qué son las "soft skills" y por qué son tan importantes aquí?', answer: 'Son habilidades interpersonales como comunicación, trabajo en equipo, resolución de problemas; son cruciales para el éxito en el ambiente laboral canadiense.' },
      ]
    },
    {
      id: 'guide3',
      icon: <CurrencyDollarIcon className="w-10 h-10" />,
      title: 'Finanzas para Recién Llegados',
      description: 'Abre una cuenta bancaria, entiende el puntaje de crédito y los impuestos básicos.',
      details: `Navegar el sistema financiero es clave para tu estabilidad en ${regionName}. Esta guía desmitifica conceptos como el puntaje de crédito y los impuestos, dándote una base sólida para empezar con el pie derecho.`,
      isPremium: false,
      downloadUrl: `/${shortName}/guia-finanzas-publica.pdf`,
      knowledgePoints: [
          { question: `¿Qué necesito para abrir mi primera cuenta bancaria en ${regionName}?`, answer: `Identificación (pasaporte), prueba de residencia, y tu número de Seguro Social (SIN).` },
          { question: '¿Qué es el "credit score" y cómo empiezo a construirlo desde cero?', answer: 'Es un número que evalúa tu riesgo crediticio. Empieza pagando tus cuentas a tiempo, obteniendo una tarjeta de crédito asegurada y usándola responsablemente.' },
          { question: '¿Tengo que declarar impuestos en mi primer año aunque no haya trabajado?', answer: 'Sí, es recomendable. Puedes recibir beneficios y reembolsos, incluso si tus ingresos son bajos.' },
          { question: '¿Qué son las TFSA y RRSP y cuál me conviene más?', answer: 'TFSA (Tax-Free Savings Account) permite crecer dinero libre de impuestos. RRSP (Registered Retirement Savings Plan) es para ahorros de jubilación con ventajas fiscales. Depende de tus objetivos.' },
      ]
    },
    {
      id: 'guide4',
      icon: <AcademicCapIcon className="w-10 h-10" />,
      title: 'Validación de Títulos',
      description: `Descubre cómo iniciar el proceso para que tu profesión sea reconocida en ${regionName}.`,
      details: `¿Eres ingeniero, médico o contador? El proceso para validar tus credenciales en ${regionName} puede ser complejo. Te damos el mapa inicial con los organismos clave (como WES) y los pasos a seguir para que tu valiosa experiencia sea reconocida aquí.`,
      isPremium: false,
      downloadUrl: `/${shortName}/guia-titulos-publica.pdf`,
      knowledgePoints: [
          { question: '¿Qué es una Evaluación de Credenciales Educativas (ECA) y para qué sirve?', answer: 'Es un informe que verifica que tu diploma extranjero es válido y equivalente a uno canadiense. Se necesita para algunos programas de inmigración.' },
          { question: '¿Cuál es la diferencia entre WES, ICAS e IQAS?', answer: 'Son diferentes organismos de evaluación. WES es el más reconocido para fines de inmigración y empleo general. Los otros son provinciales o para profesiones específicas.' },
          { question: '¿Mi título será reconocido automáticamente o necesito certificaciones adicionales?', answer: 'No siempre es automático. Muchas profesiones están reguladas y requieren licencias o certificaciones adicionales en Canadá.' },
          { question: '¿Dónde puedo encontrar información sobre los cuerpos regulatorios de mi profesión?', answer: 'Cada provincia tiene sus propios organismos reguladores. Busca en el sitio web de CICIC (Canadian Information Centre for International Credentials).' },
      ]
    },
    {
      id: 'guide5',
      icon: <HeartIcon className="w-10 h-10" />,
      title: 'Salud Mental y Bienestar',
      description: `Recursos y apoyo para navegar el bienestar emocional en tu nueva vida en ${regionName}.`,
      details: `La migración puede ser un reto emocional. Esta guía te ofrece herramientas y contactos para cuidar tu salud mental, entender los servicios disponibles y encontrar el apoyo que necesitas para florecer en ${regionName}.`,
      isPremium: false,
      downloadUrl: `/${shortName}/guia-salud-mental.pdf`,
      knowledgePoints: [
          { question: `¿Dónde puedo encontrar apoyo psicológico y culturalmente sensible en ${regionName}?`, answer: `Existen organizaciones comunitarias y servicios de salud mental que ofrecen apoyo en varios idiomas y con perspectiva cultural.` },
          { question: '¿Cómo funciona el sistema de salud mental en Canadá?', answer: 'Generalmente se accede a través de tu médico de cabecera, quien puede referirte a especialistas o servicios comunitarios. Algunos servicios de telemedicina también están disponibles.' },
          { question: '¿Es normal sentirse solo o estresado al emigrar?', answer: 'Sí, es muy común. La adaptación cultural y la separación familiar pueden generar estrés, ansiedad o tristeza. Buscar apoyo es una señal de fortaleza.' },
      ]
    },
    {
      id: 'guide6',
      icon: <BookOpenIcon className="w-10 h-10" />,
      title: 'Navegación Legal Básica',
      description: `Guía simple sobre tus derechos y responsabilidades legales en ${regionName}.`,
      details: `Entender las leyes en ${regionName} es fundamental. Esta guía simplifica conceptos legales clave sobre tus derechos laborales, el sistema judicial y cómo acceder a asistencia legal gratuita si lo necesitas.`,
      isPremium: false,
      downloadUrl: `/${shortName}/guia-legal-basica.pdf`,
      knowledgePoints: [
          { question: `¿Cuáles son mis derechos fundamentales como residente o trabajador en ${regionName}?`, answer: `Derechos laborales (salario mínimo, horas de trabajo, ambiente seguro), derecho a la privacidad, y protección contra la discriminación.` },
          { question: '¿Dónde puedo obtener asistencia legal gratuita o de bajo costo?', answer: 'Organizaciones de Legal Aid, clínicas legales universitarias y algunas ONGs ofrecen servicios gratuitos o a bajo costo para inmigrantes.' },
          { question: '¿Qué es el "common law" y cómo me afecta?', answer: 'Es la ley basada en decisiones judiciales anteriores. Afecta varias áreas, incluyendo relaciones de pareja y derechos de propiedad.' },
      ]
    },
    {
      id: 'guide7',
      icon: <UsersIcon className="w-10 h-10" />,
      title: 'Participación Comunitaria',
      description: `Descubre cómo involucrarte, hacer amigos y expandir tu red en ${regionName}.`,
      details: `La integración va más allá del trabajo. Esta guía te muestra cómo unirte a grupos, participar en eventos locales y encontrar oportunidades de voluntariado para construir tu red social y sentirte parte de la comunidad en ${regionName}.`,
      isPremium: false,
      downloadUrl: `/${shortName}/guia-participacion-comunitaria.pdf`,
      knowledgePoints: [
          { question: `¿Cómo puedo conocer gente nueva en mi ciudad en ${regionName}?`, answer: `Participa en eventos comunitarios, únete a clubes o grupos de interés (ej. a través de Meetup), o a través de voluntariado.` },
          { question: '¿Qué tipos de grupos comunitarios existen para migrantes?', answer: 'Hay grupos basados en nacionalidad, idioma, profesión, pasatiempos, y organizaciones de apoyo a recién llegados.' },
          { question: '¿Por qué es importante el voluntariado para mi integración?', answer: 'Es una excelente forma de ganar experiencia canadiense, mejorar el idioma, hacer contactos y contribuir a la comunidad.' },
      ]
    },
  ]), [regionName, shortName]);


  const openResourceModal = (resource: Resource) => {
    let modalContent;

    if (resource.isPremium && !authContext?.isAuthenticated) {
      modalContent = (
        <div className="text-center p-6 space-y-4">
          <LockClosedIcon className="w-16 h-16 mx-auto text-ecuador-red" />
          <h4 className="text-xl font-bold text-gray-800">Acceso Exclusivo para Miembros</h4>
          <p className="text-gray-700">
            Esta guía es un recurso premium. Para ver el contenido completo y descargarla,
            por favor, inicia sesión o regístrate como miembro de nuestra comunidad.
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
    } else {
      modalContent = (
        <div className="space-y-4">
            <p className="text-gray-600 whitespace-pre-line">{resource.details}</p>
            <h4 className="font-semibold text-gray-800 pt-4 border-t">En esta guía aprenderás sobre:</h4>
            <Accordion
                items={(resource.knowledgePoints || []).map(point => ({
                    title: point.question,
                    content: (
                        <div className="p-4 bg-ecuador-yellow-light rounded-xl">
                            {resource.downloadUrl ? (
                                <>
                                    <p className="text-sm text-gray-700 mb-3">Puedes descargar la guía completa aquí:</p>
                                    <a
                                        href={resource.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-ecuador-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-2xl text-sm transition-transform transform hover:scale-105"
                                    >
                                        Descargar Guía
                                    </a>
                                </>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    {point.answer || 'Contenido disponible al leer. (Descarga no disponible).'}
                                </p>
                            )}
                        </div>
                    )
                }))}
            />
        </div>
      );
    }

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

    // Si la herramienta tiene modalContent como una función (para RedirectPrompt)
    if (typeof tool.modalContent === 'function') {
        setModalState({
            isOpen: true,
            title: tool.title,
            content: tool.modalContent(closeModal), // Pasa closeModal a RedirectPrompt
            type: ModalContentType.TOOL_CONTENT, // O un tipo específico si lo necesitas
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
            {/* Título de sección estilizado */}
            <motion.h3
              className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat relative pb-2 border-b-2 border-ecuador-red inline-block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={titleVariants}
            >
                Guías Esenciales para Recién Llegados
            </motion.h3>
            {/* Contenedor principal de guías */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 [grid-auto-rows:minmax(200px,auto)]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* --- GUÍA DESTACADA (Primera Guía) --- */}
              {essentialGuidesData.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                    key={essentialGuidesData[0].id}
                    className="lg:col-span-2 lg:row-span-1 bg-gradient-to-r from-ecuador-blue to-blue-700 p-6 rounded-2xl shadow-xl cursor-pointer flex items-center relative overflow-hidden group"
                    onClick={() => openResourceModal(essentialGuidesData[0])}
                    role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openResourceModal(essentialGuidesData[0])}
                    aria-label={`Abrir detalles de ${essentialGuidesData[0].title}`}
                >
                    {essentialGuidesData[0].isPremium && (
                        <div className="absolute top-3 right-3 flex items-center bg-ecuador-red text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                            <LockClosedIcon className="w-3 h-3 mr-1" /> Exclusivo
                        </div>
                    )}
                    <div className="mr-5 text-white bg-white/20 p-3 rounded-full">{essentialGuidesData[0].icon}</div>
                    <div className="flex-grow">
                        <h4 className="text-xl font-bold text-white mb-1">{essentialGuidesData[0].title}</h4>
                        <p className="text-blue-100 text-sm">{essentialGuidesData[0].description}</p>
                    </div>
                    <ChevronRightIcon className="w-10 h-10 text-ecuador-yellow ml-5 transform transition-transform group-hover:translate-x-1" />
                </motion.div>
              )}

              {/* --- RESTO DE GUÍAS --- */}
              {essentialGuidesData.slice(1, 6).map((resource, index) => {
                // La guía de validación de títulos ahora es de tamaño normal
                const isWideCard = resource.id === 'guide4_disabled'; // Desactivamos la tarjeta ancha por ahora
                const layoutClasses = isWideCard ? 'lg:col-span-2' : 'lg:col-span-1';
                
                return (
                  <motion.div
                      key={resource.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                      className={`${layoutClasses} bg-ecuador-yellow-light p-6 rounded-2xl shadow-md cursor-pointer flex flex-col items-center text-center relative`}
                      onClick={() => openResourceModal(resource)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openResourceModal(resource)}
                      aria-label={`Abrir detalles de ${resource.title}`}
                  >
                    {resource.isPremium && (
                      <div className="absolute top-2 right-2 flex items-center bg-ecuador-red text-white text-xs font-bold px-2 py-1 rounded-full">
                        <LockClosedIcon className="w-3 h-3 mr-1" /> Con Registro
                      </div>
                    )}
                    <div className="text-ecuador-red mb-4">{resource.icon}</div>
                    <h4 className="text-lg font-semibold text-ecuador-blue mb-2">{resource.title}</h4>
                    <p className="text-gray-600 text-sm flex-grow">{resource.description}</p>
                    <span className="mt-4 text-sm font-semibold text-ecuador-red hover:text-red-700 self-center transition-colors">
                      {resource.isPremium ? 'Acceso Miembros' : resource.downloadUrl ? 'Descargar Guía' : 'Leer Contenido'} &rarr;
                    </span>
                  </motion.div>
                )
              })}
              {/* --- ANUNCIO DE GUÍAS --- */}
              <motion.div variants={itemVariants} className="h-full lg:col-span-1 lg:row-span-1 rounded-2xl">
                <AdSlot location="guides_section_ad_demo" isDemoPlaceholder={true} baseBgColorClass="bg-ecuador-yellow-light" className="col-span-1 h-full rounded-2xl" />
              </motion.div>
            </motion.div>
          </div>

          {/* --- SECCIÓN DE HERRAMIENTAS --- */}
          <div>
            {/* Título de sección estilizado */}
            <motion.h3
              className="text-2xl font-semibold text-ecuador-blue mb-8 font-montserrat relative pb-2 border-b-2 border-ecuador-red inline-block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={titleVariants}
            >
                Herramientas del Día a Día
            </motion.h3>
            {/* Contenedor principal de herramientas */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 [grid-auto-rows:minmax(200px,auto)]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* --- HERRAMIENTA DESTACADA (Directorio Comunitario) --- */}
              {toolsData.length > 0 && (
                <motion.div
                    key={toolsData[0].id}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" }}
                    className="lg:col-span-2 lg:row-span-2 rounded-2xl shadow-xl cursor-pointer flex flex-col justify-between text-center relative overflow-hidden group"
                    onClick={() => openToolModal(toolsData[0])}
                    role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(toolsData[0])}
                    aria-label={`Abrir herramienta ${toolsData[0].title}`}
                >
                    {/* Background Image & Overlay */}
                    <div className="absolute inset-0">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                            alt="Miembros de la comunidad conectando"
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-green-800/90"></div>
                    </div>

                    {/* Elemento decorativo en la esquina */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 transform rotate-45 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                    
                    {/* Premium Lock */}
                    {toolsData[0].isPremium && !authContext?.isAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold rounded-2xl z-20">
                          <LockClosedIcon className="w-8 h-8 mr-2" />
                          Miembros
                        </div>
                    )}

                    {/* Content Container */}
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

              {/* --- RESTO DE HERRAMIENTAS (excluyendo el último item para el anuncio) --- */}
              {toolsData.slice(1, 6).map((tool, index) => {
                const layoutClasses = [
                    'lg:col-span-1 lg:row-span-1', // Herramienta 2
                    'lg:col-span-1 lg:row-span-2', // Herramienta 3 (alta)
                    'lg:col-span-1 lg:row-span-1', // Herramienta 4
                    'lg:col-span-1 lg:row-span-1', // Herramienta 5
                    'lg:col-span-1 lg:row-span-1', // Herramienta 6
                ];
                return (
                  <motion.div
                      key={tool.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                      className={`${layoutClasses[index]} p-6 rounded-2xl shadow-md cursor-pointer flex flex-col items-center text-center relative overflow-hidden
                          ${tool.backgroundImageUrl ? 'bg-cover bg-center' : 'bg-ecuador-blue-light'}
                          ${tool.isPremium && !authContext?.isAuthenticated ? 'cursor-not-allowed' : ''}`}
                      style={tool.backgroundImageUrl ? { backgroundImage: `url(${tool.backgroundImageUrl})` } : {}}
                      onClick={() => openToolModal(tool)}
                      role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && openToolModal(tool)}
                      aria-label={`Abrir herramienta ${tool.title}`}
                  >
                    {/* Overlay para contenido premium o para texto sobre imagen de fondo */}
                    {(tool.isPremium && !authContext?.isAuthenticated) || tool.backgroundImageUrl ? (
                        <div className={`absolute inset-0 flex items-center justify-center rounded-2xl z-10 
                                ${tool.isPremium && !authContext?.isAuthenticated ? 'bg-black bg-opacity-50 text-white text-lg font-bold' : 'bg-black bg-opacity-30'}
                                ${tool.backgroundImageUrl ? 'backdrop-blur-sm' : ''}`}>
                            {tool.isPremium && !authContext?.isAuthenticated && (
                                <LockClosedIcon className="w-8 h-8 mr-2" />
                            )}
                        </div>
                    ) : null}

                    {/* Contenido de la tarjeta sobre el overlay (si hay imagen de fondo) */}
                    <div className="relative z-20 flex flex-col items-center text-center h-full w-full">
                        <div className={`${tool.backgroundImageUrl ? 'text-white' : 'text-ecuador-red'} mb-4`}>{tool.icon}</div>
                        <h4 className={`${tool.backgroundImageUrl ? 'text-white' : 'text-ecuador-blue'} text-lg font-semibold mb-2`}>{tool.title}</h4>
                        <p className={`${tool.backgroundImageUrl ? 'text-gray-200' : 'text-gray-600'} text-sm flex-grow`}>{tool.description}</p>
                        <button className={`mt-4 text-sm font-semibold self-center transition-colors 
                                ${tool.backgroundImageUrl ? 'text-white hover:text-gray-200' : 'text-ecuador-red hover:text-red-700'}`}>
                          {tool.isPremium && !authContext?.isAuthenticated ? 'Iniciar Sesión' : tool.ctaText || 'Abrir herramienta'} &rarr; {/* Usamos tool.ctaText */}
                        </button>
                    </div>
                  </motion.div>
                )
              })}
              {/* --- ANUNCIO DE HERRAMIENTAS --- */}
               <motion.div variants={itemVariants} className="h-full lg:col-span-2 lg:row-span-1 rounded-2xl">
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
