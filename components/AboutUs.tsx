import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, animate } from 'framer-motion';
import { UserGroupIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from './icons';

// --- COMPONENTE ESPECIALIZADO PARA ANIMAR NÚMEROS ---
interface AnimatedMetricProps {
  to: number;
}

const AnimatedMetric: React.FC<AnimatedMetricProps> = ({ to }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const node = nodeRef.current;
      // Anima desde 0 hasta el número final
      const controls = animate(0, to, {
        duration: 2, // Duración de la animación del contador
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = `+${Math.round(value)}`;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  return <span ref={nodeRef} />;
};


export const AboutUs: React.FC = () => {
  return (
      <motion.section 
        id="about-us" 
        className="py-12 md:py-20 bg-ecuador-yellow-light overflow-hidden" // Añadido overflow-hidden
      >
        <div className="container mx-auto px-6 max-w-8xl">
          {/* --- TÍTULO PRINCIPAL CON ANIMACIÓN --- */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">¿Quiénes Somos?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Más que una asociación, somos tu familia en Canadá. Un punto de encuentro para crecer, compartir y sentirnos en casa.
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* --- IMAGEN CON ANIMACIÓN --- */}
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -80, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }} // Curva de easing suave
            >
              <img
                  src="/assets/images/quienes_somos.png"
                  alt="Evento comunitario de ecuatorianos en Canadá"
                  className="rounded-lg shadow-xl w-full h-auto object-cover"
                  loading="lazy"
              />
            </motion.div>

            {/* --- BLOQUE DE TEXTO CON ANIMACIÓN ORQUESTADA --- */}
            <motion.div 
              className="md:w-1/2 text-gray-700"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            >
              <h3 className="text-2xl font-semibold text-ecuador-blue mb-4 font-montserrat">Un Hogar Lejos del Hogar</h3>
              <p className="mb-6">
                Nacimos de un sueño: crear un espacio donde cada ecuatoriano en Canadá encuentre una mano amiga, una oportunidad para crecer y un pedacito de nuestra tierra. Somos una red de apoyo construida por y para la comunidad.
              </p>

              {/* --- PILARES CON ANIMACIÓN ESCALONADA (STAGGER) --- */}
              <motion.div 
                className="space-y-4 mb-8"
                variants={{
                  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {/* Pilar 1 */}
                <motion.div className="flex items-start" variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}>
                   <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4"> <UserGroupIcon className="h-6 w-6 text-ecuador-blue" /> </div>
                   <div> <h4 className="font-semibold text-gray-800">Apoyo Mutuo</h4> <p className="text-sm">Conexiones, amigos y ayuda real para los desafíos de la vida migrante.</p> </div>
                </motion.div>
                {/* Pilar 2 */}
                <motion.div className="flex items-start" variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}>
                   <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4"> <BriefcaseIcon className="h-6 w-6 text-ecuador-blue" /> </div>
                   <div> <h4 className="font-semibold text-gray-800">Crecimiento Profesional</h4> <p className="text-sm">Talleres, networking y oportunidades para impulsar tu carrera en Canadá.</p> </div>
                </motion.div>
                {/* Pilar 3 */}
                <motion.div className="flex items-start" variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}>
                   <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4"> <ChatBubbleLeftRightIcon className="h-6 w-6 text-ecuador-blue" /> </div>
                   <div> <h4 className="font-semibold text-gray-800">Cultura Viva</h4> <p className="text-sm">Eventos y celebraciones que mantienen nuestras tradiciones y nos unen.</p> </div>
                </motion.div>
              </motion.div>

              {/* --- MÉTRICAS ANIMADAS --- */}
              <motion.div 
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-ecuador-red text-center">
                  <p className="text-3xl font-bold text-ecuador-blue">
                    <span className="text-ecuador-red"><AnimatedMetric to={800} /></span>
                  </p>
                  <p className="text-sm text-gray-600">Miembros Activos</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-ecuador-yellow text-center">
                  <p className="text-3xl font-bold text-ecuador-blue">
                    <span className="text-ecuador-yellow"><AnimatedMetric to={50} /></span>
                  </p>
                  <p className="text-sm text-gray-600">Eventos y Talleres Anuales</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </motion.section>
  );
};