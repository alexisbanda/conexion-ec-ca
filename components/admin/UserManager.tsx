
// /home/alexis/Sites/Landings/conexion-ec-ca/components/admin/UserManager.tsx
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { User, UserStatus } from '../../types';
import { getAllUsers, updateUser, batchUpdateUserStatus } from '../../services/userService';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, PencilSquareIcon } from '../icons';
import { sendApprovalEmail } from '../../services/emailService';
import { Modal } from '../Modal';
import { UserDetailsDisplay } from '../UserDetailsDisplay';
import { cityData } from '../../constants';
import { AuthContext } from '../../contexts/AuthContext';

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

// --- MODAL DE GESTIÓN DE USUARIO (PARA ADMIN GENERAL) ---
const ManageUserModal: React.FC<{
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdate: () => void;
    provinces: string[];
}> = ({ user, isOpen, onClose, onUserUpdate, provinces }) => {
    const [status, setStatus] = useState(user?.status || UserStatus.PENDIENTE);
    const [role, setRole] = useState(user?.role || 'member');
    const [managedProvince, setManagedProvince] = useState(user?.managedProvince || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setStatus(user.status || UserStatus.PENDIENTE);
            setRole(user.role || 'member');
            setManagedProvince(user.managedProvince || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        
        const userDataToUpdate: Partial<User> = {
            status,
            role,
            managedProvince: role === 'regional_admin' ? managedProvince : ''
        };

        try {
            await updateUser(user.id, userDataToUpdate);
            toast.success('Usuario actualizado correctamente.');
            
            if (status === UserStatus.APROBADO && status !== user.status) {
                 if (user.email && user.name) {
                    await sendApprovalEmail({ name: user.name, email: user.email });
                    toast.success('Email de aprobación enviado.');
                }
            }
            
            onUserUpdate();
            onClose();
        } catch (error) {
            toast.error('No se pudo actualizar el usuario.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gestionar a ${user.name}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado del Usuario</label>
                    <select value={status} onChange={e => setStatus(e.target.value as UserStatus)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value={UserStatus.PENDIENTE}>Pendiente</option>
                        <option value={UserStatus.APROBADO}>Aprobado</option>
                        <option value={UserStatus.RECHAZADO}>Rechazado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rol del Usuario</label>
                    <select value={role} onChange={e => setRole(e.target.value as any)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="member">Miembro</option>
                        <option value="regional_admin">Administrador Regional</option>
                        <option value="admin">Administrador General</option>
                    </select>
                </div>
                {role === 'regional_admin' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Provincia que Administra</label>
                        <select value={managedProvince} onChange={e => setManagedProvince(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Seleccione una provincia...</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};


// --- GESTOR DE USUARIOS ---
const UserManager: React.FC = () => {
    const auth = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [provinceFilter, setProvinceFilter] = useState<string>('');
    const [cityFilter, setCityFilter] = useState<string>('');
    
    // Pagination & Bulk Actions State
    const [lastVisible, setLastVisible] = useState<any>(null);
    // const [pageHistory, setPageHistory] = useState<any[]>([]); // Stack of previous cursors - Removed as unused
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedUserForManage, setSelectedUserForManage] = useState<User | null>(null);

    const LIMIT = 20;

    const provinces = useMemo(() => cityData.map(data => data.provincia), []);
    const cities = useMemo(() => {
        if (!provinceFilter) return [];
        const selectedProvince = cityData.find(data => data.provincia === provinceFilter);
        return selectedProvince ? selectedProvince.ciudades : [];
    }, [provinceFilter]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-CA'); // Formato YYYY-MM-DD
    };

    const fetchUsers = useCallback(async (reset: boolean = false, cursor: any = null) => {
        setLoading(true);
        try {
            const filters: any = {};
            
            if (auth?.user?.role === 'regional_admin' && auth.user.managedProvince) {
                filters.province = auth.user.managedProvince;
            }

            // Include status filter in the backend query
            if (statusFilter !== 'all') {
                filters.status = statusFilter;
            }
            
            // If we have local filters (search or status), we might need to handle them differently.
            // For now, we fetch a page based on filters and then filter client-side for search.
            // Status filter is now handled by the backend.
            
            const { users, lastVisible: newLastVisible } = await getAllUsers(filters, cursor, LIMIT);
            
            setAllUsers(users);
            setLastVisible(newLastVisible);
            if (reset) {
                // setPageHistory([]); 
                setSelectedUserIds(new Set());
                setCursorStack([null]);
                setCurrentPageIndex(0);
            }
        } catch (err: any) {
            // Firestore index errors include a link to create the missing index
            if (err?.message?.includes('index')) {
                console.error('Firestore index required:', err.message);
                toast.error(
                    'Se requiere crear un índice en Firestore. Revisa la consola del navegador para obtener el enlace.',
                    { duration: 8000 }
                );
            } else {
                toast.error("No se pudieron cargar los usuarios.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [auth?.user, statusFilter]);

    useEffect(() => {
        fetchUsers(true);
        if (auth?.user?.role === 'regional_admin' && auth.user.managedProvince) {
            setProvinceFilter(auth.user.managedProvince);
        }
    }, [fetchUsers, auth?.user?.role, auth?.user?.managedProvince]);


    
    // Let's simplify: Just Next/Prev buttons that refetch.
    // We need to store the snapshot references.
    const [cursorStack, setCursorStack] = useState<any[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const goToNextPage = () => {
        if (lastVisible) {
            const nextIndex = currentPageIndex + 1;
            const newStack = [...cursorStack];
            if (nextIndex >= newStack.length) {
                newStack.push(lastVisible);
            }
            setCursorStack(newStack);
            setCurrentPageIndex(nextIndex);
            fetchUsers(false, lastVisible);
        }
    };

    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setCurrentPageIndex(prevIndex);
            fetchUsers(false, cursorStack[prevIndex]);
        }
    };

    // Bulk Actions Handlers
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const ids = new Set(filteredUsers.map(u => u.id));
            setSelectedUserIds(ids);
        } else {
            setSelectedUserIds(new Set());
        }
    };

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const handleBulkStatusUpdate = async (newStatus: UserStatus) => {
        if (selectedUserIds.size === 0) return;
        
        if (!window.confirm(`¿Estás seguro de cambiar el estado de ${selectedUserIds.size} usuarios a "${newStatus}"?`)) {
            return;
        }

        const toastId = toast.loading(`Actualizando ${selectedUserIds.size} usuarios...`);
        try {
            await batchUpdateUserStatus(Array.from(selectedUserIds), newStatus);
            toast.success("Usuarios actualizados correctamente.", { id: toastId });
            fetchUsers(false, cursorStack[currentPageIndex]); // Refresh current page
            setSelectedUserIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar usuarios.", { id: toastId });
        }
    };

    const handleStatusUpdate = async (userId: string, newStatus: UserStatus) => {
        const promise = updateUser(userId, { status: newStatus });
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
        fetchUsers(false, cursorStack[currentPageIndex]);
    };
    
    const handleOpenUserDetails = (user: User) => {
        setSelectedUserForDetails(user);
        setIsUserDetailsModalOpen(true);
    };

    const handleCloseUserDetails = () => {
        setIsUserDetailsModalOpen(false);
        setSelectedUserForDetails(null);
    };

    const handleOpenManageModal = (user: User) => {
        setSelectedUserForManage(user);
        setIsManageModalOpen(true);
    };

    const handleCloseManageModal = () => {
        setIsManageModalOpen(false);
        setSelectedUserForManage(null);
    };

    const filteredUsers = useMemo(() => {
        // Client-side filtering of the *current page*
        // Note: This matches the old behavior but applyies it only to the fetched page.
        // For true searching across all users, backend support is needed.
        return allUsers.filter(user => {
            const userStatus = user.status || 'Pendiente';
            const statusMatch = statusFilter === 'all' || userStatus === statusFilter;
            const searchMatch = searchQuery === '' ||
                (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            const provinceMatch = provinceFilter === '' || user.province === provinceFilter;
            const cityMatch = cityFilter === '' || user.city === cityFilter;

            return statusMatch && searchMatch && provinceMatch && cityMatch;
        });
    }, [allUsers, statusFilter, searchQuery, provinceFilter, cityFilter]);

    const badgeClasses: Record<string, string> = {
        [UserStatus.APROBADO]: 'bg-green-100 text-green-800',
        [UserStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
        [UserStatus.RECHAZADO]: 'bg-red-100 text-red-800',
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Gestión de Usuarios</h2>
                    {selectedUserIds.size > 0 && (
                        <div className="flex space-x-2 animate-fadeIn bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <span className="text-sm text-blue-800 font-medium self-center mr-2">{selectedUserIds.size} seleccionados</span>
                            <button onClick={() => handleBulkStatusUpdate(UserStatus.APROBADO)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                                Aprobar Selección
                            </button>
                            <button onClick={() => handleBulkStatusUpdate(UserStatus.RECHAZADO)} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
                                Rechazar Selección
                            </button>
                        </div>
                    )}
                </div>

                {auth?.user?.role === 'regional_admin' && (
                    <p className="mb-4 text-lg text-gray-600">Mostrando usuarios para la provincia de: <span className="font-bold">{auth.user.managedProvince}</span></p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <input type="text" placeholder="Buscar en página..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm">
                        <option value="all">Todos los Estados</option>
                        <option value={UserStatus.PENDIENTE}>Pendiente</option>
                        <option value={UserStatus.APROBADO}>Aprobado</option>
                        <option value={UserStatus.RECHAZADO}>Rechazado</option>
                    </select>
                    <select 
                        value={provinceFilter} 
                        onChange={e => { setProvinceFilter(e.target.value); setCityFilter(''); }}
                        className="p-2 border border-gray-300 rounded-md text-sm"
                        disabled={auth?.user?.role === 'regional_admin'}
                    >
                        <option value="">Todas las Provincias</option>
                        {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                    <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm" disabled={!provinceFilter}>
                        <option value="">Todas las Ciudades</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                {loading ? <p className="text-center py-10">Cargando...</p> : (
                    <>
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input 
                                            type="checkbox" 
                                            onChange={toggleSelectAll} 
                                            checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
                                            className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className={selectedUserIds.has(user.id) ? 'bg-blue-50' : ''}>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUserIds.has(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                                className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.province || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.city || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                                        <td className="px-4 py-3"><StatusBadge text={user.status || 'Pendiente'} className={badgeClasses[user.status || 'Pendiente']} /></td>
                                        <td className="px-4 py-3 space-x-2 flex items-center">
                                            <ActionButton onClick={() => handleOpenUserDetails(user)} className="bg-blue-100 text-blue-800 hover:bg-blue-200"><InformationCircleIcon className="w-4 h-4 inline mr-1" /> Detalles</ActionButton>
                                            <ActionButton onClick={() => handleStatusUpdate(user.id, UserStatus.APROBADO)} className="bg-green-100 text-green-800 hover:bg-green-200" disabled={user.status === UserStatus.APROBADO}><CheckCircleIcon className="w-4 h-4 inline mr-1" /> Aprobar</ActionButton>
                                            <ActionButton onClick={() => handleStatusUpdate(user.id, UserStatus.RECHAZADO)} className="bg-red-100 text-red-800 hover:bg-red-200" disabled={user.status === UserStatus.RECHAZADO}><XCircleIcon className="w-4 h-4 inline mr-1" /> Rechazar</ActionButton>
                                            
                                            {auth?.user?.role === 'admin' && (
                                                <ActionButton onClick={() => handleOpenManageModal(user)} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                                    <PencilSquareIcon className="w-4 h-4 inline mr-1" /> Gestionar Rol
                                                </ActionButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4 text-gray-500">No se encontraron usuarios en esta página.</td>
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
            <Modal isOpen={isUserDetailsModalOpen} onClose={handleCloseUserDetails} title={`Detalles de ${selectedUserForDetails?.name || 'Usuario'}`}>
                {selectedUserForDetails && <UserDetailsDisplay user={selectedUserForDetails} />} 
            </Modal>
            {auth?.user?.role === 'admin' && (
                <ManageUserModal 
                    user={selectedUserForManage}
                    isOpen={isManageModalOpen}
                    onClose={handleCloseManageModal}
                    onUserUpdate={() => fetchUsers(false, cursorStack[currentPageIndex])}
                    provinces={provinces}
                />
            )}
        </>
    );
};

export default UserManager;
