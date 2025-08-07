import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { CommunityServiceItem, ServiceStatus, User, EventItem } from '../types';
import { getUserServices, deleteService, getServicesByCity } from '../services/directoryService';
import { getUserEvents, getEventsForUserRsvp, getEventsByCity } from '../services/eventService';
import { Modal } from './Modal';
import { AddServiceForm } from './AddServiceForm';
import { AddEventForm } from './AddEventForm';
import { NotificationPreferences } from './NotificationPreferences';
import { BriefcaseIcon, UserCircleIcon, MapPinIcon, PlusCircleIcon, BellIcon, ListBulletIcon, TrophyIcon, ChatBubbleLeftRightIcon, HomeIcon, BriefcaseIcon as WorkIcon, AcademicCapIcon, CurrencyDollarIcon, BookOpenIcon, UsersIcon, HeartIcon, CalendarDaysIcon, FoodIcon, LegalIcon, TechIcon, BeautyIcon, DeliveryIcon, EventIcon, OtherIcon, MegaphoneIcon, UserGroupIcon } from './icons';

// --- Definición de las pestañas para una gestión limpia y sin errores de tipeo ---
const TABS = {
    MY_SPACE: 'Mi Espacio',
    PUBLICATIONS: 'Mis Servicios',
    MY_EVENTS: 'Mis Eventos',
    ACHIEVEMENTS: 'Mis Logros',
    NOTIFICATIONS: 'Notificaciones',
};

// --- NUEVA SECCIÓN: INDICADORES DE LOGROS ALINEADOS CON DISEÑO CIRCULAR ---
const InlineAchievements: React.FC<{ user: User; setActiveTab: (tab: string) => void }> = ({ user, setActiveTab }) => {
    
    // SUGERENCIA 1: Datos dinámicos basados en el usuario
    const achievementsData = useMemo(() => [
        { 
            id: 'nivel', 
            title: 'Nivel', 
            value: user.membershipLevel || 'Socio', // Usar datos reales
            icon: <TrophyIcon className="w-6 h-6" />, 
            colorClass: 'bg-gradient-to-br from-blue-500 to-ecuador-blue',
            targetTab: TABS.ACHIEVEMENTS,
            tooltip: `Tu nivel actual es ${user.membershipLevel || 'Socio'}. Sigue participando para subir de nivel.`
        },
        { 
            id: 'puntos', 
            title: 'Puntos', 
            value: user.points || 0, // Usar datos reales (ejemplo)
            icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />, 
            colorClass: 'bg-gradient-to-br from-red-500 to-ecuador-red',
            targetTab: TABS.ACHIEVEMENTS,
            tooltip: `Has acumulado ${user.points || 0} puntos. ¡Excelente!`
        },
        { 
            id: 'servicios', 
            title: 'Servicios', 
            value: user.servicesCount || 0, 
            icon: <BriefcaseIcon className="w-6 h-6" />, 
            colorClass: 'bg-gradient-to-br from-green-500 to-green-700',
            targetTab: TABS.PUBLICATIONS,
            tooltip: 'Ver tus servicios publicados'
        },
        { 
            id: 'eventos', 
            title: 'Eventos', 
            value: user.eventsCount || 0, 
            icon: <CalendarDaysIcon className="w-6 h-6" />, 
            colorClass: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
            targetTab: TABS.MY_EVENTS,
            tooltip: 'Ver tus eventos creados'
        },
    ], [user]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            className="flex justify-center md:justify-start items-center w-full max-w-md mx-auto md:max-w-none md:mx-0 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {achievementsData.map(badge => (
                <motion.button
                    key={badge.id}
                    onClick={() => setActiveTab(badge.targetTab)}
                    title={badge.tooltip}
                    aria-label={badge.tooltip}
                    className={`group relative flex flex-row items-center p-3 ${badge.colorClass} text-white rounded-xl shadow-lg w-32 h-16 text-left overflow-hidden`}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    {/* Efecto de brillo "Glossy" */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                    <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Contenido */}
                    <div className="relative z-10 flex flex-row items-center justify-start w-full gap-2">
                        <div className="flex-shrink-0 bg-black/10 p-2 rounded-md">
                            {badge.icon}
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold text-lg leading-tight drop-shadow-sm">{badge.value}</p>
                            <p className="font-semibold text-xs uppercase tracking-wider opacity-90">{badge.title}</p>
                        </div>
                    </div>
                </motion.button>
            ))}
        </motion.div>
    );
};


