import React from 'react';
import { Benefit } from '../types';
import { XCircleIcon } from './icons'; // Importamos un ícono para cerrar

interface BenefitCardProps {
  benefit: Benefit;
  isFlipped: boolean;
  onFlip: () => void;
  onRegisterClick?: () => void;
  onContactClick?: () => void;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, isFlipped, onFlip, onRegisterClick, onContactClick }) => {
  return (
    // Contenedor que establece la perspectiva 3D
    <div className="group h-[450px] [perspective:1000px]">
      {/* Contenedor que rota */}
      <div
        className={`relative h-full w-full rounded-xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && onFlip()}
        aria-label={`Ver más detalles sobre ${benefit.title}`}
      >
        {/* CARA FRONTAL */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-xl overflow-hidden flex flex-col">
          {benefit.imageUrl && (
            <div className="relative h-48">
              <img 
                src={benefit.imageUrl} 
                alt={benefit.title} 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
                 <div className="text-white text-6xl opacity-80">{benefit.icon}</div>
              </div>
            </div>
          )}
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-ecuador-blue mb-2 font-montserrat">{benefit.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{benefit.shortDescription}</p>
            <span className="mt-auto text-sm font-semibold text-ecuador-red self-start">
                Ver más detalles &rarr;
            </span>
          </div>
        </div>

        {/* CARA TRASERA */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-ecuador-blue-light p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-ecuador-blue font-montserrat">{benefit.title}</h3>
            <button
              className="text-gray-500 hover:text-ecuador-red"
              aria-label="Cerrar detalle"
              type="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onFlip(); }}
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
          <p className="text-gray-700 mb-4 flex-grow overflow-y-auto">{benefit.detailedDescription}</p>
          <div className="flex flex-col items-center gap-3 mt-2">
            <span className="text-sm text-gray-600 mb-1">¿Listo para aprovechar este beneficio?</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRegisterClick && onRegisterClick();
              }}
              className="w-full bg-ecuador-red text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-ecuador-red-dark transition text-center"
            >
              Registrarse
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onContactClick && onContactClick();
              }}
              className="w-full bg-ecuador-blue text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-yellow-400 transition text-center"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
