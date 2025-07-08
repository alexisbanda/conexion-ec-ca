import React, { useState, useEffect } from 'react';
import { Benefit, Testimonial as TestimonialType, ModalState, ModalContentType } from '../types';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from './icons';
import { BenefitCard } from './BenefitCard';
import { Modal } from './Modal';

const benefitsData: Benefit[] = [
  {
    id: '1',
    icon: <UserGroupIcon className="w-12 h-12" />,
    title: 'Red de Contactos Exclusiva',
    shortDescription: 'Accede a nuestro Directorio Comunitario y conecta con profesionales y emprendedores ecuatorianos.',
    detailedDescription: '¿Imaginas tener a tu alcance una red de profesionales y emprendedores ecuatorianos listos para colaborar? Conviértete en miembro y obtén acceso privilegiado a nuestro Directorio Comunitario. Encuentra desde un abogado de confianza hasta el mejor sabor de casa. Participa en eventos de networking exclusivos, únete a grupos de interés y descubre a tu próximo socio, mentor o amigo. Aquí, las conexiones se convierten en oportunidades reales.',
    imageUrl: '/assets/images/red_contactos.png',
  },
  {
    id: '2',
    icon: <BriefcaseIcon className="w-12 h-12" />,
    title: 'Oportunidades Laborales',
    shortDescription: 'Bolsa de trabajo, talleres y acceso a plantillas de CV en formato canadiense (Premium).',
    detailedDescription: 'Tu próximo gran paso profesional empieza aquí. Te damos las herramientas para conquistar el mercado laboral canadiense: acceso a una bolsa de trabajo con ofertas exclusivas, talleres prácticos para perfeccionar tu CV y brillar en las entrevistas, y plantillas de currículum premium diseñadas para impresionar. Conéctate directamente con empleadores que buscan tu talento. ¡Deja de buscar y empieza a ser encontrado!',
    imageUrl: '/assets/images/oportunidades_laborales.png',
  },
  {
    id: '3',
    icon: <CurrencyDollarIcon className="w-12 h-12" />,
    title: 'Impulso a Emprendedores',
    shortDescription: 'Promociona tu negocio en nuestro Directorio y accede a una red de clientes potenciales.',
    detailedDescription: 'Tu negocio merece brillar. Te ofrecemos la plataforma perfecta para que toda la comunidad ecuatoriana en Canadá conozca tu talento. Al publicar en nuestro Directorio Comunitario, no solo ganas visibilidad, sino que te conectas con una red de clientes que confían en ti. Participa en ferias y eventos de networking exclusivos donde tu emprendimiento será el protagonista. ¡Es hora de crecer juntos!',
    imageUrl: '/assets/images/emprendedores.png', // Sugerencia: crear una nueva imagen para este beneficio
  },
  {
    id: '4',
    icon: <HomeIcon className="w-12 h-12" />,
    title: 'Asesoría en Vivienda',
    shortDescription: 'Recursos para encontrar alojamiento y contactos de confianza dentro de la comunidad.',
    detailedDescription: 'Sabemos que encontrar tu primer hogar en Canadá puede ser un desafío. ¡No estás solo! Te acompañamos en cada paso con guías claras para buscar vivienda, entender los contratos de alquiler y conocer tus derechos como inquilino. Accede a recomendaciones y contactos de confianza dentro de nuestra comunidad para que te sientas seguro y en casa desde el primer día.',
    imageUrl: '/assets/images/apoyo_vivienda.png',
  },
  {
    id: '5',
    icon: <AcademicCapIcon className="w-12 h-12" />,
    title: 'Apoyo Educativo',
    shortDescription: 'Guías sobre estudios, becas y seminarios web exclusivos sobre convalidación de títulos.',
    detailedDescription: 'Tu futuro académico en Canadá está a tu alcance. Te proporcionamos el mapa para navegar el sistema educativo: desde elegir el programa perfecto y postular a becas, hasta el crucial proceso de convalidación de tus títulos. Como miembro, tendrás acceso a seminarios web exclusivos con expertos y guías paso a paso que te ahorrarán tiempo y esfuerzo. ¡Invierte en tu futuro con el apoyo de tu comunidad!',
    imageUrl: '/assets/images/apoyo_educativo.png',
  },
  {
    id: '6',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12" />,
    title: 'Integración y Cultura',
    shortDescription: 'Eventos culturales exclusivos y asistencia 24/7 con nuestro asistente virtual "Conex".',
    detailedDescription: 'Siéntete más cerca de casa mientras construyes tu futuro. Organizamos eventos culturales, festivales y celebraciones que mantienen vivas nuestras tradiciones y nos unen como familia. Y para tus dudas del día a día, nuestro asistente virtual "Conex" está disponible 24/7 para darte respuestas al instante. Es lo mejor de dos mundos: el calor de nuestra gente y la ayuda que necesitas, cuando la necesitas.',
    imageUrl: '/assets/images/integracion_cultural.png',
  },
];

