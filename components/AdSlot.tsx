// /home/alexis/Sites/Landings/conexion-ec-ca/components/AdSlot.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdSlotItem } from '../types';
import { getActiveAds } from '../services/adService';
import { TagIcon } from './icons'; // Importamos un icono para el placeholder
import { regions } from './NationalRegionSelector';


interface AdSlotProps {
  /** El identificador único de la ubicación del anuncio. Debe coincidir con el valor en Firestore. */
  location: string;
  /** Clases CSS opcionales para el contenedor principal del anuncio. */
  className?: string;
  /** Prop opcional para forzar el modo placeholder de demo, ignorando la búsqueda de anuncio real. */
  isDemoPlaceholder?: boolean; 
}

/**
 * Un componente que busca y renderiza un anuncio para una ubicación específica.
 * Se encarga de su propio estado de carga y de mostrar el anuncio si existe.
 * Si no se encuentra un anuncio activo para la ubicación, muestra un placeholder de "Anúnciate aquí".
 */
export const AdSlot: React.FC<AdSlotProps> = ({ location, className = '', isDemoPlaceholder = false }) => {
  const [ad, setAd] = useState<AdSlotItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const routerLocation = useLocation();

  useEffect(() => {
    if (isDemoPlaceholder) {
      setIsLoading(false);
      setAd(null); // No buscará un anuncio real, siempre mostrará el placeholder
      return;
    }

    const fetchAdForLocation = async () => {
      try {
        setIsLoading(true);
        const allActiveAdsForSlot = await getActiveAds(location);

        // Determina la región actual desde la URL
        // Hacemos la lógica más robusta para que funcione en sub-rutas como /bc/eventos
        const regionPathSegment = '/' + routerLocation.pathname.split('/')[1];
        const currentRegion = regions.find(region => region.path === regionPathSegment);
        const currentRegionName = currentRegion ? currentRegion.name : null;

        // Filtra los anuncios por provincia
        const relevantAds = allActiveAdsForSlot.filter(ad => {
          // Si el anuncio no tiene provincia, es global y debe mostrarse.
          if (!ad.province) {
            return true;
          }
          // Si el anuncio tiene una provincia, debe coincidir con la región actual.
          // Hacemos la comparación insensible a mayúsculas/minúsculas y espacios
          // para evitar problemas por errores de tipeo en la base de datos.
          return ad.province.trim().toLowerCase() === currentRegionName?.trim().toLowerCase();
        });
        setAd(relevantAds[0] || null);
      } catch (error) {
        console.error(`Error al obtener el anuncio para la ubicación "${location}":`, error);
        setAd(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdForLocation();
  }, [location, isDemoPlaceholder, routerLocation.pathname]); // Se vuelve a ejecutar si la prop 'location' o 'isDemoPlaceholder' cambia.

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 rounded-lg w-full h-full ${className}`}></div>;
  }

  // --- LÓGICA CLAVE: Mostrar placeholder si no hay anuncio ---
  if (!ad) {
    return (
      <div className={`bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 text-gray-500 h-full ${className}`}>
        <TagIcon className="w-12 h-12 mb-4 text-gray-400" /> {/* Ícono de anuncio */}
        <p className="text-lg font-semibold">Anúnciate aquí</p>
        <p className="text-sm mt-2">Tu servicio o marca aquí. ¡Conecta con la comunidad!</p>
        {/* Aquí podrías añadir un link a una página de información para anunciantes */}
        <a href="/anunciate" className="mt-4 text-sm font-semibold text-ecuador-blue hover:underline">Más información &rarr;</a>
      </div>
    );
  }

  return (
    <div className={`${className} h-full`}>
      <a href={ad.adData.targetUrl} target="_blank" rel="noopener noreferrer sponsored" className="w-full h-full flex flex-col items-center justify-center">
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