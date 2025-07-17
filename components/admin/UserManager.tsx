
// /home/alexis/Sites/Landings/conexion-ec-ca/components/admin/UserManager.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { User, UserStatus } from '../../types';
import { getAllUsers, updateUserStatus as updateUserStatusService } from '../../services/userService';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../icons';
import { sendApprovalEmail } from '../../services/emailService';
import { Modal } from '../Modal';
import { UserDetailsDisplay } from '../UserDetailsDisplay';

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

// --- GESTOR DE USUARIOS ---
const UserManager: React.FC = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('Pendiente');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

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
    
    const handleOpenUserDetails = (user: User) => {
        setSelectedUserForDetails(user);
        setIsUserDetailsModalOpen(true);
    };

    const handleCloseUserDetails = () => {
        setIsUserDetailsModalOpen(false);
        setSelectedUserForDetails(null);
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
        <>
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
                                        <ActionButton onClick={() => handleOpenUserDetails(user)} className="bg-blue-100 text-blue-800 hover:bg-blue-200"><InformationCircleIcon className="w-4 h-4 inline mr-1" /> Detalles</ActionButton>
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
            <Modal isOpen={isUserDetailsModalOpen} onClose={handleCloseUserDetails} title={`Detalles de ${selectedUserForDetails?.name || 'Usuario'}`}>
                {selectedUserForDetails && <UserDetailsDisplay user={selectedUserForDetails} />}
            </Modal>
        </>
    );
};

export default UserManager;
