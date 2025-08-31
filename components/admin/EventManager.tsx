
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { EventItem, ServiceStatus as EventStatus } from '../../types'; // Renombramos ServiceStatus para mantener la consistencia interna
import { getAllEventsForAdmin, updateEvent } from '../../services/eventService'; // Corregido: usamos updateEvent
import { CheckCircleIcon, XCircleIcon } from '../icons';
import { Timestamp } from 'firebase/firestore';

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
    const [allEvents, setAllEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('Pendiente');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const events = await getAllEventsForAdmin();
            setAllEvents(events);
        } catch (err) {
            toast.error("No se pudieron cargar los eventos.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleStatusUpdate = async (event: EventItem, newStatus: EventStatus) => {
        // Asumimos que el objeto event que llega aquí tiene la info de contacto necesaria
        if (!event.userId || !event.contactName || !event.contact) {
            toast.error("No se puede notificar: faltan datos de contacto en este evento.");
            return;
        }

        let rejectionReason: string | null = null;
        if (newStatus === EventStatus.RECHAZADO) {
            rejectionReason = prompt("Opcional: Introduce un breve motivo para el rechazo. Se incluirá en el correo al usuario.");
        }

        const toastId = toast.loading('Actualizando estado...');

        try {
            // 1. Actualizar el estado en Firestore usando la función correcta
            await updateEvent(event.id, { ...event, status: newStatus });
            toast.success(`Evento actualizado a "${newStatus}".`, { id: toastId });

            // 2. Enviar el correo de notificación al usuario
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
                toast.success("Correo de notificación enviado al usuario.");
            } catch (emailError) {
                console.error("Notification email failed to send:", emailError);
                toast.error("Error al enviar el correo de notificación.");
            }

            // 3. Otorgar puntos de bonificación si es aprobado
            if (newStatus === EventStatus.APROBADO) {
                try {
                    await fetch('/.netlify/functions/update-gamification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: event.userId,
                            actionType: 'EVENT_APPROVED',
                        }),
                    });
                    toast.success("Puntos de bonificación otorgados.");
                } catch (gamificationError) {
                    console.error("Gamification points failed to send:", gamificationError);
                    // No es crítico, solo loguear
                }
            }

            // 4. Refrescar la lista en la UI
            fetchEvents();

        } catch (error) {
            toast.error("Ocurrió un error al actualizar el estado.", { id: toastId });
            console.error("Failed to update event status:", error);
        }
    };

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const statusMatch = statusFilter === 'all' || event.status === statusFilter;
            const searchMatch = searchQuery === '' ||
                (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && searchMatch;
        });
    }, [allEvents, statusFilter, searchQuery]);

    const badgeClasses: Record<string, string> = {
        [EventStatus.APROBADO]: 'bg-green-100 text-green-800',
        [EventStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [EventStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gestión de Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <input type="text" placeholder="Buscar por evento o usuario..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                    <option value="all">Todos los Estados</option>
                    <option value={EventStatus.PENDIENTE}>Pendiente</option>
                    <option value={EventStatus.APROBADO}>Aprobado</option>
                    <option value={EventStatus.RECHAZADO}>Rechazado</option>
                </select>
            </div>
            {loading ? <p>Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredEvents.map(event => (
                            <tr key={event.id}>
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
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EventManager;
