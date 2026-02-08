import React, { useState, useEffect, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import { AdSlotItem } from '../../types';
import { getAds, deleteAd, batchUpdateAds } from '../../services/adService';
import { AdForm } from './AdForm';
import { Modal } from '../Modal';
import { PlusCircleIcon } from '../icons';
import { Timestamp } from 'firebase/firestore';
import { AuthContext } from '../../contexts/AuthContext';

const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'Siempre';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('es-CA');
};

// Helper para mostrar nombres amigables para las ubicaciones
const locationDisplayNames: { [key: string]: string } = {
    benefits_section: 'Sección Beneficios',
    event_detail: 'Detalle de Evento',
    dashboard_services: 'Dashboard (Servicios)',
    directory_sidebar: 'Directorio (Lateral)',
    sticky_banner_left: 'Banner Fijo (Izq)',
    sticky_banner_right: 'Banner Fijo (Der)',
    default: 'Ubicación Desconocida'
};

export const AdManager: React.FC = () => {
    const auth = useContext(AuthContext);
    const [ads, setAds] = useState<AdSlotItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [adToEdit, setAdToEdit] = useState<AdSlotItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<AdSlotItem | null>(null);

    // Pagination & Bulk Actions State
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [cursorStack, setCursorStack] = useState<any[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedAdIds, setSelectedAdIds] = useState<Set<string>>(new Set());

    const LIMIT = 20;

    const fetchAds = useCallback(async (reset: boolean = false, cursor: any = null) => {
        setLoading(true);
        try {
            const filters = auth?.user?.role === 'regional_admin' && auth.user.managedProvince
                ? { province: auth.user.managedProvince }
                : {};
            
            const { ads: fetchedAds, lastVisible: newLastVisible } = await getAds(filters, cursor, LIMIT);
            
            setAds(fetchedAds);
            setLastVisible(newLastVisible);
            
            if (reset) {
                setCursorStack([null]);
                setCurrentPageIndex(0);
                setSelectedAdIds(new Set());
            }
        } catch (error) {
            toast.error('Error al cargar los anuncios.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [auth?.user]);

    useEffect(() => {
        fetchAds(true);
    }, [fetchAds]);

    const handleOpenCreateForm = () => {
        setAdToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (ad: AdSlotItem) => {
        setAdToEdit(ad);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setAdToEdit(null);
        fetchAds(false, cursorStack[currentPageIndex]); // Refresh current page
    };

    const handleOpenDeleteModal = (ad: AdSlotItem) => {
        setAdToDelete(ad);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!adToDelete) return;

        const promise = deleteAd(adToDelete.id, adToDelete.adData.imageUrl);

        await toast.promise(promise, {
            loading: 'Eliminando anuncio...',
            success: '¡Anuncio eliminado con éxito!',
            error: 'No se pudo eliminar el anuncio.',
        });

        setIsDeleteModalOpen(false);
        setAdToDelete(null);
        fetchAds(false, cursorStack[currentPageIndex]);
    };

    // Pagination Handlers
    const goToNextPage = () => {
        if (lastVisible) {
            const nextIndex = currentPageIndex + 1;
            const newStack = [...cursorStack];
            if (nextIndex >= newStack.length) {
                newStack.push(lastVisible);
            }
            setCursorStack(newStack);
            setCurrentPageIndex(nextIndex);
            fetchAds(false, lastVisible);
        }
    };

    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setCurrentPageIndex(prevIndex);
            fetchAds(false, cursorStack[prevIndex]);
        }
    };

    // Bulk Actions Handlers
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const ids = new Set(ads.map(ad => ad.id));
            setSelectedAdIds(ids);
        } else {
            setSelectedAdIds(new Set());
        }
    };

    const toggleSelectAd = (adId: string) => {
        const newSelected = new Set(selectedAdIds);
        if (newSelected.has(adId)) {
            newSelected.delete(adId);
        } else {
            newSelected.add(adId);
        }
        setSelectedAdIds(newSelected);
    };



    const handleBulkStatusUpdate = async (isActive: boolean) => {
        if (selectedAdIds.size === 0) return;
        
        const actionName = isActive ? "activar" : "desactivar";
        if (!window.confirm(`¿Estás seguro de ${actionName} ${selectedAdIds.size} anuncios?`)) {
            return;
        }

        const toastId = toast.loading(`Actualizando ${selectedAdIds.size} anuncios...`);
        try {
            await batchUpdateAds(Array.from(selectedAdIds), { isActive });
            toast.success(`Anuncios ${isActive ? 'activados' : 'desactivados'} correctamente.`, { id: toastId });
            fetchAds(false, cursorStack[currentPageIndex]);
            setSelectedAdIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar anuncios.", { id: toastId });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Anuncios</h2>
                 {selectedAdIds.size > 0 ? (
                    <div className="flex space-x-2 animate-fadeIn bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-800 font-medium self-center mr-2">{selectedAdIds.size} seleccionados</span>
                        <button onClick={() => handleBulkStatusUpdate(true)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                            Activar
                        </button>
                        <button onClick={() => handleBulkStatusUpdate(false)} className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">
                            Desactivar
                        </button>
                    </div>
                ) : (
                    <button onClick={handleOpenCreateForm} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center">
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Crear Anuncio
                    </button>
                )}
            </div>

            {loading ? <p className="text-center py-10">Cargando anuncios...</p> : (
                <>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input 
                                    type="checkbox" 
                                    onChange={toggleSelectAll} 
                                    checked={ads.length > 0 && selectedAdIds.size === ads.length}
                                    className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segmentación</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patrocinador</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {ads.map(ad => (
                            <tr key={ad.id} className={selectedAdIds.has(ad.id) ? 'bg-blue-50' : ''}>
                                <td className="px-4 py-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedAdIds.has(ad.id)}
                                        onChange={() => toggleSelectAd(ad.id)}
                                        className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                    />
                                </td>
                                <td className="px-4 py-3"><img src={ad.adData.imageUrl} alt={ad.adData.sponsorName || 'Anuncio'} className="w-20 h-20 object-contain rounded border p-1 bg-gray-50" /></td>
                                <td className="px-4 py-3 text-gray-700">{locationDisplayNames[ad.location] || locationDisplayNames.default}</td>
                                <td className="px-4 py-3 text-gray-700">
                                    {ad.province ? (
                                        <div>
                                            <span className="font-semibold">{ad.province}</span>
                                            {ad.city && <span className="block text-xs text-gray-500">{ad.city}</span>}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Global</span>
                                    )}
                                </td>
                                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{ad.isActive ? 'Activado' : 'Apagado'}</span></td>
                                <td className="px-4 py-3 text-gray-700">{ad.adData.sponsorName || 'N/A'}</td>
                                <td className="px-4 py-3 text-gray-700">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</td>
                                <td className="px-4 py-3 text-gray-700 text-center">{ad.priority}</td>
                                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                    <button onClick={() => handleOpenEditForm(ad)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                    <button onClick={() => handleOpenDeleteModal(ad)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {ads.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-4 text-gray-500">No se encontraron anuncios en esta página.</td>
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

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={adToEdit ? 'Editar Anuncio' : 'Crear Anuncio'}>
                <AdForm
                    ad={adToEdit}
                    onSave={() => {
                        toast.success('¡Anuncio guardado con éxito!');
                        handleCloseForm();
                    }}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <div className="p-4">
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};