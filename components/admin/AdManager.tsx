import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AdSlotItem } from '../../types';
import { getAds, deleteAd } from '../../services/adService';
import { AdForm } from './AdForm';
import { Modal } from '../Modal';
import { PlusCircleIcon } from '../icons';
import { Timestamp } from 'firebase/firestore';

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
    // Añade un valor por defecto por si acaso
    default: 'Ubicación Desconocida'
};

export const AdManager: React.FC = () => {
    const [ads, setAds] = useState<AdSlotItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [adToEdit, setAdToEdit] = useState<AdSlotItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<AdSlotItem | null>(null);

    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAds();
            setAds(data);
        } catch (error) {
            toast.error('Error al cargar los anuncios.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAds();
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
        fetchAds(); // Refresh list after save
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
        fetchAds(); // Refresh list
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Anuncios</h2>
                <button onClick={handleOpenCreateForm} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Crear Anuncio
                </button>
            </div>

            {loading ? <p>Cargando anuncios...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
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
                            <tr key={ad.id}>
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
                        </tbody>
                    </table>
                </div>
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