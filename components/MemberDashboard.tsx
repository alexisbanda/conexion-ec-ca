// /home/alexis/Sites/Landings/conexion-ec-ca/components/MemberDashboard.tsx
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CommunityServiceItem, ServiceStatus } from '../types';
import { getUserServices, deleteService } from '../services/directoryService';
import { Modal } from './Modal';
import { AddServiceForm } from './AddServiceForm';
import { NotificationPreferences } from './NotificationPreferences'; // 1. Importar el nuevo componente
import { BriefcaseIcon, UserCircleIcon, MapPinIcon, PlusCircleIcon, BellIcon, ListBulletIcon } from './icons'; // 2. Importar nuevos iconos

// --- Definición de las pestañas para una gestión limpia y sin errores de tipeo ---
const TABS = {
    PROFILE: 'Mi Perfil',
    PUBLICATIONS: 'Mis Publicaciones',
    NOTIFICATIONS: 'Notificaciones',
};

const ProfileSection: React.FC<{
    onOpenAddModal: () => void;
    onNavigateToDirectory: () => void;
    onOpenUserProfileModal: () => void;
}> = ({ onOpenAddModal, onNavigateToDirectory, onOpenUserProfileModal }) => (
    <div>
        <h3 className="text-2xl font-bold text-ecuador-blue mb-6 font-montserrat">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta para Publicar Servicio */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={onOpenAddModal}>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <BriefcaseIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Publicar un Servicio</h4>
                        <p className="text-sm text-gray-600">Ofrece tu ayuda a la comunidad.</p>
                    </div>
                </div>
            </div>
            {/* Tarjeta para Ver Directorio */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={onNavigateToDirectory}>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <MapPinIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Ver Directorio</h4>
                        <p className="text-sm text-gray-600">Explora los servicios de otros.</p>
                    </div>
                </div>
            </div>
            {/* Tarjeta para Editar Perfil */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={onOpenUserProfileModal}>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                        <UserCircleIcon className="w-6 h-6 text-ecuador-blue" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">Editar Mi Perfil</h4>
                        <p className="text-sm text-gray-600">Actualiza tu información.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

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
                <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat">Mis Publicaciones</h3>
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
                <p>Cargando tus publicaciones...</p>
            ) : services.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {services.map(service => (
                            <tr key={service.id}>
                                <td className="px-4 py-3 text-gray-800 font-medium">{service.serviceName}</td>
                                <td className="px-4 py-3">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(service.status)}`}>
                                            {service.status}
                                        </span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
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
    const navigate = useNavigate();

    // Estado para la pestaña activa
    const [activeTab, setActiveTab] = useState(TABS.PROFILE);

    // Estados para la gestión de servicios
    const [userServices, setUserServices] = useState<CommunityServiceItem[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<CommunityServiceItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<CommunityServiceItem | null>(null);

    const fetchUserServices = useCallback(async () => {
        if (auth?.user?.id) {
            setIsLoadingServices(true);
            try {
                const services = await getUserServices(auth.user.id);
                setUserServices(services);
            } catch (error) {
                console.error("Error fetching user services:", error);
            } finally {
                setIsLoadingServices(false);
            }
        }
    }, [auth?.user?.id]);

    useEffect(() => {
        // Cargar los servicios solo si la pestaña de publicaciones está activa o se carga por primera vez
        if (activeTab === TABS.PUBLICATIONS && userServices.length === 0) {
            fetchUserServices();
        }
    }, [activeTab, fetchUserServices, userServices.length]);

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

    const handleNavigateToDirectory = () => {
        auth?.openDirectoryModal?.();
    };

    // --- Renderizado Condicional del Contenido de la Pestaña ---
    const renderContent = () => {
        switch (activeTab) {
            case TABS.PROFILE:
                return <ProfileSection
                    onOpenAddModal={handleOpenAddModal}
                    onNavigateToDirectory={handleNavigateToDirectory}
                    onOpenUserProfileModal={() => auth?.openUserProfileModal()}
                />;
            case TABS.PUBLICATIONS:
                return <PublicationsSection
                    services={userServices}
                    isLoading={isLoadingServices}
                    onOpenAddModal={handleOpenAddModal}
                    onOpenEditModal={handleOpenEditModal}
                    onOpenDeleteModal={handleOpenDeleteModal}
                />;
            case TABS.NOTIFICATIONS:
                return <NotificationPreferences />; // 3. Renderizar el nuevo componente
            default:
                return <ProfileSection onOpenAddModal={handleOpenAddModal} onNavigateToDirectory={handleNavigateToDirectory} onOpenUserProfileModal={() => auth?.openUserProfileModal()} />;
        }
    };

    // --- Renderizado Principal del Componente ---
    if (!auth?.user) {
        return (
            <section className="py-20 text-center min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Acceso Restringido</h2>
                <p className="text-lg text-gray-700 mb-6">Por favor, inicia sesión para acceder a tu espacio de miembro.</p>
                <button onClick={auth?.openLoginModal} className="mt-6 bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                    Iniciar Sesión
                </button>
            </section>
        );
    }

    const { user } = auth;
    const TABS_CONFIG = [
        { id: TABS.PROFILE, label: 'Mi Perfil', icon: UserCircleIcon },
        { id: TABS.PUBLICATIONS, label: 'Mis Publicaciones', icon: ListBulletIcon },
        { id: TABS.NOTIFICATIONS, label: 'Notificaciones', icon: BellIcon },
    ];

    return (
        <section id="member-dashboard" className="bg-gray-100 py-12 md:py-20 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-ecuador-blue font-montserrat">
                            ¡Bienvenido, {user.name || user.email}!
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Gestiona tu perfil, publicaciones y preferencias desde aquí.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                        {/* Navegación de Pestañas (Sidebar en desktop) */}
                        <aside className="md:w-1/4">
                            <nav className="flex flex-row md:flex-col gap-2">
                                {TABS_CONFIG.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left font-semibold p-3 rounded-lg transition-all duration-200 text-sm md:text-base flex items-center space-x-3 ${
                                            activeTab === tab.id
                                                ? 'bg-ecuador-blue text-white shadow-md transform md:scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-ecuador-yellow-light hover:text-ecuador-blue'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Contenido de la Pestaña */}
                        <main className="md:w-3/4">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </div>

            {/* MODALES (se mantienen fuera de la estructura de pestañas para que funcionen globalmente) */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={serviceToEdit ? "Editar Servicio" : "Agregar Nuevo Servicio"}>
                <AddServiceForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsServiceModalOpen(false)}
                    initialData={serviceToEdit}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <div className="p-4">
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar el servicio "<strong>{serviceToDelete?.serviceName}</strong>"? Esta acción no se puede deshacer.</p>
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
        </section>
    );
};