import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Benefit } from '../types';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { regions } from './NationalRegionSelector';
import { Testimonials } from './Testimonials';

// --- DATA --- //
const benefitsData: Benefit[] = [
  {
    id: '1',
    icon: <UserGroupIcon />,
    title: 'Encuentra a tu Gente',
    shortDescription: 'Accede a una red de profesionales y emprendedores ecuatorianos.',
    detailedDescription: '¿Imaginas tener a tu alcance una red de profesionales y emprendedores ecuatorianos listos para colaborar? Conviértete en miembro y obtén acceso privilegiado a nuestro Directorio Comunitario.',
    imageUrl: '/assets/images/red_contactos.png',
    actionType: 'directory',
  },
  {
    id: '2',
    icon: <BriefcaseIcon />,
    title: 'Impulsa tu Carrera',
    shortDescription: 'Bolsa de trabajo con ofertas exclusivas y talleres prácticos.',
    detailedDescription: 'Tu próximo gran paso profesional empieza aquí. Te damos las herramientas para conquistar el mercado laboral canadiense: acceso a una bolsa de trabajo con ofertas exclusivas y talleres prácticos.',
    imageUrl: '/assets/images/oportunidades_laborales.png',
    actionType: 'addEvent',
  },
  {
    id: '3',
    icon: <CurrencyDollarIcon />,
    title: 'Haz Crecer tu Negocio',
    shortDescription: 'Gana visibilidad y conéctate con una red de clientes que confían en ti.',
    detailedDescription: 'Te ofrecemos la plataforma perfecta para que toda la comunidad ecuatoriana en {regionName} conozca tu talento. Gana visibilidad y conéctate con una red de clientes que confían en ti.',
    imageUrl: '/assets/images/evento_networking.png',
    actionType: 'addService',
  },
  {
    id: '4',
    icon: <HomeIcon />,
    title: 'Tu Hogar en {regionName}',
    shortDescription: 'Guías para vivienda, contratos de alquiler y derechos de inquilino.',
    detailedDescription: 'Te acompañamos en cada paso con guías claras para buscar vivienda, entender los contratos de alquiler y conocer tus derechos como inquilino. Siéntete seguro y en casa desde el primer día.',
    imageUrl: '/assets/images/apoyo_vivienda.png',
    actionType: 'mySpace',
  },
  {
    id: '5',
    icon: <AcademicCapIcon />,
    title: 'Apoyo Educativo',
    shortDescription: 'Navega el sistema educativo, postula a becas y convalida títulos.',
    detailedDescription: 'Te proporcionamos el mapa para navegar el sistema educativo: desde elegir el programa perfecto y postular a becas, hasta el crucial proceso de convalidación de tus títulos.',
    imageUrl: '/assets/images/apoyo_educativo.png',
    actionType: 'mySpace',
  },
];

