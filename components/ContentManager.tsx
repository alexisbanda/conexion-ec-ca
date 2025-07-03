// /home/alexis/Sites/Landings/conexion-ec-ca/components/ContentManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Modal } from './Modal';
import { ContentForm } from './ContentForm';
import { PlusCircleIcon } from './icons';
import { Timestamp } from 'firebase/firestore';

// Tipos genéricos para que el gestor sea reutilizable
type ContentItem = { id: string; published: boolean; [key: string]: any };
type ApiClient = {
    getAll: () => Promise<any[]>;
    create: (data: any) => Promise<void>;
    update: (id: string, data: any) => Promise<void>;
    remove: (id: string) => Promise<void>;
};
type Column = {
    header: string;
    accessor: string;
    render?: (item: ContentItem) => React.ReactNode;
};

interface ContentManagerProps {
    title: string;
    itemType: 'event' | 'news';
    api: ApiClient;
    columns: Column[];
}

export const ContentManager: React.FC<ContentManagerProps> = ({ title, itemType, api, columns }) => {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ContentItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAll();
            setItems(data);
        } catch (error) {
            toast.error(`Error al cargar ${title.toLowerCase()}.`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [api, title]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleOpenCreateModal = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: ContentItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (item: ContentItem) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        const promise = itemToEdit
            ? api.update(itemToEdit.id, data)
            : api.create(data);

        await toast.promise(promise, {
            loading: 'Guardando...',
            success: `¡${title.slice(0, -1)} guardado con éxito!`,
            error: `No se pudo guardar.`,
        });

        setIsModalOpen(false);
        fetchItems();
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        await toast.promise(api.remove(itemToDelete.id), {
            loading: 'Eliminando...',
            success: '¡Eliminado con éxito!',
            error: 'No se pudo eliminar.',
        });
        setIsDeleteModalOpen(false);
        fetchItems();
    };

    const handleTogglePublish = async (item: ContentItem) => {
        const promise = api.update(item.id, { published: !item.published });
        await toast.promise(promise, {
            loading: 'Actualizando...',
            success: `Estado de publicación actualizado.`,
            error: 'No se pudo actualizar.',
        });
        fetchItems();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                <button onClick={handleOpenCreateModal} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Crear Nuevo
                </button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => <th key={col.accessor} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {items.map(item => (
                            <tr key={item.id}>
                                {columns.map(col => (
                                    <td key={col.accessor} className="px-4 py-3 text-gray-700">
                                        {col.render ? col.render(item) : item[col.accessor]}
                                    </td>
                                ))}
                                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                    <button onClick={() => handleTogglePublish(item)} className={`text-xs font-medium px-2 py-1 rounded ${item.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.published ? 'Publicado' : 'Oculto'}</button>
                                    <button onClick={() => handleOpenEditModal(item)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                    <button onClick={() => handleOpenDeleteModal(item)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={itemToEdit ? `Editar ${title.slice(0, -1)}` : `Crear Nuevo ${title.slice(0, -1)}`}>
                <ContentForm itemType={itemType} initialData={itemToEdit} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <p>¿Estás seguro de que quieres eliminar "<strong>{itemToDelete?.title}</strong>"?</p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="bg-ecuador-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm">Sí, Eliminar</button>
                </div>
            </Modal>
        </div>
    );
};