// --- NUEVO COMPONENTE: ACCESOS DIRECTOS ---
const QuickAccessLinks: React.FC<{
    onOpenAddModal: () => void;
    onOpenAddEventModal: () => void;
    onNavigateToDirectory: () => void;
    onOpenUserProfileModal: () => void;
}> = ({ onOpenAddModal, onOpenAddEventModal, onNavigateToDirectory, onOpenUserProfileModal }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200/80 cursor-pointer"
                onClick={onOpenAddModal}
                whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <BriefcaseIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Publicar un Servicio</h4>
                        <p className="text-sm text-gray-600">Ofrece tu ayuda a la comunidad.</p>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200/80 cursor-pointer"
                onClick={onOpenAddEventModal}
                whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <CalendarDaysIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Publicar un Evento</h4>
                        <p className="text-sm text-gray-600">Crea y conecta.</p>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200/80 cursor-pointer"
                onClick={onNavigateToDirectory}
                whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <MapPinIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Ver Directorio</h4>
                        <p className="text-sm text-gray-600">Explora los servicios de otros.</p>
                    </div>
                </div>
            </motion.div>
            <motion.div
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200/80 cursor-pointer"
                onClick={onOpenUserProfileModal}
                whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <UserCircleIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Editar Mi Perfil</h4>
                        <p className="text-sm text-gray-600">Actualiza tu información.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    </div>
);


