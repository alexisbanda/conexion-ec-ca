import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Benefit, Testimonial } from '../types';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, CurrencyDollarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';
import { regions } from './NationalRegionSelector';

// --- DATA --- //
const benefitsData: Benefit[] = [
  {
    id: '1',
    icon: <UserGroupIcon />,
    title: 'Encuentra a tu Gente',
    detailedDescription: '¿Imaginas tener a tu alcance una red de profesionales y emprendedores ecuatorianos listos para colaborar? Conviértete en miembro y obtén acceso privilegiado a nuestro Directorio Comunitario.',
    imageUrl: '/assets/images/red_contactos.png',
  },
  {
    id: '2',
    icon: <BriefcaseIcon />,
    title: 'Impulsa tu Carrera',
    detailedDescription: 'Tu próximo gran paso profesional empieza aquí. Te damos las herramientas para conquistar el mercado laboral canadiense: acceso a una bolsa de trabajo con ofertas exclusivas y talleres prácticos.',
    imageUrl: '/assets/images/oportunidades_laborales.png',
  },
  {
    id: '3',
    icon: <CurrencyDollarIcon />,
    title: 'Haz Crecer tu Negocio',
    detailedDescription: 'Te ofrecemos la plataforma perfecta para que toda la comunidad ecuatoriana en {regionName} conozca tu talento. Gana visibilidad y conéctate con una red de clientes que confían en ti.',
    imageUrl: '/assets/images/evento_networking.png',
  },
  {
    id: '4',
    icon: <HomeIcon />,
    title: 'Tu Hogar en {regionName}',
    detailedDescription: 'Te acompañamos en cada paso con guías claras para buscar vivienda, entender los contratos de alquiler y conocer tus derechos como inquilino. Siéntete seguro y en casa desde el primer día.',
    imageUrl: '/assets/images/apoyo_vivienda.png',
  },
  {
    id: '5',
    icon: <AcademicCapIcon />,
    title: 'Apoyo Educativo',
    detailedDescription: 'Te proporcionamos el mapa para navegar el sistema educativo: desde elegir el programa perfecto y postular a becas, hasta el crucial proceso de convalidación de tus títulos.',
    imageUrl: '/assets/images/apoyo_educativo.png',
  },
];

const testimonialsData: Testimonial[] = [
    { 
        id: 't1', 
        quote: 'Gracias a Conexión EC-CA, encontré un mentor en mi campo que fue clave para conseguir mi primer trabajo en Toronto. ¡La comunidad es increíblemente solidaria!', 
        author: 'Sofía Martínez', 
        role: 'Ingeniera de Software', 
        imageUrl: 'https://randomuser.me/api/portraits/women/34.jpg' 
    },
    { 
        id: 't2', 
        quote: 'El taller de adaptación de CV fue un antes y un después. En una semana, empecé a recibir llamadas para entrevistas después de meses de silencio. 100% recomendado.', 
        author: 'Carlos Jiménez', 
        role: 'Gerente de Proyectos', 
        imageUrl: 'https://randomuser.me/api/portraits/men/46.jpg' 
    },
    { 
        id: 't3', 
        quote: 'Como emprendedora, el directorio comunitario me dio la visibilidad que necesitaba para lanzar mi negocio de catering. Mis primeros clientes fueron ecuatorianos que encontraron mi perfil aquí.', 
        author: 'Gabriela Andrade', 
        role: 'Fundadora de Sabor de Casa', 
        imageUrl: 'https://randomuser.me/api/portraits/women/22.jpg' 
    },
];

// --- Animation Variants --- //
const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
};

