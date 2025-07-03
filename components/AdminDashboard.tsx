// /home/alexis/Sites/Landings/conexion-ec-ca/components/AdminDashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CommunityServiceItem, ServiceStatus, User, UserStatus, EventItem, NewsItem } from '../types';
import { getAllServicesForAdmin, updateServiceStatus } from '../services/directoryService';
import { getAllUsers, updateUserStatus as updateUserStatusService } from '../services/userService';
import { CheckCircleIcon, XCircleIcon, UserGroupIcon, BriefcaseIcon, InformationCircleIcon, CalendarDaysIcon, NewspaperIcon } from './icons';
import { sendApprovalEmail } from '../services/emailService';
import { Modal } from './Modal';
import { UserDetailsDisplay } from './UserDetailsDisplay';
import * as eventService from '../services/eventService';
import * as newsService from '../services/newsService';
import { ContentManager } from './ContentManager';
import { Timestamp } from 'firebase/firestore';

// --- Componentes de UI Reutilizables (sin cambios) ---
const ActionButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode; disabled?: boolean }> = ({ onClick, className, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center justify-center ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const StatusBadge: React.FC<{ text: string; className: string; }> = ({ text, className }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>{text}</span>
);

// --- Configuración para ContentManager ---
const eventApi = {
    getAll: eventService.getAllEventsForAdmin,
    create: eventService.createEvent,
    update: eventService.updateEvent,
    remove: eventService.deleteEvent,
};

const newsApi = {
    getAll: newsService.getAllNewsForAdmin,
    create: newsService.createNews,
    update: newsService.updateNews,
    remove: newsService.deleteNews,
};

const formatDate = (timestamp: Timestamp) => timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

const eventColumns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Fecha', accessor: 'date', render: (item: EventItem) => formatDate(item.date) },
    { header: 'Premium', accessor: 'isPremium', render: (item: EventItem) => item.isPremium ? 'Sí' : 'No' },
];

const newsColumns = [
    { header: 'Título', accessor: 'title' },
    { header: 'Fecha Pub.', accessor: 'publishedAt', render: (item: NewsItem) => formatDate(item.publishedAt) },
];


// ===================================================================
// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
// ===================================================================
export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'services' | 'events' | 'news'>('users');
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

    const handleOpenUserDetails = (user: User) => {
        setSelectedUserForDetails(user);
        setIsUserDetailsModalOpen(true);
    };

    const handleCloseUserDetails = () => {
        setIsUserDetailsModalOpen(false);
        setSelectedUserForDetails(null);
    };

    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen pt-24">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-ecuador-blue mb-8 font-montserrat">Panel de Administración</h1>

                <div className="mb-8 border-b border-gray-300">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'users' ? 'border-ecuador-red text-ecuador-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <UserGroupIcon className="w-5 h-5 mr-2" /> Gestionar Usuarios
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'services' ? 'border-ecuador-red text-ecuador-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <BriefcaseIcon className="w-5 h-5 mr-2" /> Gestionar Servicios
                        </button>
                        <button onClick={() => setActiveTab('events')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'events' ? 'border-ecuador-red text-ecuador-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <CalendarDaysIcon className="w-5 h-5 mr-2" /> Gestionar Eventos
                        </button>
                        <button onClick={() => setActiveTab('news')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'news' ? 'border-ecuador-red text-ecuador-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <NewspaperIcon className="w-5 h-5 mr-2" /> Gestionar Noticias
                        </button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'users' && <UserManager onOpenDetails={handleOpenUserDetails} />}
                    {activeTab === 'services' && <ServiceManager />}
                    {activeTab === 'events' && <ContentManager title="Eventos" itemType="event" api={eventApi} columns={eventColumns} />}
                    {activeTab === 'news' && <ContentManager title="Noticias" itemType="news" api={newsApi} columns={newsColumns} />}
                </div>
            </div>

            <Modal isOpen={isUserDetailsModalOpen} onClose={handleCloseUserDetails} title={`Detalles de ${selectedUserForDetails?.name || 'Usuario'}`}>
                {selectedUserForDetails && <UserDetailsDisplay user={selectedUserForDetails} />}
            </Modal>
        </section>
    );
};

