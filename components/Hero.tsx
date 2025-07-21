import React, { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { regions } from './NationalRegionSelector'; // Importa las regiones
import { ArrowDownIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

const DEFAULT_HERO_IMAGE = '/assets/images/Vancouver_Quito_2.png';

export const Hero: React.FC = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const heroImageUrl = useMemo(() => {
    const currentPath = location.pathname;
    // Encuentra la región que coincide con la ruta actual
    const currentRegion = regions.find(region => region.path === currentPath);
    // Si se encuentra una región, usa su heroImageUrl, si no, usa la imagen por defecto
    return currentRegion ? currentRegion.heroImageUrl : DEFAULT_HERO_IMAGE;
  }, [location.pathname]);

  const heroRegionName = useMemo(() => {
    const currentPath = location.pathname;
    // Encuentra la región que coincide con la ruta actual
    const currentRegion = regions.find(region => region.path === currentPath);
    // Si se encuentra una región, usa su heroImageUrl, si no, usa la imagen por defecto
    return currentRegion ? currentRegion.name : DEFAULT_HERO_IMAGE;
  }, [location.pathname]);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-center text-white bg-cover bg-center"
             style={{ backgroundImage: `url(${heroImageUrl})` }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 p-8">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 font-montserrat text-shadow-md">
          <span className="text-ecuador-yellow">Conectando</span> Corazones, <span className="text-ecuador-yellow">Construyendo</span> Futuros
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-blue-100 text-shadow-sm">
          Conectando, apoyando y creciendo juntos. Accede a recursos, eventos y una red de contactos invaluable para facilitar tu vida en <span className="text-2xl font-semibold text-white mb-4 font-montserrat">{heroRegionName}</span>.
        </p>
        <div className="mt-10">
          <button
            // Llama a la función para abrir el modal de registro desde el contexto
            className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
            onClick={() => auth?.openRegisterModal()}
        >
          Únete a la Comunidad
        </button>
          <p className="mt-4 text-sm text-white opacity-80">
            ¡Es gratis y toma menos de un minuto!
          </p>
        </div>
      </div>
      <div className="absolute bottom-10 transform -translate-x-1/2 z-10 text-center animate-bounce">
        <p className="text-sm text-shadow-sm">↓ Desplázate para descubrir más ↓</p>
        <ArrowDownIcon className="w-6 h-6 mx-auto mt-1 text-ecuador-yellow" />
      </div>
    </section>
  );
};
