// /home/alexis/Sites/Landings/conexion-ec-ca/components/StickyBanner.tsx
import React, { useState, useEffect } from 'react';
import { AdSlotItem } from '../types';
import { getActiveAds } from '../services/adService';

interface StickyBannerProps {
    side: 'left' | 'right';
}

const AdPlaceholder: React.FC = () => (
    <a href="/contacto" className="block h-96 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 mb-6 hover:bg-gray-200 transition-colors">
        <span className="text-gray-500 text-sm font-semibold">
            Anúnciate Aquí
            <br />
            <span className="font-normal text-xs">(Contáctanos)</span>
        </span>
    </a>
);

export const StickyBanner: React.FC<StickyBannerProps> = ({ side }) => {
    const [ad, setAd] = useState<AdSlotItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndSetAd = async () => {
            try {
                setIsLoading(true);
                const activeAds = await getActiveAds();
                // Busca el primer anuncio para el lado especificado.
                // Los anuncios ya vienen ordenados por prioridad desde getActiveAds.
                const adForSide = activeAds.find(a => a.position === side);
                setAd(adForSide || null);
            } catch (error) {
                console.error(`Error al cargar anuncios para el banner ${side}:`, error);
                setAd(null); // Asegura que no se muestre un anuncio en caso de error.
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSetAd();
    }, [side]);

    // La altura del 'top' debe ser un poco mayor a la del Header cuando es sticky.
    // El Header tiene un `py-4` y una altura de fuente. `top-28` (7rem / 112px) es un buen punto de partida.
    const topPosition = 'top-28';

    return (
        // Contenedor que define el ancho y la visibilidad en pantallas grandes
        <aside className="hidden lg:block w-60 flex-shrink-0 px-2">
            {/* Contenedor que se vuelve 'sticky' */}
            <div className={`sticky ${topPosition} h-auto`}>
                {isLoading && <div className="h-96 bg-gray-200 rounded-lg animate-pulse mb-6"></div>}
                {!isLoading && ad && (
                    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block mb-6">
                        <img src={ad.imageUrl} alt="Anuncio" className="w-full h-auto max-h-[600px] object-contain rounded-lg shadow-md" />
                    </a>
                )}
                {!isLoading && !ad && <AdPlaceholder />}
            </div>
        </aside>
    );
};