export const Benefits: React.FC = () => {
  const { region: regionId } = useParams<{ region: string }>();
  const region = regions.find(r => r.id === regionId);
  const regionName = region ? region.name : 'Canadá';

  const [activeBenefitId, setActiveBenefitId] = useState<string>(benefitsData[0].id);
  const benefitRefs = useRef<Map<string, HTMLElement>>(new Map());
  const auth = useContext(AuthContext);

  const [[testimonialIndex, direction], setTestimonialState] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    let newIndex = testimonialIndex + newDirection;
    if (newIndex < 0) newIndex = testimonialsData.length - 1;
    else if (newIndex >= testimonialsData.length) newIndex = 0;
    setTestimonialState([newIndex, newDirection]);
  };

  const setTestimonialIndex = (newIndex: number) => {
    const newDirection = newIndex > testimonialIndex ? 1 : -1;
    setTestimonialState([newIndex, newDirection]);
  }

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
  
  const openRegister = () => auth?.openRegisterModal();

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
                              <motion.button
                                  onClick={openRegister}
                                  className="mt-8 bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
                                  variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } } }}
                              >
                                  ¡Quiero ser miembro!
                              </motion.button>
                          </motion.div>
                      </motion.div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- TESTIMONIALS SECTION (CINEMATIC CAROUSEL) --- */}
      <div className="py-16 md:py-24 bg-ecuador-blue text-white">
        <div className="container mx-auto px-6 max-w-4xl">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6 }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">Lo que Nuestra Comunidad Dice</h2>
                <p className="text-lg text-blue-200 max-w-3xl mx-auto">Historias reales de miembros que han transformado su vida en {regionName} con nuestro apoyo.</p>
            </motion.div>
            <div className="relative h-96">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={testimonialIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => { Math.abs(offset.x) > 50 && paginate(offset.x > 0 ? -1 : 1); }}
                        className="absolute w-full h-full bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl flex items-center justify-center"
                    >
                        <div className="text-center max-w-xl">
                            <img src={testimonialsData[testimonialIndex].imageUrl} alt={testimonialsData[testimonialIndex].author} className="w-24 h-24 rounded-full object-cover mx-auto mb-6 border-4 border-ecuador-yellow" />
                            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-6">"{testimonialsData[testimonialIndex].quote}"</p>
                            <div>
                                <p className="font-bold text-xl text-ecuador-yellow">{testimonialsData[testimonialIndex].author}</p>
                                <p className="text-blue-200">{testimonialsData[testimonialIndex].role}</p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between left-0 right-0 px-0 md:-px-16 max-w-5xl mx-auto">
                <button onClick={() => paginate(-1)} className="bg-white/10 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors z-10"><ChevronLeftIcon className="w-6 h-6" /></button>
                <button onClick={() => paginate(1)} className="bg-white/10 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors z-10"><ChevronRightIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex justify-center gap-3 mt-8">
                {testimonialsData.map((_, i) => (
                    <button key={i} onClick={() => setTestimonialIndex(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${testimonialIndex === i ? 'bg-ecuador-yellow scale-125' : 'bg-white/30 hover:bg-white/50'}`} aria-label={`Ir al testimonio ${i + 1}`} />
                ))}
            </div>
        </div>
      </div>

      {/* --- Mobile-only Benefit Display --- */}
      <div className="md:hidden container mx-auto px-6 py-12 space-y-16">
          {benefitsData.map(benefit => (
              <div key={benefit.id} className="text-center">
                  <img src={benefit.imageUrl} alt={benefit.title} className="w-full h-auto max-h-[50vh] object-contain rounded-2xl shadow-xl mb-6" />
                  <h3 className="text-2xl font-bold text-ecuador-blue mb-3">{benefit.title.replace('{regionName}', regionName)}</h3>
                  <p className="text-gray-700 leading-relaxed">{benefit.detailedDescription.replace('{regionName}', regionName)}</p>
              </div>
          ))}
          <div className="text-center pt-8">
              <button onClick={openRegister} className="bg-ecuador-yellow hover:bg-yellow-400 text-ecuador-blue font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">¡Quiero ser miembro!</button>
          </div>
      </div>
    </section>
  );
};