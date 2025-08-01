// /home/alexis/Sites/Landings/conexion-ec-ca/components/Benefits.tsx
import React, { useState, useContext } from 'react';
// NUEVO: Importar 'motion' de Framer Motion
import { motion } from 'framer-motion';
import { Benefit } from '../types';
import { UserGroupIcon, BriefcaseIcon, AcademicCapIcon, HomeIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from './icons';
import { BenefitCard } from './BenefitCard';
import { AuthContext } from '../contexts/AuthContext';
import { AdSlot } from './AdSlot';

// --- El resto de tus imports y data (TestimonialType, benefitsData, testimonialsData) se mantienen igual ---
// ... (código de datos sin cambios) ...
export interface TestimonialType {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

const benefitsData: Benefit[] = [
  // ... (tus datos de beneficios sin cambios)
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
];

const testimonialsData: TestimonialType[] = [
  // ... (tus datos de testimonios sin cambios)
];

const allTestimonials = [...testimonialsData, ...testimonialsData];

// NUEVO: Definimos las "variantes" de la animación fuera del componente para mejor rendimiento.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Este es el retraso entre la animación de cada hijo
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};


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
        <div className="container mx-auto px-6 max-w-8xl">
        <div className="text-center mb-12">
          {/* ... (código del título sin cambios) ... */}
          <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">Beneficios de Ser Parte</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Al unirte a nuestra comunidad, desbloqueas ventajas exclusivas pensadas para ti y tu familia.
          </p>
        </div>
        {/* MODIFICADO: Envolvemos el grid con motion.div y le pasamos las variantes */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // La animación se dispara cuando el 20% del grid es visible
        >
          {benefitsData.flatMap((benefit, index) => {
            const card = (
              // MODIFICADO: Envolvemos CADA elemento hijo con motion.div
              <motion.div key={benefit.id} variants={itemVariants}>
                <BenefitCard
                  benefit={benefit}
                  isFlipped={flippedCardId === benefit.id}
                  onFlip={() => handleCardFlip(benefit.id)}
                  onRegisterClick={auth?.openRegisterModal}
                  onContactClick={scrollToContact}
                />
              </motion.div>
            );

            if (index === 1) {
              return [
                card,
                // MODIFICADO: También envolvemos el AdSlot para que participe en la animación
                <motion.div key="ad-slot-benefits" variants={itemVariants} className="col-span-1">
                  <AdSlot location="benefits_section" />
                </motion.div>
              ];
            }
            return [card];
          })}
        </motion.div>

        {/* --- SECCIÓN DE TESTIMONIOS: ... (código sin cambios) --- */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          {/* ... */}
        </div>
      </div>
    </section>
  );
};