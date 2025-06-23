
import React from 'react';
import { ECUADOR_COLORS } from '../constants';

export const AboutUs: React.FC = () => {
  return (
    <section id="about-us" className="py-16 md:py-24 bg-ecuador-yellow-light">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">¿Quiénes Somos?</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Somos Conexión Migrante EC-CA, una asociación dedicada a tender puentes y fortalecer lazos para la comunidad ecuatoriana en Canadá.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="md:w-1/2">
            <img 
              src="/assets/images/quienes_somos.png"
              alt="Evento comunitario de ecuatorianos en Canadá" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="md:w-1/2 text-gray-700">
            <h3 className="text-2xl font-semibold text-ecuador-blue mb-3 font-montserrat">Nuestra Misión</h3>
            <p className="mb-4">
              Facilitar la integración de los migrantes ecuatorianos en la sociedad canadiense, ofreciendo un espacio de apoyo mutuo, preservando nuestra rica cultura y promoviendo el desarrollo personal y profesional de nuestros miembros.
            </p>
            <p className="mb-4">
              Desde nuestra fundación, hemos trabajado incansablemente para crear una red sólida que brinde recursos, organice eventos culturales y sociales, y sea una voz para nuestra comunidad.
            </p>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md border-l-4 border-ecuador-red">
              <p className="text-2xl font-bold text-ecuador-blue">
                <span className="text-ecuador-red">+800</span> Miembros Activos
              </p>
              <p className="text-sm text-gray-600">Y creciendo cada día, ¡gracias a ti!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
