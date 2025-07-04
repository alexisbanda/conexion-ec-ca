// /home/alexis/Sites/Landings/conexion-ec-ca/components/ServiceCard.tsx
import React from 'react';
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
}

// --- NUEVA FUNCIÓN AUXILIAR ---
// Esta función recibe una categoría y devuelve el componente de ícono correspondiente.
const getCategoryIcon = (category: ServiceCategory) => {
    const iconProps = { className: "w-7 h-7 text-ecuador-red" }; // Estilo común para los íconos

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

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isAuthenticated }) => {
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

    const badgeClass = type === ServiceType.OFERTA
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800';

    // Obtenemos el componente de ícono que vamos a renderizar
    const CategoryIconComponent = getCategoryIcon(category);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full transition-transform transform hover:-translate-y-1">
            <div className="p-5 flex-grow flex flex-col">
                {/* --- SECCIÓN DEL ENCABEZADO CON EL ÍCONO --- */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-ecuador-blue font-montserrat pr-2">{serviceName}</h3>
                        <p className="text-xs font-medium text-gray-500">{category}</p>
                    </div>
                    <div className="flex-shrink-0 p-3 bg-ecuador-yellow-light rounded-full">
                        {CategoryIconComponent}
                    </div>
                </div>

                <span className={`self-start px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap mb-4 ${badgeClass}`}>
                    {type}
                </span>

                <p className="text-sm text-gray-600 mb-4 flex-grow">{shortDescription}</p>

                <div className="text-sm text-gray-500 space-y-2 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                        <UserCircleIcon className="w-4 h-4 mr-2" />
                        <span>{contactName}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span>{city}</span>
                    </div>
                </div>
            </div>

            {isAuthenticated && (
                <div className="bg-gray-50 p-3 flex justify-end items-center space-x-3 border-t">
                    {whatsapp && (
                        <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700" title="Contactar por WhatsApp">
                            <WhatsAppIcon className="w-6 h-6" />
                        </a>
                    )}
                    {instagram && (
                        <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700" title="Ver en Instagram">
                            <InstagramIcon className="w-6 h-6" />
                        </a>
                    )}
                    {contact && (
                        <a href={`mailto:${contact}`} className="text-gray-600 hover:text-gray-800" title="Enviar correo electrónico">
                            <EnvelopeIcon className="w-6 h-6" />
                        </a>
                    )}
                    {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title={websiteText || 'Visitar sitio web'}>
                            <LinkIcon className="w-6 h-6" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};