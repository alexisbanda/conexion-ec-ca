
import React from 'react';
import { Benefit } from '../types';
import { ECUADOR_COLORS } from '../constants';

interface BenefitCardProps {
  benefit: Benefit;
  onOpenModal: (benefit: Benefit) => void;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, onOpenModal }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={() => onOpenModal(benefit)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onOpenModal(benefit)}
      aria-label={`Ver más detalles sobre ${benefit.title}`}
    >
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
      {!benefit.imageUrl && (
        <div className="h-32 flex items-center justify-center text-ecuador-blue bg-ecuador-yellow-light">
          <div className="text-6xl">{benefit.icon}</div>
        </div>
      )}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-ecuador-blue mb-2 font-montserrat">{benefit.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{benefit.shortDescription}</p>
        <button 
            className="mt-auto text-sm font-semibold text-ecuador-red hover:text-red-700 self-start transition-colors"
        >
            Ver más detalles &rarr;
        </button>
      </div>
    </div>
  );
};
