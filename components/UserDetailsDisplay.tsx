// /home/alexis/Sites/Landings/conexion-ec-ca/components/UserDetailsDisplay.tsx
import React from 'react';
import { User } from '../types';
import { Timestamp } from 'firebase/firestore';

interface UserDetailsDisplayProps {
    user: User;
}

const timestampToDateString = (timestamp: Timestamp | Date | undefined, placeholder = 'No especificado'): string => {
    if (!timestamp) return placeholder;
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <h4 className="font-semibold text-gray-600 text-sm">{label}</h4>
        <p className="text-gray-800 text-base">{value || 'No especificado'}</p>
    </div>
);

export const UserDetailsDisplay: React.FC<UserDetailsDisplayProps> = ({ user }) => {
    const socialLinks = [
        { label: 'Instagram', value: user.instagramUrl },
        { label: 'LinkedIn', value: user.linkedinUrl },
        { label: 'Facebook', value: user.facebookUrl },
        { label: 'X (Twitter)', value: user.twitterUrl },
    ].filter(link => link.value);

    return (
        <div className="p-4 space-y-6 text-sm">
            {/* SECCIÓN DE INFORMACIÓN PERSONAL */}
            <div className="pb-4 border-b">
                <h3 className="text-lg font-bold text-ecuador-blue mb-3">Información Personal y de Contacto</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Nombre Completo" value={`${user.name || ''} ${user.lastName || ''}`} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Teléfono" value={user.phone} />
                    <DetailItem label="Año de Nacimiento" value={user.birthYear} />
                    <DetailItem label="Fecha de Registro" value={timestampToDateString(user.createdAt)} />
                    <DetailItem label="Llegada a Canadá" value={timestampToDateString(user.arrivalDateCanada)} />
                    <DetailItem label="Ciudad" value={user.city} />
                    <DetailItem label="Provincia" value={user.province} />
                </div>
            </div>

            {/* SECCIÓN DE ESTATUS Y FAMILIA */}
            <div className="pb-4 border-b">
                <h3 className="text-lg font-bold text-ecuador-blue mb-3">Estatus y Familia</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Estatus Migratorio" value={user.immigrationStatus} />
                    <DetailItem label="Núcleo Familiar" value={user.familyComposition?.join(', ')} />
                    {user.familyComposition?.includes('En pareja') && <DetailItem label="Nombre del Cónyuge" value={user.spouseName} />}
                    <DetailItem label="¿Tiene Hijos?" value={user.hasChildren ? 'Sí' : 'No'} />
                    {user.hasChildren && <DetailItem label="Edades de Hijos" value={user.childrenAges?.join(', ')} />}
                </div>
            </div>

            {/* SECCIÓN DE EDUCACIÓN Y TRABAJO */}
            <div className="pb-4 border-b">
                <h3 className="text-lg font-bold text-ecuador-blue mb-3">Educación y Trabajo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailItem label="Nivel de Estudios" value={user.educationLevel} />
                    <DetailItem label="Industria (Profesión)" value={user.profession} />
                    <DetailItem label="Estudios en Canadá" value={user.studiesInCanada} />
                    <DetailItem label="Institución Educativa" value={user.educationalInstitution} />
                    <DetailItem label="¿Está empleado?" value={user.isEmployed ? 'Sí' : 'No'} />
                    {user.isEmployed && <DetailItem label="Empleador Actual" value={user.currentEmployer} />}
                    {user.isEmployed && <DetailItem label="Posición Actual" value={user.currentPosition} />}
                </div>
            </div>
            
            {/* SECCIÓN DE SERVICIOS Y NECESIDADES */}
            <div className="pb-4 border-b">
                <h3 className="text-lg font-bold text-ecuador-blue mb-3">Servicios, Necesidades y Redes</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-600 text-sm">Servicios que Ofrece</h4>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap text-base">{user.servicesOffered || 'No especificado'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-600 text-sm">Apoyo que Necesita</h4>
                        <p className="text-gray-800 bg-gray-50 p-2 rounded-md mt-1 text-base">{user.supportNeeded?.join(', ') || 'No especificó áreas de apoyo.'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-600 text-sm">Mensaje Original</h4>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded-md mt-1 whitespace-pre-wrap text-base">{user.message || 'No proporcionó un mensaje.'}</p>
                    </div>
                    {socialLinks.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-600 text-sm">Redes Sociales</h4>
                            <div className="flex space-x-4 mt-1">
                                {socialLinks.map(link => (
                                    <a key={link.label} href={link.value} target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">{link.label}</a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SECCIÓN DE PREFERENCIAS */}
            <div>
                <h3 className="text-lg font-bold text-ecuador-blue mb-3">Preferencias</h3>
                <DetailItem label="Suscripción a Noticias" value={user.newsletterSubscription ? 'Sí, desea recibir noticias.' : 'No, no desea recibir noticias.'} />
            </div>
        </div>
    );
};
