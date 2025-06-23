
import React from 'react';
import { ECUADOR_COLORS } from '../constants';
import { ArrowDownIcon } from './icons';

export const Hero: React.FC = () => {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-center text-white bg-cover bg-center"
             style={{ backgroundImage: "url('/assets/images/Vancouver_Quito_2.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 p-6">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 font-montserrat text-shadow-md">
          <span className="text-ecuador-yellow">Conectando</span> Corazones, <span className="text-ecuador-yellow">Construyendo</span> Futuros
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-shadow-sm">
          Tu comunidad ecuatoriana en Canadá. Apoyo, cultura y oportunidades para crecer juntos, lejos de casa pero cerca de nuestras raíces.
        </p>
        <a
          href="#contact"
          onClick={scrollToContact}
          className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
          aria-label="Únete a nuestra comunidad ahora"
        >
          Únete Ahora
        </a>
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-center animate-bounce">
        <p className="text-sm text-shadow-sm">↓ Desplázate para descubrir más ↓</p>
        <ArrowDownIcon className="w-6 h-6 mx-auto mt-1 text-ecuador-yellow" />
      </div>
    </section>
  );
};