// ===================================================================
// --- GESTOR DE USUARIOS ---
// ===================================================================
const UserManager: React.FC<{ onOpenDetails: (user: User) => void }> = ({ onOpenDetails }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('Pendiente');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const users = await getAllUsers();
            setAllUsers(users);
        } catch (err) {
            toast.error("No se pudieron cargar los usuarios.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleStatusUpdate = async (userId: string, newStatus: UserStatus) => {
        const promise = updateUserStatusService(userId, newStatus);
        await toast.promise(promise, {
            loading: 'Actualizando...',
            success: `Usuario actualizado a "${newStatus}".`,
            error: 'Error al actualizar el usuario.',
        });

        if (newStatus === UserStatus.APROBADO) {
            const userToNotify = allUsers.find(u => u.id === userId);
            if (userToNotify?.email && userToNotify?.name) {
                await sendApprovalEmail({ name: userToNotify.name, email: userToNotify.email });
            }
        }
        fetchUsers();
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const userStatus = user.status || 'Pendiente';
            const statusMatch = statusFilter === 'all' || userStatus === statusFilter;
            const searchMatch = searchQuery === '' ||
                (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [allUsers, statusFilter, searchQuery]);

    const badgeClasses: Record<string, string> = {
        [UserStatus.APROBADO]: 'bg-green-100 text-green-800',
        [UserStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [UserStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Usuarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input type="text" placeholder="Buscar por nombre o email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                    <option value="all">Todos los Estados</option>
                    <option value={UserStatus.PENDIENTE}>Pendiente</option>
                    <option value={UserStatus.APROBADO}>Aprobado</option>
                    <option value={UserStatus.RECHAZADO}>Rechazado</option>
                </select>
            </div>
            {loading ? <p>Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                <td className="px-4 py-3"><StatusBadge text={user.status || 'Pendiente'} className={badgeClasses[user.status || 'Pendiente']} /></td>
                                <td className="px-4 py-3 space-x-2 flex items-center">
                                    <ActionButton onClick={() => onOpenDetails(user)} className="bg-blue-100 text-blue-800 hover:bg-blue-200"><InformationCircleIcon className="w-4 h-4 inline mr-1" /> Detalles</ActionButton>
                                    <ActionButton onClick={() => handleStatusUpdate(user.id, UserStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={user.status === UserStatus.APROBADO}><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar</ActionButton>
                                    <ActionButton onClick={() => handleStatusUpdate(user.id, UserStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={user.status === UserStatus.RECHAZADO}><XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar</ActionButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ===================================================================
// --- GESTOR DE SERVICIOS ---
// ===================================================================
const ServiceManager: React.FC = () => {
    const [allServices, setAllServices] = useState<CommunityServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('Pendiente');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const services = await getAllServicesForAdmin();
            setAllServices(services);
        } catch (err) {
            toast.error("No se pudieron cargar los servicios.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleStatusUpdate = async (serviceId: string, newStatus: ServiceStatus) => {
        const promise = updateServiceStatus(serviceId, newStatus);
        await toast.promise(promise, {
            loading: 'Actualizando...',
            success: `Servicio actualizado a "${newStatus}".`,
            error: 'Error al actualizar el servicio.',
        });
        fetchServices();
    };

    const filteredServices = useMemo(() => {
        return allServices.filter(service => {
            const statusMatch = statusFilter === 'all' || service.status === statusFilter;
            const searchMatch = searchQuery === '' ||
                (service.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (service.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [allServices, statusFilter, searchQuery]);

    const badgeClasses: Record<string, string> = {
        [ServiceStatus.APROBADO]: 'bg-green-100 text-green-800',
        [ServiceStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [ServiceStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Servicios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input type="text" placeholder="Buscar por servicio o usuario..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                    <option value="all">Todos los Estados</option>
                    <option value={ServiceStatus.PENDIENTE}>Pendiente</option>
                    <option value={ServiceStatus.APROBADO}>Aprobado</option>
                    <option value={ServiceStatus.RECHAZADO}>Rechazado</option>
                </select>
            </div>
            {loading ? <p>Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredServices.map(service => (
                            <tr key={service.id}>
                                <td className="px-4 py-3 font-medium text-gray-900">{service.serviceName}</td>
                                <td className="px-4 py-3 text-gray-600">{service.contactName}</td>
                                <td className="px-4 py-3"><StatusBadge text={service.status} className={badgeClasses[service.status]} /></td>
                                <td className="px-4 py-3 space-x-2">
                                    <ActionButton onClick={() => handleStatusUpdate(service.id, ServiceStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={service.status === ServiceStatus.APROBADO}><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar</ActionButton>
                                    <ActionButton onClick={() => handleStatusUpdate(service.id, ServiceStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={service.status === ServiceStatus.RECHAZADO}><XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar</ActionButton>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};