
// /home/alexis/Sites/Landings/conexion-ec-ca/components/admin/ServiceManager.tsx

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { CommunityServiceItem, ServiceStatus } from '../../types';
import { getAllServicesForAdmin, updateServiceStatus, batchUpdateServices } from '../../services/directoryService';
import { CheckCircleIcon, XCircleIcon } from '../icons';
import { AuthContext } from '../../contexts/AuthContext';
import { cityData } from '../../constants';
import { DocumentSnapshot } from 'firebase/firestore';

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
    const auth = useContext(AuthContext);
    const [services, setServices] = useState<CommunityServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [provinceFilter, setProvinceFilter] = useState<string>('');

    // Pagination & Bulk Actions State
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [cursorStack, setCursorStack] = useState<(DocumentSnapshot | null)[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());

    const LIMIT = 20;

    const provinces = useMemo(() => cityData.map(data => data.provincia), []);

    const fetchServices = useCallback(async (reset: boolean = false, cursor: DocumentSnapshot | null = null) => {
        setLoading(true);
        try {
            const filters = auth?.user?.role === 'regional_admin' && auth.user.managedProvince
                ? { province: auth.user.managedProvince }
                : {};
            
            // Si hay un filtro de provincia seleccionado manualmente (para super admin), lo usamos
            if (auth?.user?.role !== 'regional_admin' && provinceFilter) {
                 // @ts-ignore
                filters.province = provinceFilter;
            }

            const { services: fetchedServices, lastVisible: newLastVisible } = await getAllServicesForAdmin(filters, cursor, LIMIT);
            
            setServices(fetchedServices);
            setLastVisible(newLastVisible);
            
            if (reset) {
                setCursorStack([null]);
                setCurrentPageIndex(0);
                setSelectedServiceIds(new Set());
            }
        } catch (err) {
            toast.error("No se pudieron cargar los servicios.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auth?.user, provinceFilter]);

    useEffect(() => {
        fetchServices(true);
        if (auth?.user?.role === 'regional_admin' && auth.user.managedProvince) {
            setProvinceFilter(auth.user.managedProvince);
        }
    }, [auth?.user, fetchServices]); // Removed provinceFilter from dependency to avoid loop, fetchServices depends on it

    const handleStatusUpdate = async (serviceId: string, newStatus: ServiceStatus) => {
        const service = services.find(s => s.id === serviceId);
        if (!service || !service.contact || !service.contactName) {
            toast.error("No se puede notificar: faltan datos de contacto.");
            return;
        }

        let rejectionReason: string | null = null;
        if (newStatus === ServiceStatus.RECHAZADO) {
            rejectionReason = prompt("Opcional: Motivo del rechazo.");
        }

        const toastId = toast.loading('Actualizando estado...');

        try {
            await updateServiceStatus(serviceId, newStatus);
            toast.success(`Servicio actualizado a "${newStatus}".`, { id: toastId });

            // Notificación simplificada
            await sendNotification(service, newStatus, rejectionReason);
             
            // Actualizar localmente
            setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: newStatus } : s));

        } catch (error) {
            toast.error("Ocurrió un error al actualizar el estado.", { id: toastId });
            console.error("Failed to update service status:", error);
        }
    };

    const sendNotification = async (service: CommunityServiceItem, newStatus: ServiceStatus, rejectionReason: string | null) => {
        try {
            await fetch('/.netlify/functions/send-transactional-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail: service.contact,
                    recipientName: service.contactName,
                    emailType: newStatus === ServiceStatus.APROBADO ? 'submission-approved' : 'submission-rejected',
                    item: {
                        name: service.serviceName,
                        type: 'Servicio',
                        id: service.id,
                        rejectionReason: rejectionReason || 'El equipo de administración ha revisado el contenido.'
                    }
                })
            });
            
             if (newStatus === ServiceStatus.APROBADO) {
                await fetch('/.netlify/functions/update-gamification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: service.userId, actionType: 'SERVICE_APPROVED' }),
                });
            }
        } catch (error) {
             console.error("Notification failed:", error);
        }
    }

    // Bulk Actions
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedServiceIds(new Set(filteredServices.map(s => s.id)));
        } else {
            setSelectedServiceIds(new Set());
        }
    };

    const toggleSelectService = (id: string) => {
        const newSelected = new Set(selectedServiceIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedServiceIds(newSelected);
    };

    const handleBulkStatusUpdate = async (status: ServiceStatus) => {
        if (selectedServiceIds.size === 0) return;
        
        if (!window.confirm(`¿Estás seguro de marcar como ${status} a ${selectedServiceIds.size} servicios?`)) {
            return;
        }

        const toastId = toast.loading(`Actualizando ${selectedServiceIds.size} servicios...`);
        try {
            await batchUpdateServices(Array.from(selectedServiceIds), { status });
            toast.success(`Servicios actualizados a ${status}.`, { id: toastId });
            fetchServices(false, cursorStack[currentPageIndex]);
            setSelectedServiceIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar servicios.", { id: toastId });
        }
    };

    // Pagination Controls
    const goToNextPage = () => {
        if (lastVisible) {
            const nextIndex = currentPageIndex + 1;
            const newStack = [...cursorStack];
            if (nextIndex >= newStack.length) {
                newStack.push(lastVisible);
            }
            setCursorStack(newStack);
            setCurrentPageIndex(nextIndex);
            fetchServices(false, lastVisible);
        }
    };

    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setCurrentPageIndex(prevIndex);
            fetchServices(false, cursorStack[prevIndex]);
        }
    };

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const statusMatch = statusFilter === 'all' || service.status === statusFilter;
            const searchMatch = searchQuery === '' ||
                (service.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (service.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            // El filtro de provincia ya se aplica en el servidor para carga inicial, 
            // pero si hay servicios cargados y cambiamos el filtro en UI (si no se recarga)
            // Aquí realmente estamos filtrando lo que ya trajimos.
            // Para consistencia con la carga lazy, al cambiar provincia deberíamos recargar fetchServices.
            // Lo cual ya hacemos con el useEffect que depende de fetchServices que depende de provinceFilter.
            // Así que este filtro client-side es redundante pero seguro.
            const provinceMatch = provinceFilter === '' || service.province === provinceFilter;

            return statusMatch && searchMatch && provinceMatch;
        });
    }, [services, statusFilter, searchQuery, provinceFilter]);

    const badgeClasses: Record<string, string> = {
        [ServiceStatus.APROBADO]: 'bg-green-100 text-green-800',
        [ServiceStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [ServiceStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Servicios</h2>
                {selectedServiceIds.size > 0 && (
                    <div className="flex space-x-2 animate-fadeIn bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-800 font-medium self-center mr-2">{selectedServiceIds.size} seleccionados</span>
                        <button onClick={() => handleBulkStatusUpdate(ServiceStatus.APROBADO)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                            Aprobar Selección
                        </button>
                        <button onClick={() => handleBulkStatusUpdate(ServiceStatus.RECHAZADO)} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
                            Rechazar Selección
                        </button>
                    </div>
                )}
            </div>

            {auth?.user?.role === 'regional_admin' && (
                <p className="mb-4 text-lg text-gray-600">Mostrando servicios para la provincia de: <span className="font-bold">{auth.user.managedProvince}</span></p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input type="text" placeholder="Buscar por servicio o usuario..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                    <option value="all">Todos los Estados</option>
                    <option value={ServiceStatus.PENDIENTE}>Pendiente</option>
                    <option value={ServiceStatus.APROBADO}>Aprobado</option>
                    <option value={ServiceStatus.RECHAZADO}>Rechazado</option>
                </select>
                <select 
                    value={provinceFilter} 
                    onChange={e => setProvinceFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                    disabled={auth?.user?.role === 'regional_admin'}
                >
                    <option value="">Todas las Provincias</option>
                    {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                    ))}
                </select>
            </div>
            {loading ? <p>Cargando...</p> : (
                <>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input 
                                    type="checkbox" 
                                    onChange={toggleSelectAll} 
                                    checked={filteredServices.length > 0 && selectedServiceIds.size === filteredServices.length}
                                    className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredServices.map(service => (
                            <tr key={service.id} className={selectedServiceIds.has(service.id) ? 'bg-blue-50' : ''}>
                                <td className="px-4 py-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedServiceIds.has(service.id)}
                                        onChange={() => toggleSelectService(service.id)}
                                        className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{service.serviceName}</td>
                                <td className="px-4 py-3 text-gray-600">{service.contactName}</td>
                                <td className="px-4 py-3 text-gray-600">{service.province || 'N/A'}</td>
                                <td className="px-4 py-3"><StatusBadge text={service.status} className={badgeClasses[service.status]} /></td>
                                <td className="px-4 py-3 space-x-2">
                                    <ActionButton onClick={() => handleStatusUpdate(service.id, ServiceStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={service.status === ServiceStatus.APROBADO}><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar</ActionButton>
                                    <ActionButton onClick={() => handleStatusUpdate(service.id, ServiceStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={service.status === ServiceStatus.RECHAZADO}><XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar</ActionButton>
                                </td>
                            </tr>
                        ))}
                        {filteredServices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">No se encontraron servicios en esta página.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                        Página {currentPageIndex + 1}
                    </span>
                    <div className="space-x-2">
                        <button 
                            onClick={goToPreviousPage} 
                            disabled={currentPageIndex === 0}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button 
                            onClick={goToNextPage} 
                            disabled={!lastVisible}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default ServiceManager;