const testimonialsData: TestimonialType[] = [
  {
    id: 't1',
    quote: 'Llegué a Toronto con un sueño y muchas dudas. Gracias al Directorio Comunitario, no solo conseguí mis primeros clientes como freelancer, sino que los talleres de CV fueron clave para obtener mi trabajo actual en una empresa de tecnología. Conexión Migrante no es solo un grupo, es una verdadera plataforma de lanzamiento.',
    author: 'Javier Mendoza',
    role: 'Ingeniero de Software y Emprendedor',
    imageUrl: 'https://picsum.photos/seed/testimonialuser2/100/100',
  },
  {
    id: 't2',
    quote: 'Como recién llegada, me sentía perdida con el tema de la vivienda. Los recursos y el apoyo de la comunidad fueron vitales para encontrar un lugar seguro para mi familia. ¡La asesoría que recibí no tiene precio!',
    author: 'Ana Lucía Paredes',
    role: 'Diseñadora Gráfica',
    imageUrl: 'https://picsum.photos/seed/testimonialuser3/100/100',
  },
  {
    id: 't3',
    quote: 'Los eventos culturales son mi parte favorita. Me han permitido conocer gente increíble, reconectar con mis raíces y sentirme menos sola en un país nuevo. Es el calor de Ecuador en pleno Canadá.',
    author: 'Carlos Benítez',
    role: 'Estudiante de Postgrado',
    imageUrl: 'https://picsum.photos/seed/testimonialuser4/100/100',
  }
];

export const Benefits: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const openModal = (benefit: Benefit) => {
    setModalState({
      isOpen: true,
      title: benefit.title,
      content: <p className="text-gray-600 whitespace-pre-line">{benefit.detailedDescription}</p>,
      type: ModalContentType.BENEFIT_DETAILS,
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  // Efecto para el carrusel automático de testimonios
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prevActive) => (prevActive + 1) % testimonialsData.length);
    }, 7000); // Cambia de testimonio cada 7 segundos

    return () => clearInterval(timer); // Limpia el intervalo al desmontar el componente
  }, []);

  return (
      <section id="benefits" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Beneficios de Ser Parte</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Al unirte a nuestra comunidad, desbloqueas ventajas exclusivas pensadas para ti y tu familia.            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefitsData.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} onOpenModal={openModal} />
            ))}
          </div>

          {/* Testimonial Section */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold text-ecuador-blue text-center mb-10 font-montserrat">Lo que dicen nuestros miembros</h3>
            <div className="max-w-3xl mx-auto bg-ecuador-blue-light p-8 rounded-xl shadow-lg relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-ecuador-red text-white rounded-full p-3 shadow-md">
                <ChatBubbleLeftRightIcon className="w-8 h-8"/>
              </div>
              <div className="min-h-[180px] md:min-h-[150px] flex flex-col justify-center">
                <p className="text-gray-700 italic text-lg mb-6 text-center">"{testimonialsData[activeTestimonial].quote}"</p>
                <div className="flex items-center justify-center">
                  {testimonialsData[activeTestimonial].imageUrl && (
                      <img
                          src={testimonialsData[activeTestimonial].imageUrl}
                          alt={testimonialsData[activeTestimonial].author}
                          className="w-16 h-16 rounded-full mr-4 border-2 border-ecuador-yellow object-cover"
                          loading="lazy"
                      />
                  )}
                  <div>
                    <p className="font-bold text-ecuador-blue">{testimonialsData[activeTestimonial].author}</p>
                    <p className="text-sm text-gray-600">{testimonialsData[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
              {/* Navegación por puntos (bullets) */}
              <div className="flex justify-center space-x-3 mt-6">
                {testimonialsData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                            activeTestimonial === index ? 'bg-ecuador-red' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ir al testimonio ${index + 1}`}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
          {modalState.content}
        </Modal>
      </section>
  );
};