// --- NUEVA SECCIÓN: MI ESPACIO (Con recomendaciones personalizadas) ---
const MySpaceSection: React.FC<{
    user: User;
    onOpenAddModal: () => void;
    onOpenAddEventModal: () => void;
    onNavigateToDirectory: () => void;
    onOpenUserProfileModal: () => void;
    recommendedEvents: EventItem[];
    recommendedServices: CommunityServiceItem[];
}> = ({ user, onOpenAddModal, onOpenAddEventModal, onOpenUserProfileModal, recommendedEvents, recommendedServices }) => {
    // Datos de ejemplo para las recomendaciones (futura implementación)

    const recommendedGuides = useMemo(() => [
        { id: 'g1', title: 'Guía de Vivienda en Vancouver', icon: <HomeIcon className="w-8 h-8" />, description: 'Conoce tus derechos como inquilino.' },
        { id: 'g2', title: 'Recursos de Salud Mental', icon: <HeartIcon className="w-8 h-8" />, description: 'Encuentra apoyo emocional y profesional.' },
    ], []);

    return (
        <div>
            {/* INICIO DE LAS RECOMENDACIONES PERSONALIZADAS */}
            <div className="mb-8">
                <h4 className="text-2xl font-semibold text-ecuador-blue font-montserrat"><CalendarDaysIcon className="w-6 h-6 mr-2 text-ecuador-red"/> Eventos para ti</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedEvents.map(event => (
                        <Link to={`/events/${event.id}`} key={event.id} className="block h-full">
                            <motion.div
                                className="bg-white p-4 rounded-lg shadow h-full cursor-pointer flex flex-col"
                                whileHover={{ scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover rounded mb-2"/>
                                <h5 className="font-semibold text-sm text-gray-800 mt-2 flex-grow">{event.title}</h5>
                                <p className="text-xs text-gray-600 line-clamp-2">{event.description}</p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-2xl font-semibold text-ecuador-blue font-montserrat"><BriefcaseIcon className="w-6 h-6 mr-2 text-ecuador-red"/> Servicios Sugeridos</h4>
                    <div className="space-y-4">
                        {recommendedServices.map(service => (
                            <motion.div 
                                key={service.id} 
                                className="bg-white p-4 rounded-lg shadow flex items-center cursor-pointer border border-transparent hover:border-ecuador-blue transition-all duration-300"
                                whileHover={{ scale: 1.02, y: -4, boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)" }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-bold text-md text-gray-800">{service.serviceName}</h5>
                                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">{service.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-700">{service.contactName}</p>
                                            <p className="text-xs text-gray-500">{service.city}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">{service.shortDescription}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-2xl font-semibold text-ecuador-blue font-montserrat"><BookOpenIcon className="w-6 h-6 mr-2 text-ecuador-red"/> Guías para tu Camino</h4>
                    <div className="space-y-4">
                        {recommendedGuides.map(guide => (
                            <div key={guide.id} className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
                                <div className="p-2 bg-ecuador-blue-light rounded-full text-ecuador-blue">
                                    {guide.icon}
                                </div>
                                <h5 className="font-semibold text-sm text-gray-800">{guide.title}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* FIN DE LAS RECOMENDACIONES PERSONALIZADAS */}
        </div>
    );
};

// --- NUEVA SECCIÓN: MI PERFIL DE LOGROS ---
const AchievementsSection: React.FC = () => {
    const badges = [
        { name: 'Pionero', icon: <TrophyIcon className="w-8 h-8" />, color: 'from-yellow-300 to-orange-400' },
        { name: 'Emprendedor', icon: <BriefcaseIcon className="w-8 h-8" />, color: 'from-blue-400 to-indigo-500' },
        { name: 'Anfitrión', icon: <CalendarDaysIcon className="w-8 h-8" />, color: 'from-green-400 to-teal-500' },
    ];

    return (
        <div>
            <h3 className="text-2xl font-bold text-ecuador-blue font-montserrat mb-6">Mis Logros y Puntos</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><TrophyIcon className="w-6 h-6 mr-2 text-ecuador-yellow"/> Puntos: <span className="font-bold ml-2">150</span></h4>
                
                <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-4 flex items-center"><BookOpenIcon className="w-6 h-6 mr-2 text-ecuador-red"/> Insignias Desbloqueadas</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                    {badges.map(badge => (
                        <div key={badge.name} className={`p-4 rounded-lg text-white bg-gradient-to-br ${badge.color} flex flex-col items-center justify-center text-center shadow-lg`}>
                            {badge.icon}
                            <span className="font-semibold mt-2 text-sm">{badge.name}</span>
                        </div>
                    ))}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-4 flex items-center"><ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-ecuador-blue"/> Desafíos Pendientes</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li><span className="font-semibold text-ecuador-red">Desafío "Pionero":</span> Completa tu perfil para ganar tu primera insignia.</li>
                    <li><span className="font-semibold text-ecuador-red">Desafío "Conector":</span> Envía 3 mensajes a otros miembros.</li>
                    <li><span className="font-semibold text-ecuador-red">Desafío "Anfitrión":</span> Publica tu primer evento en la comunidad.</li>
                </ul>
            </div>
        </div>
    );
};

// --- Componente para la sección de Mis Eventos ---
const MyEventsSection: React.FC<{ 
    createdEvents: EventItem[]; 
    attendingEvents: EventItem[];
    isLoading: boolean;
    onOpenAddEventModal: () => void 
}> = ({ createdEvents, attendingEvents, isLoading, onOpenAddEventModal }) => {

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat">Mis Eventos Creados</h3>
                    <button 
                        onClick={onOpenAddEventModal}
                        className="bg-ecuador-blue hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center"
                    >
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Crear Nuevo Evento
                    </button>
                </div>
                
                {isLoading ? (
                    <p>Cargando tus eventos...</p>
                ) : createdEvents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {createdEvents.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{event.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{event.date.toDate().toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {event.published ? 'Publicado' : 'Borrador'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">Aún no has creado ningún evento.</p>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat flex items-center">
                    <CalendarDaysIcon className="w-6 h-6 mr-2 text-ecuador-red"/>Eventos a los que Asistirás
                </h3>
                {isLoading ? (
                    <p>Cargando eventos...</p>
                ) : attendingEvents.length > 0 ? (
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {attendingEvents.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{event.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{event.date.toDate().toLocaleDateString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 text-gray-600">No has confirmado tu asistencia a ningún evento todavía.</p>
                )}
            </div>
        </div>
    );
};

// --- Componente para la sección de Publicaciones ---
const PublicationsSection: React.FC<{
    services: CommunityServiceItem[];
    isLoading: boolean;
    onOpenAddModal: () => void;
    onOpenEditModal: (service: CommunityServiceItem) => void;
    onOpenDeleteModal: (service: CommunityServiceItem) => void;
}> = ({ services, isLoading, onOpenAddModal, onOpenEditModal, onOpenDeleteModal }) => {
    const getStatusBadgeClass = (status: ServiceStatus) => {
        switch (status) {
            case ServiceStatus.APROBADO: return 'bg-green-100 text-green-800';
            case ServiceStatus.PENDIENTE: return 'bg-yellow-100 text-yellow-800';
            case ServiceStatus.RECHAZADO: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat">Mis Servicios</h3>
                <button
                    onClick={onOpenAddModal}
                    className="bg-ecuador-blue hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                    aria-label="Agregar nuevo servicio al directorio"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Agregar Nuevo
                </button>
            </div>

            {isLoading ? (
                <p>Cargando tus servicios...</p>
            ) : services.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {services.map(service => (
                            <tr key={service.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-gray-800 font-medium">{service.serviceName}</td>
                                <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(service.status)}`}>
                                            {service.status}
                                        </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => onOpenEditModal(service)} className="text-blue-600 hover:underline text-xs font-medium">Editar</button>
                                    <button onClick={() => onOpenDeleteModal(service)} className="text-red-600 hover:underline text-xs font-medium">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">Aún no has publicado ningún servicio. ¡Anímate a compartir algo con la comunidad!</p>
            )}
        </div>
    );
};

// --- Componente Principal del Dashboard ---
export const MemberDashboard: React.FC = () => {
    const auth = useContext(AuthContext);

    // Estado para la pestaña activa
    const [activeTab, setActiveTab] = useState(TABS.MY_SPACE);

    // Estados para la gestión de servicios
    const [userServices, setUserServices] = useState<CommunityServiceItem[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<CommunityServiceItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<CommunityServiceItem | null>(null);
    
    // Estados para la gestión de eventos
    const [userEvents, setUserEvents] = useState<EventItem[]>([]);
    const [attendingEvents, setAttendingEvents] = useState<EventItem[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    // Estados para las recomendaciones
    const [recommendedServices, setRecommendedServices] = useState<CommunityServiceItem[]>([]);
    const [recommendedEvents, setRecommendedEvents] = useState<EventItem[]>([]);

    const fetchUserServices = useCallback(async () => {
        if (auth?.user?.id) {
            setIsLoadingServices(true);
            try {
                const services = await getUserServices(auth.user.id);
                setUserServices(services);
                // auth.refreshUserData({ servicesCount: services.length }); // Causa un bucle de renderizado
            } catch (error) {
                console.error("Error fetching user services:", error);
            } finally {
                setIsLoadingServices(false);
            }
        }
    }, [auth?.user?.id]);

    const fetchUserEvents = useCallback(async () => {
        if (auth?.user?.id) {
            setIsLoadingEvents(true);
            try {
                const events = await getUserEvents(auth.user.id);
                setUserEvents(events);
                // auth.refreshUserData({ eventsCount: events.length }); // Causa un bucle de renderizado
            } catch (error) {
                console.error("Error fetching user events:", error);
            } finally {
                setIsLoadingEvents(false);
            }
        }
    }, [auth?.user?.id]);

    const fetchAttendingEvents = useCallback(async () => {
        if (auth?.user?.id) {
            setIsLoadingEvents(true);
            try {
                const events = await getEventsForUserRsvp(auth.user.id);
                setAttendingEvents(events);
            } catch (error) {
                console.error("Error fetching attending events:", error);
            } finally {
                setIsLoadingEvents(false);
            }
        }
    }, [auth?.user?.id]);

    // Carga los datos principales del dashboard (servicios, eventos, etc.) cuando el componente se monta
    useEffect(() => {
        fetchUserServices();
        fetchUserEvents();
        fetchAttendingEvents();

        const fetchRecommendations = async () => {
            if (auth?.user?.city) {
                try {
                    const [events, services] = await Promise.all([
                        getEventsByCity(auth.user.city, 3),
                        getServicesByCity(auth.user.city, 3)
                    ]);
                    setRecommendedEvents(events);
                    setRecommendedServices(services);
                } catch (error) {
                    console.error("Error fetching recommendations:", error);
                }
            }
        };

        fetchRecommendations();
    }, [fetchUserServices, fetchUserEvents, fetchAttendingEvents, auth?.user?.city]);

    // --- Handlers para Modales y Navegación ---
    const handleOpenAddModal = () => {
        setServiceToEdit(null);
        setIsServiceModalOpen(true);
    };

    const handleOpenEditModal = (service: CommunityServiceItem) => {
        setServiceToEdit(service);
        setIsServiceModalOpen(true);
    };

    const handleOpenDeleteModal = (service: CommunityServiceItem) => {
        setServiceToDelete(service);
        setIsDeleteModalOpen(true);
    };

    const handleOpenAddEventModal = () => {
        setIsEventModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;
        try {
            await deleteService(serviceToDelete.id);
            fetchUserServices(); // Refrescar la lista
        } catch (error) {
            console.error("Error al eliminar el servicio:", error);
            alert("No se pudo eliminar el servicio. Inténtalo de nuevo.");
        } finally {
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const handleSuccess = () => {
        setIsServiceModalOpen(false);
        setServiceToEdit(null);
        fetchUserServices(); // Refrescar la lista
    };

    const handleEventSuccess = () => {
        setIsEventModalOpen(false);
        fetchUserEvents(); // Refrescar la lista de eventos
    };

    const handleNavigateToDirectory = () => {
        auth?.openDirectoryModal();
    };

    // --- Renderizado Condicional del Contenido de la Pestaña (ACTUALIZADO) ---
    const renderContent = () => {
        if (!auth?.user) return null; // No renderizar si no hay usuario
        switch (activeTab) {
            case TABS.MY_SPACE:
                return (
                  <div>
                      <MySpaceSection
                          user={auth.user}
                          onOpenAddModal={handleOpenAddModal}
                          onOpenAddEventModal ={handleOpenAddEventModal}
                          onNavigateToDirectory={handleNavigateToDirectory}
                          onOpenUserProfileModal={() => auth?.openUserProfileModal()}
                          recommendedEvents={recommendedEvents}
                          recommendedServices={recommendedServices}
                      />
                  </div>
                );
            case TABS.PUBLICATIONS:
                return <PublicationsSection
                    services={userServices}
                    isLoading={isLoadingServices}
                    onOpenAddModal={handleOpenAddModal}
                    onOpenEditModal={handleOpenEditModal}
                    onOpenDeleteModal={handleOpenDeleteModal}
                />;
            case TABS.MY_EVENTS:
                return <MyEventsSection 
                    createdEvents={userEvents}
                    attendingEvents={attendingEvents}
                    isLoading={isLoadingEvents}
                    onOpenAddEventModal={handleOpenAddEventModal} 
                />;
            case TABS.ACHIEVEMENTS:
                return <AchievementsSection />;
            case TABS.NOTIFICATIONS:
                return <NotificationPreferences />;
            default:
                return null;
        }
    };

    const { user } = auth;

    // Creamos un objeto de usuario derivado que siempre tiene los contadores actualizados
    // desde el estado local del dashboard, en lugar de depender del contexto que puede ser obsoleto.
    const userWithLiveCounts = useMemo(() => {
        if (!user) return null;
        return {
            ...user,
            servicesCount: userServices.length,
            eventsCount: userEvents.length,
        };
    }, [user, userServices.length, userEvents.length]);

    // --- Renderizado Principal del Componente ---
    if (!auth?.user || !userWithLiveCounts) {
        return (
            <section className="py-20 text-center flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Acceso Restringido</h2>
                <p className="text-lg text-gray-700 mb-6">Por favor, inicia sesión para acceder a tu espacio de miembro.</p>
                <button onClick={auth?.openLoginModal} className="mt-6 bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                    Iniciar Sesión
                </button>
            </section>
        );
    }

    // La navegación del MemberDashboard ya es un sistema de pestañas.
    // La nueva estructura incluye "Mi Espacio" y "Mis Logros"
    const TABS_CONFIG = [
        { id: TABS.MY_SPACE, label: 'Mi Espacio', icon: UserCircleIcon },
        { id: TABS.PUBLICATIONS, label: 'Mis Servicios', icon: ListBulletIcon },
        { id: TABS.MY_EVENTS, label: 'Mis Eventos', icon: CalendarDaysIcon },
        { id: TABS.ACHIEVEMENTS, label: 'Mis Logros', icon: TrophyIcon },
        { id: TABS.NOTIFICATIONS, label: 'Suscripciones', icon: BellIcon },
    ];

    return (
        <section
            id="member-dashboard"
            className="bg-gradient-to-b from-ecuador-blue-light via-gray-100 to-white py-8"
        >
            <div className="container mx-auto px-2 sm:px-4">
                <motion.div 
                    className="max-w-8xl mx-auto bg-white/95 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-10 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ecuador-blue font-montserrat drop-shadow-sm">
                                    ¡Bienvenido, {user.name || user.email}!
                                </h2>
                                <p className="text-gray-800 mt-2 text-base sm:text-lg">
                                    Gestiona tu perfil, publicaciones y preferencias desde aquí.
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 flex items-center space-x-4">
                                <InlineAchievements user={userWithLiveCounts} setActiveTab={setActiveTab} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-12">
                        <QuickAccessLinks onOpenAddModal={handleOpenAddModal} onNavigateToDirectory={handleNavigateToDirectory} onOpenUserProfileModal={() => auth?.openUserProfileModal()} onOpenAddEventModal={handleOpenAddEventModal} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                        {/* Navegación de Pestañas */}
                        <aside className="w-full md:w-1/4 mb-6 md:mb-0">
                            <nav className="flex flex-row md:flex-col gap-2">
                                {TABS_CONFIG.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left font-semibold p-3 rounded-xl transition-all duration-200 text-sm md:text-base flex items-center space-x-3 border
                                        ${
                                            activeTab === tab.id
                                                ? 'bg-ecuador-blue text-white shadow-lg border-ecuador-blue'
                                                : 'bg-gray-50 text-gray-800 hover:bg-ecuador-yellow-light hover:text-ecuador-blue border-gray-200'
                                        }`}
                                        style={{ minWidth: 0 }}
                                    >
                                        <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-ecuador-blue'}`} />
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Contenido de la Pestaña */}
                        <main className="w-full md:w-3/4 bg-slate-50/50 p-6 rounded-lg">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="min-h-[350px]"
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </div>
                </motion.div>
            </div>

            {/* MODALES */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={serviceToEdit ? "Editar Servicio" : "Agregar Nuevo Servicio"} fullWidth={true}>
                <AddServiceForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsServiceModalOpen(false)}
                    initialData={serviceToEdit}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <div className="p-4">
                    <p className="text-gray-800">¿Estás seguro de que quieres eliminar el servicio "<strong>{serviceToDelete?.serviceName}</strong>"? Esta acción no se puede deshacer.</p>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleConfirmDelete} className="bg-ecuador-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Crear Nuevo Evento" fullWidth={true}>
                <AddEventForm
                    onSuccess={handleEventSuccess}
                    onCancel={() => setIsEventModalOpen(false)}
                />
            </Modal>
        </section>
    );
};