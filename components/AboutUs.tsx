import React from 'react';
// Importamos los íconos que usaremos para los pilares
import { UserGroupIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from './icons';

export const AboutUs: React.FC = () => {
  return (
      <section id="about-us" className="py-16 md:py-24 bg-ecuador-yellow-light">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">¿Quiénes Somos?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Más que una asociación, somos tu familia en Canadá. Un punto de encuentro para crecer, compartir y sentirnos en casa.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* La imagen se mantiene igual */}
            <div className="md:w-1/2">
              <img
                  src="/assets/images/quienes_somos.png"
                  alt="Evento comunitario de ecuatorianos en Canadá"
                  className="rounded-lg shadow-xl w-full h-auto object-cover"
                  loading="lazy"
              />
            </div>
            <div className="md:w-1/2 text-gray-700">
              <h3 className="text-2xl font-semibold text-ecuador-blue mb-4 font-montserrat">Un Hogar Lejos del Hogar</h3>
              <p className="mb-6">
                Nacimos de un sueño: crear un espacio donde cada ecuatoriano en Canadá encuentre una mano amiga, una oportunidad para crecer y un pedacito de nuestra tierra. Somos una red de apoyo construida por y para la comunidad.
              </p>

              {/* --- NUEVA SECCIÓN DE PILARES --- */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4">
                    <UserGroupIcon className="h-6 w-6 text-ecuador-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Apoyo Mutuo</h4>
                    <p className="text-sm">Conexiones, amigos y ayuda real para los desafíos de la vida migrante.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4">
                    <BriefcaseIcon className="h-6 w-6 text-ecuador-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Crecimiento Profesional</h4>
                    <p className="text-sm">Talleres, networking y oportunidades para impulsar tu carrera en Canadá.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-ecuador-blue-light rounded-full mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-ecuador-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Cultura Viva</h4>
                    <p className="text-sm">Eventos y celebraciones que mantienen nuestras tradiciones y nos unen.</p>
                  </div>
                </div>
              </div>

              {/* --- MÉTRICAS DE IMPACTO MEJORADAS --- */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-ecuador-red text-center">
                  <p className="text-3xl font-bold text-ecuador-blue">
                    <span className="text-ecuador-red">+800</span>
                  </p>
                  <p className="text-sm text-gray-600">Miembros Activos</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-ecuador-yellow text-center">
                  <p className="text-3xl font-bold text-ecuador-blue">
                    <span className="text-ecuador-yellow">+50</span>
                  </p>
                  <p className="text-sm text-gray-600">Eventos y Talleres Anuales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};