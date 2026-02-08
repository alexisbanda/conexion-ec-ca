
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { EventItem, ServiceStatus as EventStatus } from '../../types';
import { getAllEventsForAdmin, updateEvent, batchUpdateEvents } from '../../services/eventService';
import { CheckCircleIcon, XCircleIcon } from '../icons';
import { Timestamp, DocumentSnapshot } from 'firebase/firestore';

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

const formatDate = (timestamp: Timestamp) => timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

// --- GESTOR DE EVENTOS ---
const EventManager: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination & Bulk Actions State
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [cursorStack, setCursorStack] = useState<(DocumentSnapshot | null)[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());

    const LIMIT = 20;

    const fetchEvents = useCallback(async (reset: boolean = false, cursor: DocumentSnapshot | null = null) => {
        setLoading(true);
        try {
            // Nota: El filtrado por estado y búsqueda se hace en cliente por simplicidad 
            // dado que Firestore no permite filtrado complejo con paginación fácilmente sin índices compuestos.
            // Para producción con muchos datos, se ideal filtrar en backend.
            // Aquí traemos pagina por pagina y filtramos en UI (lo cual puede ser confuso si el match está en otra página).
            // PERO, para mantener consistencia con User/Ad Manager, vamos a traer paginado todos y permitir acción sobre ellos.
            // Si el usuario quiere buscar, idealmente deberíamos buscar en backend.
            // Por ahora mantenemos la lógica de User/AdManager: paginación de "todos" y selección.
            
            const filters = {}; // filters?.province future support
            
            const { events: fetchedEvents, lastVisible: newLastVisible } = await getAllEventsForAdmin(filters, cursor, LIMIT);
            
            setEvents(fetchedEvents);
            setLastVisible(newLastVisible);
            
            if (reset) {
                setCursorStack([null]);
                setCurrentPageIndex(0);
                setSelectedEventIds(new Set());
            }
        } catch (err) {
            toast.error("No se pudieron cargar los eventos.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents(true);
    }, [fetchEvents]);

    // HANDLERS
    const handleStatusUpdate = async (event: EventItem, newStatus: EventStatus) => {
        if (!event.userId || !event.contactName || !event.contact) {
            toast.error("No se puede notificar: faltan datos de contacto.");
            return;
        }

        let rejectionReason: string | null = null;
        if (newStatus === EventStatus.RECHAZADO) {
            rejectionReason = prompt("Opcional: Motivo del rechazo.");
        }

        const toastId = toast.loading('Actualizando estado...');

        try {
            await updateEvent(event.id, { ...event, status: newStatus });
            toast.success(`Evento actualizado a "${newStatus}".`, { id: toastId });

            // Notificación (simplificada para no repetir código, idealmente mover a servicio o hook)
            await sendNotification(event, newStatus, rejectionReason);

            updateLocalEventStatus(event.id, newStatus);
        } catch (error) {
            toast.error("Error al actualizar estado.", { id: toastId });
            console.error(error);
        }
    };

    const sendNotification = async (event: EventItem, newStatus: EventStatus, rejectionReason: string | null) => {
        try {
            await fetch('/.netlify/functions/send-transactional-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail: event.contact,
                    recipientName: event.contactName,
                    emailType: newStatus === EventStatus.APROBADO ? 'submission-approved' : 'submission-rejected',
                    item: {
                        name: event.title,
                        type: 'Evento',
                        id: event.id,
                        rejectionReason: rejectionReason || 'El equipo de administración ha revisado el contenido.'
                    }
                })
            });
            
            if (newStatus === EventStatus.APROBADO) {
                await fetch('/.netlify/functions/update-gamification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: event.userId, actionType: 'EVENT_APPROVED' }),
                });
            }
        } catch (error) {
            console.error("Notification/Gamification failed:", error);
        }
    };

    const updateLocalEventStatus = (id: string, status: EventStatus) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    };

    // Bulk Actions
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
        } else {
            setSelectedEventIds(new Set());
        }
    };

    const toggleSelectEvent = (id: string) => {
        const newSelected = new Set(selectedEventIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEventIds(newSelected);
    };

    const handleBulkStatusUpdate = async (status: EventStatus) => {
        if (selectedEventIds.size === 0) return;
        
        if (!window.confirm(`¿Estás seguro de marcar como ${status} a ${selectedEventIds.size} eventos?`)) {
            return;
        }

        const toastId = toast.loading(`Actualizando ${selectedEventIds.size} eventos...`);
        try {
            // Nota: batchUpdateEvents solo actualiza Firestore. 
            // No envía correos ni gamificación masiva por ahora para evitar timeouts/spam.
            // Si se requiere, se debería hacer en backend function.
            await batchUpdateEvents(Array.from(selectedEventIds), { status });
            toast.success(`Eventos actualizados a ${status}.`, { id: toastId });
            
            // Actualizar UI localmente o recargar
            fetchEvents(false, cursorStack[currentPageIndex]);
            setSelectedEventIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar eventos.", { id: toastId });
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
            fetchEvents(false, lastVisible);
        }
    };

    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setCurrentPageIndex(prevIndex);
            fetchEvents(false, cursorStack[prevIndex]);
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const statusMatch = statusFilter === 'all' || event.status === statusFilter;
            const searchMatch = searchQuery === '' ||
                (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [events, statusFilter, searchQuery]);

    const badgeClasses: Record<string, string> = {
        [EventStatus.APROBADO]: 'bg-green-100 text-green-800',
        [EventStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [EventStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Eventos</h2>
                {selectedEventIds.size > 0 && (
                    <div className="flex space-x-2 animate-fadeIn bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-800 font-medium self-center mr-2">{selectedEventIds.size} seleccionados</span>
                        <button onClick={() => handleBulkStatusUpdate(EventStatus.APROBADO)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                            Aprobar Selección
                        </button>
                        <button onClick={() => handleBulkStatusUpdate(EventStatus.RECHAZADO)} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
                            Rechazar Selección
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input type="text" placeholder="Buscar en esta página..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                    <option value="all">Todos los Estados</option>
                    <option value={EventStatus.PENDIENTE}>Pendiente</option>
                    <option value={EventStatus.APROBADO}>Aprobado</option>
                    <option value={EventStatus.RECHAZADO}>Rechazado</option>
                </select>
            </div>
            
            {loading ? <p className="text-center py-10">Cargando eventos...</p> : (
                <>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input 
                                    type="checkbox" 
                                    onChange={toggleSelectAll} 
                                    checked={filteredEvents.length > 0 && selectedEventIds.size === filteredEvents.length}
                                    className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredEvents.map(event => (
                            <tr key={event.id} className={selectedEventIds.has(event.id) ? 'bg-blue-50' : ''}>
                                <td className="px-4 py-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedEventIds.has(event.id)}
                                        onChange={() => toggleSelectEvent(event.id)}
                                        className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                                <td className="px-4 py-3 text-gray-600">{event.contactName || 'N/A'}</td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(event.date)}</td>
                                <td className="px-4 py-3"><StatusBadge text={event.status} className={badgeClasses[event.status]} /></td>
                                <td className="px-4 py-3 space-x-2">
                                    <ActionButton onClick={() => handleStatusUpdate(event, EventStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={event.status === EventStatus.APROBADO}><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar</ActionButton>
                                    <ActionButton onClick={() => handleStatusUpdate(event, EventStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={event.status === EventStatus.RECHAZADO}><XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar</ActionButton>
                                </td>
                            </tr>
                        ))}
                        {filteredEvents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">No se encontraron eventos en esta página.</td>
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

export default EventManager;
