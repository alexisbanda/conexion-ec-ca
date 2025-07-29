// /home/alexis/Sites/Landings/conexion-ec-ca/components/Benefits.tsx
import React, { useState, useContext } from 'react';
import { Benefit } from '../types';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from './icons';
import { BenefitCard } from './BenefitCard';
import { AuthContext } from '../contexts/AuthContext';
import { AdSlot } from './AdSlot';

// Definición del tipo TestimonialType
export interface TestimonialType {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

const benefitsData: Benefit[] = [
  {
    id: '1',
    icon: <UserGroupIcon className="w-12 h-12" />,
    title: 'Encuentra a tu Gente',
    shortDescription: 'Conecta con profesionales, emprendedores y amigos que entienden tu camino. Nunca más te sentirás solo.',
    detailedDescription: '¿Imaginas tener a tu alcance una red de profesionales y emprendedores ecuatorianos listos para colaborar? Conviértete en miembro y obtén acceso privilegiado a nuestro Directorio Comunitario. Encuentra desde un abogado de confianza hasta el mejor sabor de casa. Participa en eventos de networking exclusivos, únete a grupos de interés y descubre a tu próximo socio, mentor o amigo. Aquí, las conexiones se convierten en oportunidades reales.',
    imageUrl: '/assets/images/red_contactos.png',
  },
  {
    id: '2',
    icon: <BriefcaseIcon className="w-12 h-12" />,
    title: 'Impulsa tu Carrera',
    shortDescription: 'Accede a nuestra bolsa de trabajo y talleres para adaptar tu CV al formato canadiense. ¡Consigue el trabajo que mereces!',
    detailedDescription: 'Tu próximo gran paso profesional empieza aquí. Te damos las herramientas para conquistar el mercado laboral canadiense: acceso a una bolsa de trabajo con ofertas exclusivas, talleres prácticos para perfeccionar tu CV y brillar en las entrevistas, y plantillas de currículum premium diseñadas para impresionar. Conéctate directamente con empleadores que buscan tu talento. ¡Deja de buscar y empieza a ser encontrado!',
    imageUrl: '/assets/images/oportunidades_laborales.png',
  },
  {
    id: '3',
    icon: <CurrencyDollarIcon className="w-12 h-12" />,
    title: 'Haz Crecer tu Negocio',
    shortDescription: 'Promociona tu emprendimiento en nuestro directorio y llega a una comunidad que confía en ti.',
    detailedDescription: 'Tu negocio merece brillar. Te ofrecemos la plataforma perfecta para que toda la comunidad ecuatoriana en Canadá conozca tu talento. Al publicar en nuestro Directorio Comunitario, no solo ganas visibilidad, sino que te conectas con una red de clientes que confían en ti. Participa en ferias y eventos de networking exclusivos donde tu emprendimiento será el protagonista. ¡Es hora de crecer juntos!',
    imageUrl: '/assets/images/evento_networking.png',
  },
  {
    id: '4',
    icon: <HomeIcon className="w-12 h-12" />,
    title: 'Tu Hogar en Canadá',
    shortDescription: 'Te guiamos para encontrar alojamiento seguro y entender tus derechos como inquilino. Siéntete en casa desde el día uno.',
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
  /*{ // Agregamos el beneficio 6 que estaba comentado para completar el grid si es necesario.
    id: '6',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12" />,
    title: 'Integración y Cultura',
    shortDescription: 'Eventos culturales exclusivos y asistencia 24/7 con nuestro asistente virtual "Conex".',
    detailedDescription: 'Siéntete más cerca de casa mientras construyes tu futuro. Organizamos eventos culturales, festivales y celebraciones que mantienen vivas nuestras tradiciones y nos unen como familia. Y para tus dudas del día a día, nuestro asistente virtual "Conex" está disponible 24/7 para darte respuestas al instante. Es lo mejor de dos mundos: el calor de nuestra gente y la ayuda que necesitas, cuando la necesitas.',
    imageUrl: '/assets/images/integracion_cultural.png',
  },*/
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
  },
  {
    id: 't4',
    quote: 'El portal no solo me ayudó a encontrar un servicio legal de confianza, sino que me hizo sentir parte de una comunidad fuerte y unida. ¡Recomiendo a todos los recién llegados que se unan!',
    author: 'Daniela G.',
    role: 'Consultora de Inmigración',
    imageUrl: 'https://picsum.photos/seed/testimonialuser5/100/100',
  },
];

const allTestimonials = [...testimonialsData, ...testimonialsData];

export const Benefits: React.FC = () => {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  const handleCardFlip = (benefitId: string) => {
    setFlippedCardId(prevId => (prevId === benefitId ? null : benefitId));
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="benefits" className="py-12 md:py-16 bg-blue-50">
        <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Beneficios de Ser Parte</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Al unirte a nuestra comunidad, desbloqueas ventajas exclusivas pensadas para ti y tu familia.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefitsData.flatMap((benefit, index) => {
            const card = (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                isFlipped={flippedCardId === benefit.id}
                onFlip={() => handleCardFlip(benefit.id)}
                onRegisterClick={auth?.openRegisterModal}
                onContactClick={scrollToContact}
              />
            );

            // Insertar el AdSlot después de la segunda tarjeta de beneficio (índice 1)
            // Aseguramos que el AdSlot reciba solo las clases de layout necesarias.
            // El AdSlot.tsx es quien define la apariencia del placeholder.
            if (index === 1) {
              return [
                card,
                <AdSlot key="ad-slot-benefits" location="benefits_section" className="col-span-1" />
              ];
            }
            return [card];
          })}
        </div>

        {/* --- SECCIÓN DE TESTIMONIOS: CAROUSEL CON ANIMACIÓN CSS --- */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h3 className="text-2xl md:text-3xl font-bold text-ecuador-blue text-center mb-10 font-montserrat">Lo que dicen nuestros miembros</h3>
          <div className="overflow-hidden relative pb-8">
            <div className="flex flex-nowrap animate-testimonial-scroll">
              {allTestimonials.map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-80 md:w-96 p-4 mx-4 md:mx-6">
                  <div className="bg-ecuador-blue-light p-8 rounded-xl shadow-lg relative flex flex-col justify-between min-h-[300px]"> {/* Ajustado min-h a 300px */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-ecuador-red text-white rounded-full p-3 shadow-md pt-6">
                      <ChatBubbleLeftRightIcon className="w-8 h-8"/>
                    </div>
                    <p className="text-gray-700 italic text-lg mb-6 text-center mt-6 overflow-hidden line-clamp-6">
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center justify-center mt-auto">
                      {testimonial.imageUrl && (
                        <img
                          src={testimonial.imageUrl}
                          alt={testimonial.author}
                          className="w-16 h-16 rounded-full mr-4 border-2 border-ecuador-yellow object-cover"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <p className="font-bold text-ecuador-blue">{testimonial.author}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};