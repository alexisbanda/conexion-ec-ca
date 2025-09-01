import React, { useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// NUEVOS IMPORTS de la librería
import { ParallaxBanner, ParallaxBannerLayer } from 'react-scroll-parallax';
import { regions } from './NationalRegionSelector';
import { ArrowDownIcon } from './icons';
import { AuthContext } from '../contexts/AuthContext';

const DEFAULT_HERO_IMAGE = '/assets/images/Vancouver_Quito_2.png';

export const Hero: React.FC = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, openRegisterModal } = auth || {};

  const heroImageUrl = useMemo(() => {
    const currentPath = location.pathname;
    const currentRegion = regions.find(region => region.path === currentPath);
    return currentRegion ? currentRegion.heroImageUrl : DEFAULT_HERO_IMAGE;
  }, [location.pathname]);

  const heroRegionName = useMemo(() => {
    const currentPath = location.pathname;
    const currentRegion = regions.find(region => region.path === currentPath);
    return currentRegion ? currentRegion.name : "Canadá"; // Un fallback más genérico
  }, [location.pathname]);

  return (
    // REEMPLAZAMOS <section> por <ParallaxBanner>
    // Le damos una altura con `h-screen` y una clase `relative` para el contenido
    <ParallaxBanner style={{ height: '100vh' }} className="relative">
      <ParallaxBannerLayer
        // 1. LA CAPA DE LA IMAGEN
        // La velocidad negativa hace que se mueva más lento hacia arriba al hacer scroll
        speed={-25}
        image={heroImageUrl}
        className="bg-cover bg-center"
      />
      <ParallaxBannerLayer
        // 2. LA CAPA DEL COLOR OVERLAY
        // Una capa negra con opacidad. Usamos `bg-black/50` de TailwindCSS v3+
        // Se mueve a la misma velocidad que la página (velocidad 0)
        speed={0}
        className="bg-black/50" // Alternativa a `bg-black opacity-50`
      />
      <ParallaxBannerLayer
        // 3. LA CAPA DEL CONTENIDO
        // La centramos con flexbox y la ponemos por encima con z-index
        className="flex items-center justify-center text-center text-white z-10"
      >
        {/* Tu contenido se mantiene exactamente igual */}
        <div className="p-8">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 font-montserrat text-shadow-md">
            <span className="text-ecuador-yellow">Conectando</span> Corazones, <span className="text-ecuador-yellow">Construyendo</span> Futuros
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-blue-100 text-shadow-sm">
            Conectando, apoyando y creciendo juntos. Accede a recursos, eventos y una red de contactos invaluable para facilitar tu vida en <span className="text-2xl font-semibold text-white mb-4 font-montserrat">{heroRegionName}</span>.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <button
                className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
                onClick={() => navigate('/dashboard')}
              >
                Mi Espacio
              </button>
            ) : (
              <>
                <button
                  className="bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg"
                  onClick={() => openRegisterModal && openRegisterModal()}
                >
                  Únete a la Comunidad
                </button>
                <p className="mt-4 text-sm text-white opacity-80">
                  ¡Es gratis y toma menos de un minuto!
                </p>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-10 transform -translate-x-1/2 z-10 text-center animate-bounce">
        <p className="text-sm text-shadow-sm">↓ Desplázate para descubrir más ↓</p>
        <ArrowDownIcon className="w-6 h-6 mx-auto mt-1 text-ecuador-yellow" />
      </div>
      </ParallaxBannerLayer>
      
    </ParallaxBanner>
  );
};