import React, { useState } from 'react';
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
    detailedDescription: 'Nuestra comunidad es un crisol de talentos. Usa nuestro Directorio Comunitario para encontrar servicios ofrecidos por compatriotas, desde asesoría legal hasta gastronomía. Participa en eventos de networking exclusivos para miembros, únete a grupos de interés y encuentra mentores o colaboradores.',
    imageUrl: '/assets/images/red_contactos.png',
  },
  {
    id: '2',
    icon: <BriefcaseIcon className="w-12 h-12" />,
    title: 'Oportunidades Laborales',
    shortDescription: 'Bolsa de trabajo, talleres y acceso a plantillas de CV en formato canadiense (Premium).',
    detailedDescription: 'Te ayudamos a navegar el mercado laboral canadiense. Como miembro, tendrás acceso a ofertas de empleo exclusivas, talleres para mejorar tu CV, prepararte para entrevistas y plantillas de currículum adaptadas al estándar canadiense. Conéctate con empleadores que valoran el talento migrante.',
    imageUrl: '/assets/images/oportunidades_laborales.png',
  },
  {
    id: '3',
    icon: <CurrencyDollarIcon className="w-12 h-12" />,
    title: 'Impulso a Emprendedores',
    shortDescription: 'Promociona tu negocio en nuestro Directorio y accede a una red de clientes potenciales.',
    detailedDescription: '¿Tienes un emprendimiento? Nuestra plataforma te da la visibilidad que necesitas. Publica tus servicios en el Directorio Comunitario, llega a cientos de ecuatorianos en Canadá y participa en ferias y eventos de networking diseñados para impulsar tu negocio.',
    imageUrl: '/assets/images/emprendedores.png', // Sugerencia: crear una nueva imagen para este beneficio
  },
  {
    id: '4',
    icon: <HomeIcon className="w-12 h-12" />,
    title: 'Asesoría en Vivienda',
    shortDescription: 'Recursos para encontrar alojamiento y contactos de confianza dentro de la comunidad.',
    detailedDescription: 'Encontrar un hogar es un paso fundamental. Te ofrecemos recursos y consejos para buscar vivienda, comprender los contratos de alquiler y conocer tus derechos. Además, a través de nuestro Directorio Comunitario, puedes encontrar recomendaciones y contactos de confianza.',
    imageUrl: '/assets/images/apoyo_vivienda.png',
  },
  {
    id: '5',
    icon: <AcademicCapIcon className="w-12 h-12" />,
    title: 'Apoyo Educativo',
    shortDescription: 'Guías sobre estudios, becas y seminarios web exclusivos sobre convalidación de títulos.',
    detailedDescription: 'Canadá ofrece excelentes oportunidades educativas. Te guiamos en el proceso de selección de programas, solicitud de becas y el complejo proceso de convalidación de tus estudios. Accede a seminarios web con expertos y guías detalladas, un beneficio clave de nuestra comunidad.',
    imageUrl: '/assets/images/apoyo_educativo.png',
  },
  {
    id: '6',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12" />,
    title: 'Integración y Cultura',
    shortDescription: 'Eventos culturales exclusivos y asistencia 24/7 con nuestro asistente virtual "Conex".',
    detailedDescription: 'Celebramos nuestras raíces y te ayudamos a adaptarte. Organizamos eventos culturales y festivales exclusivos para miembros. Además, nuestro asistente virtual "Conex" está disponible 24/7 para responder tus dudas migratorias y ayudarte a navegar nuestros recursos.',
    imageUrl: '/assets/images/integracion_cultural.png',
  },
];

const testimonialData: TestimonialType = {
  id: 't1',
  quote: 'Gracias al Directorio Comunitario, conseguí mis primeros clientes en Toronto. Los talleres de CV me ayudaron a conseguir mi trabajo actual. Conexión Migrante no es solo un grupo, es una plataforma de lanzamiento.',
  author: 'Javier Mendoza',
  role: 'Ingeniero de Software y Emprendedor',
  imageUrl: 'https://picsum.photos/seed/testimonialuser2/100/100',
};

export const Benefits: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

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
              <p className="text-gray-700 italic text-lg mb-6 text-center">"{testimonialData.quote}"</p>
              <div className="flex items-center justify-center">
                {testimonialData.imageUrl && (
                    <img
                        src={testimonialData.imageUrl}
                        alt={testimonialData.author}
                        className="w-16 h-16 rounded-full mr-4 border-2 border-ecuador-yellow object-cover"
                        loading="lazy"
                    />
                )}
                <div>
                  <p className="font-bold text-ecuador-blue">{testimonialData.author}</p>
                  <p className="text-sm text-gray-600">{testimonialData.role}</p>
                </div>
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