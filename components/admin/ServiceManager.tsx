
// /home/alexis/Sites/Landings/conexion-ec-ca/components/admin/ServiceManager.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CommunityServiceItem, ServiceStatus } from '../../types';
import { getAllServicesForAdmin, updateServiceStatus } from '../../services/directoryService';
import { CheckCircleIcon, XCircleIcon } from '../icons';

// --- Componentes de UI Reutilizables ---
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

// --- GESTOR DE SERVICIOS ---
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

export default ServiceManager;
