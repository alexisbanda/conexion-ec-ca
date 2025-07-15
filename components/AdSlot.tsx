import React, { useState, useEffect } from 'react';
import { AdSlotItem } from '../types';
import { getActiveAds } from '../services/adService';

interface AdSlotProps {
  /** El identificador único de la ubicación del anuncio. Debe coincidir con el valor en Firestore. */
  location: string;
  /** Clases CSS opcionales para el contenedor principal del anuncio. */
  className?: string;
}

/**
 * Un componente que busca y renderiza un anuncio para una ubicación específica.
 * Se encarga de su propio estado de carga y de mostrar el anuncio si existe.
 * Si no se encuentra un anuncio activo para la ubicación, no renderiza nada.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ location, className = '' }) => {
  const [ad, setAd] = useState<AdSlotItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdForLocation = async () => {
      try {
        setIsLoading(true);
        // Usamos el servicio para obtener solo los anuncios de esta ubicación.
        // La función ya los devuelve ordenados por prioridad.
        const activeAds = await getActiveAds(location);
        
        // Tomamos el primer anuncio del array (el de mayor prioridad) o null si no hay ninguno.
        setAd(activeAds[0] || null);

      } catch (error) {
        console.error(`Error al obtener el anuncio para la ubicación "${location}":`, error);
        setAd(null); // Aseguramos que no se muestre nada en caso de error.
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdForLocation();
  }, [location]); // Se vuelve a ejecutar si la prop 'location' cambia.

  if (isLoading) {
    // Muestra un esqueleto de carga para evitar saltos en el layout.
    // Usamos h-full para que el esqueleto ocupe el espacio disponible, evitando saltos de layout.
    return <div className={`animate-pulse bg-gray-200 rounded-lg w-full h-full ${className}`}></div>;
  }

  if (!ad) {
    // Si no hay anuncio, no renderizamos nada para no ocupar espacio.
    return null;
  }

  return (
    // El div raíz ahora ocupa toda la altura disponible para que los elementos hijos puedan usarla.
    <div className={`${className} h-full`}>
      <a href={ad.adData.targetUrl} target="_blank" rel="noopener noreferrer sponsored" className="w-full h-full flex flex-col items-center justify-center">
        {/* La imagen ahora tiene un max-h-full para asegurar que no se desborde verticalmente. */}
        <img src={ad.adData.imageUrl} alt={ad.adData.sponsorName || 'Anuncio'} className="w-full max-h-full object-contain rounded-lg" />
        {ad.adData.sponsorName && (
           <p className="text-xs text-gray-500 mt-1.5 text-center italic flex-shrink-0">
             Patrocinado por <strong>{ad.adData.sponsorName}</strong>
           </p>
        )}
      </a>
    </div>
  );
};