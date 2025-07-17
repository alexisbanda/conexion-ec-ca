// /home/alexis/Sites/Landings/conexion-ec-ca/components/ServiceCard.tsx
import React, { useState } from 'react';
import { CommunityServiceItem, ServiceType, ServiceCategory } from '../types';
import {
    MapPinIcon,
    UserCircleIcon,
    EnvelopeIcon,
    LinkIcon,
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
import { ImageIcon } from './icons/ImageIcon';
import { InstagramIcon } from './icons/InstagramIcon';

interface ServiceCardProps {
    service: CommunityServiceItem;
    isAuthenticated: boolean;
    onContactClick: () => void;
}

const getCategoryIcon = (category: ServiceCategory) => {
    const iconProps = { className: "w-6 h-6 text-ecuador-red" };

    switch (category) {
        case ServiceCategory.COMIDA:
            return <FoodIcon {...iconProps} />;
        case ServiceCategory.LEGAL:
            return <LegalIcon {...iconProps} />;
        case ServiceCategory.TECNOLOGIA:
            return <TechIcon {...iconProps} />;
        case ServiceCategory.VIVIENDA:
            return <HomeIcon {...iconProps} />;
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
        case ServiceCategory.CUIDADO_INFANTIL:
        case ServiceCategory.TRADUCCION:
            return <OtherIcon {...iconProps} />;
        default:
            return <OtherIcon {...iconProps} />;
    }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isAuthenticated, onContactClick }) => {
    const [showContact, setShowContact] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false); // Estado para controlar el flip

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
        websiteText,
        imageUrl,
    } = service;

    const cardBorderColor = type === ServiceType.OFERTA
        ? 'border-green-400'
        : '';

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

    const handleImageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (imageUrl) {
            setIsFlipped(!isFlipped);
        }
    };

    const flipTransformClass = isFlipped ? '[transform:rotateY(180deg)]' : '';

    return (
        <div className="group h-64 [perspective:1000px]">
            <div className={`h-full w-full transition-transform duration-300 hover:-translate-y-1 ${cardBorderColor} rounded-lg shadow-md`}>
                <div
                    className={`relative h-full w-full rounded-lg flex flex-col transition-transform
                        duration-500 [transform-style:preserve-3d] ${flipTransformClass}`}
                >
                    {/* --- CARA FRONTAL --- */}
                    <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-lg flex flex-col">
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="flex items-center mb-1">
                                <div className="flex-shrink-0 mr-2">
                                    {CategoryIconComponent}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-ecuador-blue font-montserrat leading-tight flex items-center">
                                        {serviceName}
                                        {imageUrl && (
                                            <button
                                                onClick={handleImageClick}
                                                // --- CLASES PARA DARLE VIDA AL BOTÓN DE IMAGEN ---
                                                className="ml-2 text-gray-400 hover:text-blue-600 focus:text-blue-600 focus:outline-none
                                                           transition-all duration-200 hover:scale-110 transform"
                                                title="Ver/Ocultar imagen"
                                            >
                                                <ImageIcon className="w-5 h-5 text-green-600" />
                                            </button>
                                        )}
                                    </h3>
                                </div>
                            </div>

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
                        <div className="bg-gray-50 p-4 border-t rounded-b-lg">
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

                    {/* --- CARA TRASERA (IMAGEN) --- */}
                    {imageUrl && (
                        <div
                            className="absolute inset-0 h-full w-full rounded-lg bg-gray-100 [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={handleImageClick}
                            title="Volver a los detalles"
                        >
                            <img src={imageUrl} alt={serviceName} className="object-cover w-full h-full" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};