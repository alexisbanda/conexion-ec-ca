
import React, { useState } from 'react';
import { Benefit, Testimonial as TestimonialType, ModalState, ModalContentType } from '../types';
import { ECUADOR_COLORS } from '../constants';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, ChatBubbleLeftRightIcon } from './icons';
import { BenefitCard } from './BenefitCard';
import { Modal } from './Modal';

const benefitsData: Benefit[] = [
  {
    id: '1',
    icon: <UserGroupIcon className="w-12 h-12" />,
    title: 'Red de Contactos',
    shortDescription: 'Conecta con otros ecuatorianos, comparte experiencias y amplía tu red profesional y social.',
    detailedDescription: 'Nuestra comunidad es un crisol de talentos y experiencias. Participa en eventos de networking, únete a grupos de interés y encuentra mentores o colaboradores. Expandir tu red es crucial para tu desarrollo en Canadá.',
    imageUrl: 'https://picsum.photos/seed/networking/400/300',
  },
  {
    id: '2',
    icon: <BriefcaseIcon className="w-12 h-12" />,
    title: 'Oportunidades Laborales',
    shortDescription: 'Accede a ofertas de empleo, talleres de preparación y asesoramiento profesional.',
    detailedDescription: 'Te ayudamos a navegar el mercado laboral canadiense. Ofrecemos talleres para mejorar tu CV, prepararte para entrevistas y conectarte con empleadores que valoran el talento migrante. También compartimos ofertas de empleo exclusivas.',
    imageUrl: 'https://picsum.photos/seed/jobsearch/400/300',
  },
  {
    id: '3',
    icon: <AcademicCapIcon className="w-12 h-12" />,
    title: 'Apoyo Educativo',
    shortDescription: 'Información sobre estudios, becas y convalidación de títulos en Canadá.',
    detailedDescription: 'Canadá ofrece excelentes oportunidades educativas. Te guiamos en el proceso de selección de programas, solicitud de becas y el complejo proceso de convalidación de tus estudios previos para que puedas continuar tu formación.',
    imageUrl: 'https://picsum.photos/seed/education/400/300',
  },
  {
    id: '4',
    icon: <HomeIcon className="w-12 h-12" />,
    title: 'Asesoría en Vivienda',
    shortDescription: 'Orientación para encontrar alojamiento, entender contratos y derechos como inquilino.',
    detailedDescription: 'Encontrar un hogar es un paso fundamental. Te ofrecemos recursos y consejos para buscar vivienda, comprender los contratos de alquiler y conocer tus derechos y responsabilidades como inquilino en Canadá.',
    imageUrl: 'https://picsum.photos/seed/housing/400/300',
  },
  {
    id: '5',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12" />,
    title: 'Integración y Cultura',
    shortDescription: 'Eventos culturales, talleres de adaptación y un espacio para sentirte como en casa.',
    detailedDescription: 'Celebramos nuestras raíces ecuatorianas y te ayudamos a adaptarte a la vida en Canadá. Organizamos eventos culturales, festivales, talleres de idiomas y grupos de conversación para que te sientas conectado y apoyado.',
    imageUrl: 'https://picsum.photos/seed/culture/400/300',
  },
];

const testimonialData: TestimonialType = {
  id: 't1',
  quote: 'Desde que me uní a Conexión Migrante, mi adaptación a Canadá ha sido mucho más sencilla. Encontré amigos, apoyo para mi emprendimiento y, sobre todo, una familia lejos de casa. ¡Totalmente recomendado!',
  author: 'María Fernanda López',
  role: 'Emprendedora y Miembro Activa',
  imageUrl: 'https://picsum.photos/seed/testimonialuser/100/100',
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
            Descubre todo lo que nuestra comunidad puede ofrecerte para facilitar tu vida y crecimiento en Canadá.
          </p>
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
