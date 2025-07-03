// /home/alexis/Sites/Landings/conexion-ec-ca/components/MemberDashboard.tsx
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BriefcaseIcon, UserCircleIcon, MapPinIcon, PlusCircleIcon } from './icons';
import { useNavigate } from 'react-router-dom';
import { CommunityServiceItem, ServiceStatus } from '../types';
import { getUserServices, deleteService } from '../services/directoryService';
import { Modal } from './Modal';
import { AddServiceForm } from './AddServiceForm';

export const MemberDashboard: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [userServices, setUserServices] = useState<CommunityServiceItem[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<CommunityServiceItem | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<CommunityServiceItem | null>(null);

    const fetchUserServices = useCallback(async () => {
        if (auth?.user?.id) {
            setIsLoadingServices(true);
            const services = await getUserServices(auth.user.id);
            setUserServices(services);
            setIsLoadingServices(false);
        }
    }, [auth?.user?.id]);

    useEffect(() => {
        fetchUserServices();
    }, [fetchUserServices]);

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
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
            fetchUserServices();
        } catch (error) {
            console.error("Error al eliminar el servicio:", error);
            alert("No se pudo eliminar el servicio. Inténtalo de nuevo.");
        }
    };

    const handleSuccess = () => {
        setIsServiceModalOpen(false);
        setServiceToEdit(null);
        fetchUserServices();
    };

    if (!auth || !auth.isAuthenticated || !auth.user) {
        return (
            <section id="member-dashboard" className="py-16 md:py-24 bg-gray-100 text-center min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-ecuador-blue mb-4 font-montserrat">Acceso Restringido</h2>
                <p className="text-lg text-gray-700 mb-6">Por favor, inicia sesión para acceder a tu espacio de miembro.</p>
                <button onClick={auth?.openLoginModal} className="mt-6 bg-ecuador-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                    Iniciar Sesión
                </button>
            </section>
        );
    }

    const { user } = auth;

    const handleNavigateToSection = (sectionId: string) => {
        navigate('/');
        setTimeout(() => {
            const targetElement = document.getElementById(sectionId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const getStatusBadgeClass = (status: ServiceStatus) => {
        switch (status) {
            case ServiceStatus.APROBADO: return 'bg-green-100 text-green-800';
            case ServiceStatus.PENDIENTE: return 'bg-yellow-100 text-yellow-800';
            case ServiceStatus.RECHAZADO: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <section id="member-dashboard" className="py-16 md:py-24 bg-ecuador-blue-light min-h-screen pt-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-ecuador-blue mb-4 font-montserrat">
                        ¡Bienvenido, {user.name || user.email}!
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        Este es tu espacio exclusivo como miembro de Conexión Migrante EC-CA. Aquí encontrarás recursos y oportunidades diseñadas solo para ti.
                    </p>
                </div>

                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={handleOpenAddModal}>
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
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={() => handleNavigateToSection('resources-tools')}>
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
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 cursor-pointer" onClick={auth?.openUserProfileModal}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-ecuador-blue-light mr-4">
                                <UserCircleIcon className="w-6 h-6 text-ecuador-blue" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-gray-800">Mi Perfil</h4>
                                <p className="text-sm text-gray-600">Ver y editar tu información.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <div className="mt-16 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-ecuador-blue font-montserrat">Mis Publicaciones</h3>
                        <button
                            onClick={handleOpenAddModal}
                            className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center"
                            aria-label="Agregar nuevo servicio al directorio"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Agregar Nuevo
                        </button>
                    </div>

                    {isLoadingServices ? (
                        <p>Cargando tus publicaciones...</p>
                    ) : userServices.length > 0 ? (
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
                                {userServices.map(service => (
                                    <tr key={service.id}>
                                        <td className="px-4 py-3 text-gray-800 font-medium">{service.serviceName}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            <button onClick={() => handleOpenEditModal(service)} className="text-blue-600 hover:underline text-xs font-medium">Editar</button>
                                            <button onClick={() => handleOpenDeleteModal(service)} className="text-red-600 hover:underline text-xs font-medium">Eliminar</button>
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
            </div>

            {/* MODAL PARA AGREGAR/EDITAR SERVICIO */}
            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={serviceToEdit ? "Editar Servicio" : "Agregar Nuevo Servicio"}>
                <AddServiceForm
                    onSuccess={handleSuccess}
                    onCancel={() => setIsServiceModalOpen(false)}
                    initialData={serviceToEdit}
                />
            </Modal>

            {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
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