export const Benefits: React.FC = () => {
  const { region: regionId } = useParams<{ region: string }>();
  const region = regions.find(r => r.id === regionId);
  const regionName = region ? region.name : 'Canadá';
  const navigate = useNavigate();

  const [activeBenefitId, setActiveBenefitId] = useState<string>(benefitsData[0].id);
  const benefitRefs = useRef<Map<string, HTMLElement>>(new Map());
  const auth = useContext(AuthContext);

  const [[mobileBenefitIndex, direction], setMobileBenefitState] = useState([0, 0]);

  const paginateMobile = (newDirection: number) => {
    let newIndex = mobileBenefitIndex + newDirection;
    if (newIndex < 0) newIndex = benefitsData.length - 1;
    else if (newIndex >= benefitsData.length) newIndex = 0;
    setMobileBenefitState([newIndex, newDirection]);
  };

  const setMobileIndex = (newIndex: number) => {
    const newDirection = newIndex > mobileBenefitIndex ? 1 : -1;
    setMobileBenefitState([newIndex, newDirection]);
  }

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveBenefitId(entry.target.id)),
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    const currentRefs = benefitRefs.current;
    currentRefs.forEach((el) => el && observer.observe(el));
    return () => currentRefs.forEach((el) => el && observer.unobserve(el));
  }, []);

  const handleTitleClick = (id: string) => {
    benefitRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const renderBenefitAction = (benefit: Benefit) => {
    if (!auth?.isAuthenticated) {
      return (
        <motion.button
          onClick={() => auth?.openRegisterModal()}
          className="mt-8 bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } },
          }}
        >
          ¡Quiero ser miembro!
        </motion.button>
      );
    }

    let actionText = '';
    let actionFunc: (() => void) | undefined;

    switch (benefit.actionType) {
      case 'directory':
        actionText = 'Abrir Directorio';
        actionFunc = auth?.openDirectoryModal;
        break;
      case 'addEvent':
        actionText = 'Crear Evento';
        actionFunc = auth?.openAddEventModal;
        break;
      case 'addService':
        actionText = 'Ofrecer Servicio';
        actionFunc = auth?.openAddServiceModal;
        break;
      case 'mySpace':
        actionText = 'Ir a Mi Espacio';
        actionFunc = () => navigate('/dashboard');
        break;
      default:
        return null;
    }

    return (
      <motion.button
        onClick={() => actionFunc && actionFunc()}
        className="mt-8 bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } },
        }}
      >
        {actionText}
      </motion.button>
    );
  };

  const renderMobileBenefitAction = () => {
    const benefit = benefitsData[mobileBenefitIndex];
    if (!auth?.isAuthenticated) {
        return (
            <button onClick={() => auth?.openRegisterModal()} className="bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
                ¡Quiero ser miembro!
            </button>
        );
    }

    let actionText = '';
    let actionFunc: (() => void) | undefined;

    switch (benefit.actionType) {
        case 'directory':
            actionText = 'Abrir Directorio';
            actionFunc = auth?.openDirectoryModal;
            break;
        case 'addEvent':
            actionText = 'Crear Evento';
            actionFunc = auth?.openAddEventModal;
            break;
        case 'addService':
            actionText = 'Ofrecer Servicio';
            actionFunc = auth?.openAddServiceModal;
            break;
        case 'mySpace':
            actionText = 'Ir a Mi Espacio';
            actionFunc = () => navigate('/dashboard');
            break;
        default:
            return null;
    }

    return (
        <button onClick={() => actionFunc && actionFunc()} className="bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
            {actionText}
        </button>
    );
  };

  return (
    <section id="benefits" className="bg-gray-50">
      {/* --- BENEFITS SECTION --- */}
      <div className="hidden md:flex md:gap-16 max-w-7xl mx-auto px-6">
          <div className="md:w-1/3">
              <div className="sticky top-0 flex flex-col justify-center h-screen py-8">
                  <div className="mb-12 text-left">
                      <h2 className="text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Un Ecosistema de Apoyo Real</h2>
                      <p className="text-lg text-gray-600">Más que una membresía, es tu acceso a un conjunto de herramientas y conexiones para el éxito en {regionName}.</p>
                  </div>
                  {benefitsData.map((benefit) => (
                      <div
                          key={benefit.id}
                          onClick={() => handleTitleClick(benefit.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ease-in-out mb-3 ${activeBenefitId === benefit.id ? 'bg-white shadow-lg scale-105' : 'bg-transparent hover:bg-gray-200/50'}`}>
                          <div className="flex items-center">
                              <div className={`p-3 rounded-full transition-colors duration-300 ${activeBenefitId === benefit.id ? 'bg-ecuador-yellow' : 'bg-gray-200'}`}>
                                  {React.cloneElement(benefit.icon, { className: `w-6 h-6 transition-colors duration-300 ${activeBenefitId === benefit.id ? 'text-ecuador-blue' : 'text-gray-600'}` })}
                              </div>
                              <h3 className={`ml-4 text-lg font-semibold transition-colors duration-300 ${activeBenefitId === benefit.id ? 'text-ecuador-blue' : 'text-gray-600'}`}>{benefit.title.replace('{regionName}', regionName)}</h3>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          <div className="md:w-2/3">
              {benefitsData.map((benefit) => (
                  <div key={benefit.id} id={benefit.id} ref={(el) => el && benefitRefs.current.set(benefit.id, el)} className="flex items-center min-h-screen">
                      <motion.div 
                          className="w-full h-[70vh] rounded-3xl shadow-2xl overflow-hidden relative flex items-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.5 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                      >
                          <img src={benefit.imageUrl} alt={benefit.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          <motion.div 
                              className="relative p-8 md:p-12 text-white w-full"
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true, amount: 0.6 }}
                              transition={{ staggerChildren: 0.2 }}
                          >
                              <motion.h3 
                                  className="text-4xl lg:text-5xl font-bold font-montserrat mb-4"
                                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                              >
                                  {benefit.title.replace('{regionName}', regionName)}
                              </motion.h3>
                              <motion.p 
                                  className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl"
                                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
                              >
                                  {benefit.detailedDescription.replace('{regionName}', regionName)}
                              </motion.p>
                              {renderBenefitAction(benefit)}
                          </motion.div>
                      </motion.div>
                  </div>
              ))}
          </div>
      </div>

      <Testimonials regionName={regionName} />

      {/* --- Mobile-only Benefit Carousel --- */}
      <div className="md:hidden container mx-auto px-4 py-12">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Un Ecosistema de Apoyo Real</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Más que una membresía, es tu acceso a un conjunto de herramientas y conexiones para el éxito en {regionName}.
            </p>
        </div>

        <div className="relative h-[550px] sm:h-[600px] flex items-center">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={mobileBenefitIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                        if (Math.abs(offset.x) > 50) {
                            paginateMobile(offset.x > 0 ? -1 : 1);
                        }
                    }}
                    className="absolute w-full"
                >
                    <div className="text-center px-4">
                        <img 
                            src={benefitsData[mobileBenefitIndex].imageUrl} 
                            alt={benefitsData[mobileBenefitIndex].title.replace('{regionName}', regionName)} 
                            className="w-full h-auto max-h-[35vh] object-contain rounded-2xl shadow-xl mb-6" 
                        />
                        <h3 className="text-2xl font-bold text-ecuador-blue mb-3">
                            {benefitsData[mobileBenefitIndex].title.replace('{regionName}', regionName)}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm">
                            {benefitsData[mobileBenefitIndex].detailedDescription.replace('{regionName}', regionName)}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            <button onClick={() => paginateMobile(-1)} className="absolute top-1/2 -translate-y-1/2 left-1 bg-white/50 hover:bg-white/80 backdrop-blur-sm text-ecuador-blue rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10 shadow-md" aria-label="Anterior beneficio">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={() => paginateMobile(1)} className="absolute top-1/2 -translate-y-1/2 right-1 bg-white/50 hover:bg-white/80 backdrop-blur-sm text-ecuador-blue rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10 shadow-md" aria-label="Siguiente beneficio">
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex justify-center gap-3 mt-4">
            {benefitsData.map((_, i) => (
                <button 
                    key={i} 
                    onClick={() => setMobileIndex(i)} 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${mobileBenefitIndex === i ? 'bg-ecuador-yellow scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Ir al beneficio ${i + 1}`}
                />
            ))}
        </div>

        <div className="text-center pt-8">
            {renderMobileBenefitAction()}
        </div>
      </div>
    </section>
  );
};