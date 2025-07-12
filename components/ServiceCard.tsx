// /home/alexis/Sites/Landings/conexion-ec-ca/components/ServiceCard.tsx
import React, { useState } from 'react';
import { CommunityServiceItem, ServiceType, ServiceCategory } from '../types';
import {
    MapPinIcon,
    UserCircleIcon,
    EnvelopeIcon,
    LinkIcon,
    // Importamos todos los íconos de categorías que creamos
    FoodIcon,
    LegalIcon,
    TechIcon,
    BeautyIcon,
    DeliveryIcon,
    AcademicCapIcon,
    EventIcon,
    HomeIcon,
    OtherIcon
} from './icons';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { InstagramIcon } from './icons/InstagramIcon';

interface ServiceCardProps {
    service: CommunityServiceItem;
    isAuthenticated: boolean;
    onContactClick: () => void;
}

// --- FUNCIÓN AUXILIAR (SE MANTIENE) ---
// Esta función recibe una categoría y devuelve el componente de ícono correspondiente.
const getCategoryIcon = (category: ServiceCategory) => {
    // Estilo común para los íconos de categoría
    const iconProps = { className: "w-6 h-6 text-ecuador-red" };

    switch (category) {
        case ServiceCategory.COMIDA:
            return <FoodIcon {...iconProps} />;
        case ServiceCategory.LEGAL:
            return <LegalIcon {...iconProps} />;
        case ServiceCategory.TECNOLOGIA:
            return <TechIcon {...iconProps} />;
        case ServiceCategory.BELLEZA:
            return <BeautyIcon {...iconProps} />;
        case ServiceCategory.DELIVERY:
            return <DeliveryIcon {...iconProps} />;
        case ServiceCategory.EDUCACION:
            return <AcademicCapIcon {...iconProps} />;
        case ServiceCategory.EVENTOS:
            return <EventIcon {...iconProps} />;
        case ServiceCategory.HOGAR:
            return <HomeIcon {...iconProps} />;
        default:
            return <OtherIcon {...iconProps} />;
    }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isAuthenticated, onContactClick }) => {
    const [showContact, setShowContact] = useState(false);

    const {
        serviceName,
        type,
        shortDescription,
        category,
        contactName,
        city,
        whatsapp,
        instagram,
        contact,
        website,
        websiteText
    } = service;

    const cardBorderColor = type === ServiceType.OFERTA
        ? 'border-green-400'
        : 'border-blue-400';

    const badgeClass = type === ServiceType.OFERTA
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800';

    const CategoryIconComponent = getCategoryIcon(category);

    const handleContactToggle = () => {
        if (isAuthenticated) {
            setShowContact(!showContact);
        } else {
            onContactClick();
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md border ${cardBorderColor} flex flex-col transition-transform transform hover:-translate-y-1`}>
            <div className="p-4 flex-grow flex flex-col">
                
                {/* --- MEJORA DE JERARQUÍA Y COMPACTACIÓN --- */}
                {/* Se une el ícono de categoría, el nombre del servicio y el tipo en un solo bloque visual. */}
                {/* Se reduce el espacio vertical. */}
                <div className="flex items-center mb-1">
                    <div className="flex-shrink-0 mr-2">
                        {CategoryIconComponent}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-ecuador-blue font-montserrat leading-tight">{serviceName}</h3>
                    </div>
                </div>

                {/* --- AJUSTE: BADGE Y CATEGORÍA EN LA MISMA LÍNEA --- */}
                {/* Se crea un contenedor flex para alinear el badge y la categoría horizontalmente */}
                <div className="flex items-center gap-x-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${badgeClass}`}>
                        {type}
                    </span>
                    <p className="text-sm font-medium text-gray-500">{category}</p>
                </div>

                <p className="text-sm text-gray-600 mb-3 flex-grow leading-snug">{shortDescription}</p>

                <div className="text-sm text-gray-500 flex flex-wrap items-center justify-between gap-x-2 mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center" title={`Publicado por ${contactName}`}>
                        <UserCircleIcon className="w-4 h-4 mr-1" />
                        <span>{contactName}</span>
                    </div>
                    <div className="flex items-center" title={`Ubicación: ${city}`}>
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{city}</span>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE CONTACTO MEJORADA Y REVISADA --- */}
            <div className="bg-gray-50 p-4 border-t">
                {showContact && isAuthenticated ? (
                    <div className="flex justify-around items-center animate-fade-in">
                        {whatsapp && (
                            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors" title="WhatsApp">
                                <WhatsAppIcon className="w-8 h-8" />
                                <span className="text-xs mt-1">WhatsApp</span>
                            </a>
                        )}
                        {instagram && (
                            <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-600 hover:text-pink-600 transition-colors" title="Instagram">
                                <InstagramIcon className="w-8 h-8" />
                                <span className="text-xs mt-1">Instagram</span>
                            </a>
                        )}
                        {contact && (
                            <a href={`mailto:${contact}`} className="flex flex-col items-center text-gray-600 hover:text-ecuador-blue transition-colors" title="Email">
                                <EnvelopeIcon className="w-8 h-8" />
                                <span className="text-xs mt-1">Email</span>
                            </a>
                        )}
                        {website && (
                            <a href={website} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors" title={websiteText || 'Web'}>
                                <LinkIcon className="w-8 h-8" />
                                <span className="text-xs mt-1">{websiteText || 'Web'}</span>
                            </a>
                        )}
                    </div>
                ) : (
                    <button onClick={handleContactToggle} className="w-full bg-ecuador-red text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-ecuador-red-dark transition text-center">
                        {isAuthenticated ? 'Mostrar Contacto' : 'Iniciar Sesión para Contactar'}
                    </button>
                )}
            </div>
        </div>
    );
};