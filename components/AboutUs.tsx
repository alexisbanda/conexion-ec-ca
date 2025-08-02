import React, { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { UserGroupIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from './icons';
import { regions } from './NationalRegionSelector';

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
      const controls = animate(0, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = `+${Math.round(value)}`;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  return <span ref={nodeRef} />;};


export const AboutUs: React.FC = () => {
  const { region: regionId } = useParams<{ region: string }>();
  const region = regions.find(r => r.id === regionId);
  const regionName = region ? region.name : 'Canadá';

  return (
      <section id="about-us" className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* --- Main Grid Layout --- */}
          <div className="relative md:grid md:grid-cols-12 md:gap-8 items-center">

            {/* --- Image Column (spans more) --- */}
            <motion.div 
              className="md:col-span-7 lg:col-span-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              <img
                  src="/assets/images/quienes_somos.png"
                  alt={`Evento comunitario de ecuatorianos en ${regionName}`}
                  className="rounded-3xl shadow-2xl w-full h-auto object-cover"
                  loading="lazy"
              />
            </motion.div>

            {/* --- Text Card Column (Overlaps) --- */}
            <motion.div 
              className="md:col-span-5 lg:col-span-4 -mt-16 md:mt-0 md:ml-[-10%] lg:ml-[-15%] relative z-10"
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            >
                <div className="bg-white p-8 rounded-3xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Más que una asociación, somos tu familia en {regionName}.</h2>
                    <p className="text-gray-600 mb-6">
                        Nacimos de un sueño: crear un espacio donde cada ecuatoriano en {regionName} encuentre una mano amiga, una oportunidad para crecer y un pedacito de nuestra tierra.
                    </p>

                    {/* --- Pillars --- */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-yellow-light rounded-full mr-4"><UserGroupIcon className="h-6 w-6 text-ecuador-blue" /></div>
                            <p className="font-semibold text-gray-800">Apoyo Mutuo y Conexiones Reales</p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-yellow-light rounded-full mr-4"><BriefcaseIcon className="h-6 w-6 text-ecuador-blue" /></div>
                            <p className="font-semibold text-gray-800">Crecimiento Profesional y Oportunidades</p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-yellow-light rounded-full mr-4"><ChatBubbleLeftRightIcon className="h-6 w-6 text-ecuador-blue" /></div>
                            <p className="font-semibold text-gray-800">Cultura Viva y Eventos Comunitarios</p>
                        </div>
                    </div>

                    {/* --- Animated Metrics --- */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-4xl font-bold text-ecuador-red"><AnimatedMetric to={800} /></p>
                            <p className="text-sm text-gray-600">Miembros Activos</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-ecuador-yellow"><AnimatedMetric to={50} /></p>
                            <p className="text-sm text-gray-600">Eventos Anuales</p>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};