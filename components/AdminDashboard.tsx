// /home/alexis/Sites/Landings/conexion-ec-ca/components/AdminDashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CommunityServiceItem, ServiceStatus, User, UserStatus } from '../types';
import { getAllServicesForAdmin, updateServiceStatus } from '../services/directoryService';
// --- CAMBIO: Importamos getAllUsers en lugar de getPendingUsers ---
import { getAllUsers, updateUserStatus as updateUserStatusService } from '../services/userService';
import { CheckCircleIcon, XCircleIcon } from './icons';
import { sendApprovalEmail } from '../services/emailService'; // <-- 1. IMPORTAR EL NUEVO SERVICIO
// --- COMPONENTES REUTILIZABLES ---

const ActionButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode; disabled?: boolean }> = ({ onClick, className, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center justify-center ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const ServiceStatusBadge: React.FC<{ status: ServiceStatus }> = ({ status }) => {
    const badgeClasses: Record<ServiceStatus, string> = {
        [ServiceStatus.APROBADO]: 'bg-green-100 text-green-800',
        [ServiceStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [ServiceStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[status]}`}>{status}</span>;
};

// --- NUEVO: Componente para el badge de estado de usuario ---
const UserStatusBadge: React.FC<{ status: UserStatus | undefined }> = ({ status }) => {
    const badgeClasses: Record<string, string> = {
        [UserStatus.APROBADO]: 'bg-green-100 text-green-800',
        [UserStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [UserStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };
    const currentStatus = status || UserStatus.PENDIENTE;
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClasses[currentStatus]}`}>{currentStatus}</span>;
};


// --- COMPONENTE PRINCIPAL ---

export const AdminDashboard: React.FC = () => {
    // Estados para la gestión de servicios
    const [allServices, setAllServices] = useState<CommunityServiceItem[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [errorServices, setErrorServices] = useState<string | null>(null);
    const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('PENDIENTE');
    const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // --- CAMBIO: Estados para TODOS los usuarios y sus filtros ---
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [userStatusFilter, setUserStatusFilter] = useState<string>('PENDIENTE');
    const [userSearchQuery, setUserSearchQuery] = useState<string>('');


    const fetchAllServices = useCallback(async () => {
        setLoadingServices(true);
        setErrorServices(null);
        try {
            const services = await getAllServicesForAdmin();
            setAllServices(services);
        } catch (err) {
            setErrorServices('No se pudieron cargar los servicios.');
            console.error(err);
        } finally {
            setLoadingServices(false);
        }
    }, []);

    // --- CAMBIO: Función para cargar TODOS los usuarios ---
    const fetchAllUsers = useCallback(async () => {
        setLoadingUsers(true);
        setErrorUsers(null);
        try {
            const users = await getAllUsers();
            setAllUsers(users);
        } catch (err) {
            setErrorUsers('No se pudieron cargar los usuarios.');
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchAllServices();
        fetchAllUsers(); // <-- Llamamos a la nueva función
    }, [fetchAllServices, fetchAllUsers]);

    const handleServiceStatusUpdate = async (serviceId: string, newStatus: ServiceStatus) => {
        try {
            await updateServiceStatus(serviceId, newStatus);
            setAllServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: newStatus } : s));
        } catch (err) {
            alert(`Error al actualizar el estado del servicio.`);
            console.error(err);
        }
    };

    // --- CAMBIO: La actualización de estado de usuario ahora modifica la lista, no la filtra ---
    const handleUserStatusUpdate = async (userId: string, newStatus: UserStatus) => {
        try {
            await updateUserStatusService(userId, newStatus);

            // Actualizar el estado local de la UI
            const updatedUsers = allUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u);
            setAllUsers(updatedUsers);

            // --- 2. ENVIAR CORREO SI SE APRUEBA ---
            if (newStatus === UserStatus.APROBADO) {
                const userToNotify = updatedUsers.find(u => u.id === userId);
                if (userToNotify && userToNotify.email && userToNotify.name) {
                    await sendApprovalEmail({ name: userToNotify.name, email: userToNotify.email });
                }
            }
            // --- FIN DE LA INTEGRACIÓN ---

        } catch (err) {
            alert(`Error al actualizar el estado del usuario.`);
            console.error(err);
        }
    };

    const filteredServices = useMemo(() => {
        // ... (lógica de filtro de servicios sin cambios)
        return allServices.filter(service => {
            const serviceDate = service.createdAt?.toDate();
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const searchMatch = serviceSearchQuery === '' ||
                (service.serviceName || '').toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                (service.contactName || '').toLowerCase().includes(serviceSearchQuery.toLowerCase());
            return (
                (serviceStatusFilter === 'all' || service.status === serviceStatusFilter) &&
                searchMatch &&
                (!start || (serviceDate && serviceDate >= start)) &&
                (!end || (serviceDate && serviceDate <= end))
            );
        });
    }, [allServices, serviceStatusFilter, serviceSearchQuery, startDate, endDate]);

    // --- NUEVO: Lógica de filtrado para usuarios ---
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const statusMatch = userStatusFilter === 'all' || user.status === userStatusFilter;
            const searchMatch = userSearchQuery === '' ||
                (user.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(userSearchQuery.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [allUsers, userStatusFilter, userSearchQuery]);

    return (
        <section className="py-16 md:py-24 bg-gray-100 min-h-screen pt-24">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-bold text-ecuador-blue mb-8 font-montserrat">
                    Panel de Administración
                </h1>

                <div className="grid grid-cols-1 gap-12">
                    {/* Sección de Gestión de Servicios */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Servicios</h2>
                        {/* Filtros de Servicios */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Buscar por servicio o usuario..."
                                value={serviceSearchQuery}
                                onChange={e => setServiceSearchQuery(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md text-sm"
                            />
                            <select value={serviceStatusFilter} onChange={e => setServiceStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                                <option value="all">Todos los Estados</option>
                                <option value={ServiceStatus.PENDIENTE}>Pendiente</option>
                                <option value={ServiceStatus.APROBADO}>Aprobado</option>
                                <option value={ServiceStatus.RECHAZADO}>Rechazado</option>
                            </select>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                        {/* Tabla de Servicios */}
                        {loadingServices ? <p>Cargando servicios...</p> : errorServices ? <p className="text-red-500">{errorServices}</p> : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {filteredServices.length > 0 ? filteredServices.map(service => (
                                        <tr key={service.id}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{service.serviceName}</td>
                                            <td className="px-4 py-3 text-gray-600">{service.contactName}</td>
                                            <td className="px-4 py-3 text-gray-600">{service.city}</td>
                                            <td className="px-4 py-3 text-gray-600">{service.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                                            <td className="px-4 py-3"><ServiceStatusBadge status={service.status} /></td>
                                            <td className="px-4 py-3 space-x-2">
                                                <ActionButton onClick={() => handleServiceStatusUpdate(service.id, ServiceStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={service.status === ServiceStatus.APROBADO}>
                                                    <CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar
                                                </ActionButton>
                                                <ActionButton onClick={() => handleServiceStatusUpdate(service.id, ServiceStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={service.status === ServiceStatus.RECHAZADO}>
                                                    <XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar
                                                </ActionButton>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">No se encontraron servicios con los filtros actuales.</td></tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* --- CAMBIO: Sección de Gestión de Usuarios --- */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Usuarios</h2>

                        {/* Filtros de Usuarios */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={userSearchQuery}
                                onChange={e => setUserSearchQuery(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md text-sm"
                            />
                            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                                <option value="all">Todos los Estados</option>
                                <option value={UserStatus.PENDIENTE}>Pendiente</option>
                                <option value={UserStatus.APROBADO}>Aprobado</option>
                                <option value={UserStatus.RECHAZADO}>Rechazado</option>
                            </select>
                        </div>

                        {/* Tabla de Usuarios */}
                        {loadingUsers ? <p>Cargando usuarios...</p> : errorUsers ? <p className="text-red-500">{errorUsers}</p> : (
                            <div className="overflow-x-auto">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-gray-500">No se encontraron usuarios con los filtros actuales.</p>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Registro</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                                <td className="px-4 py-3 text-gray-600">{user.createdAt?.toDate().toLocaleDateString() || 'N/A'}</td>
                                                <td className="px-4 py-3"><UserStatusBadge status={user.status} /></td>
                                                <td className="px-4 py-3 space-x-2">
                                                    <ActionButton onClick={() => handleUserStatusUpdate(user.id, UserStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={user.status === UserStatus.APROBADO}>
                                                        <CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar
                                                    </ActionButton>
                                                    <ActionButton onClick={() => handleUserStatusUpdate(user.id, UserStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={user.status === UserStatus.RECHAZADO}>
                                                        <XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar
                                                    </ActionButton>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};