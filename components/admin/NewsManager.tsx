

import React, { useState, useEffect, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import { NewsItem } from '../../types';
import { getAllNews, createNews, updateNews, deleteNews, batchUpdateNews } from '../../services/newsService';
import { ContentForm } from '../ContentForm'; 
import { Modal } from '../Modal';
import { PlusCircleIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { AuthContext } from '../../contexts/AuthContext';
import NewsImporter from './NewsImporter'; // Importar el componente

const NewsManager: React.FC = () => {
    const auth = useContext(AuthContext);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<NewsItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<NewsItem | null>(null);
    const [isImporterOpen, setIsImporterOpen] = useState(false); // Nuevo estado

    // Pagination & Bulk Actions State
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [cursorStack, setCursorStack] = useState<any[]>([null]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [selectedNewsIds, setSelectedNewsIds] = useState<Set<string>>(new Set());

    const LIMIT = 20;

    const fetchNews = useCallback(async (reset: boolean = false, cursor: any = null) => {
        setLoading(true);
        try {
            const filters = auth?.user?.role === 'regional_admin' && auth.user.managedProvince
                ? { province: auth.user.managedProvince }
                : undefined;
            
            const { news, lastVisible: newLastVisible } = await getAllNews(filters, cursor, LIMIT);
            
            setNewsItems(news);
            setLastVisible(newLastVisible);
            
            if (reset) {
                setCursorStack([null]);
                setCurrentPageIndex(0);
                setSelectedNewsIds(new Set());
            }
        } catch (error) {
            toast.error('Error al cargar las noticias.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [auth?.user]);

    useEffect(() => {
        fetchNews(true);
    }, [fetchNews]);

    // HANDLERS
    const handleOpenCreateForm = () => {
        setItemToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEditForm = (item: NewsItem) => {
        setItemToEdit(item);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setItemToEdit(null);
        fetchNews(false, cursorStack[currentPageIndex]);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (itemToEdit) {
                await updateNews(itemToEdit.id, data);
                toast.success('Noticia actualizada.');
            } else {
                await createNews(data);
                toast.success('Noticia creada.');
            }
            handleCloseForm();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la noticia.');
        }
    };

    const handleOpenDeleteModal = (item: NewsItem) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteNews(itemToDelete.id);
            toast.success('Noticia eliminada.');
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchNews(false, cursorStack[currentPageIndex]);
        } catch (error) {
            console.error(error);
            toast.error('Error al eliminar.');
        }
    };

    // Importer Handlers
    const handleOpenImporter = () => {
        setIsImporterOpen(true);
    };

    const handleCloseImporter = () => {
        setIsImporterOpen(false);
    };

    const handleImportSuccess = () => {
        setIsImporterOpen(false);
        fetchNews(true); // Recargar desde el principio
    };

    // Pagination
    const goToNextPage = () => {
        if (lastVisible) {
            const nextIndex = currentPageIndex + 1;
            const newStack = [...cursorStack];
            if (nextIndex >= newStack.length) {
                newStack.push(lastVisible);
            }
            setCursorStack(newStack);
            setCurrentPageIndex(nextIndex);
            fetchNews(false, lastVisible);
        }
    };

    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setCurrentPageIndex(prevIndex);
            fetchNews(false, cursorStack[prevIndex]);
        }
    };

    // Bulk Actions
    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const ids = new Set(newsItems.map(item => item.id));
            setSelectedNewsIds(ids);
        } else {
            setSelectedNewsIds(new Set());
        }
    };

    const toggleSelectNews = (id: string) => {
        const newSelected = new Set(selectedNewsIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedNewsIds(newSelected);
    };

    const handleBulkStatusUpdate = async (published: boolean) => {
        if (selectedNewsIds.size === 0) return;
        
        const actionName = published ? "publicar" : "ocultar";
        if (!window.confirm(`¿Estás seguro de ${actionName} ${selectedNewsIds.size} noticias?`)) {
            return;
        }

        const toastId = toast.loading(`Actualizando ${selectedNewsIds.size} noticias...`);
        try {
            await batchUpdateNews(Array.from(selectedNewsIds), { published });
            toast.success(`Noticias actualizado.`, { id: toastId });
            fetchNews(false, cursorStack[currentPageIndex]);
            setSelectedNewsIds(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar.", { id: toastId });
        }
    };

    const handleTogglePublish = async (item: NewsItem) => {
        try {
            await updateNews(item.id, { published: !item.published });
            toast.success(`Noticia ${!item.published ? 'publicada' : 'oculta'}.`);
            fetchNews(false, cursorStack[currentPageIndex]);
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar estado.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gestión de Noticias</h2>
                {selectedNewsIds.size > 0 ? (
                    <div className="flex space-x-2 animate-fadeIn bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span className="text-sm text-blue-800 font-medium self-center mr-2">{selectedNewsIds.size} seleccionados</span>
                        <button onClick={() => handleBulkStatusUpdate(true)} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">
                            Publicar Selección
                        </button>
                        <button onClick={() => handleBulkStatusUpdate(false)} className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">
                            Ocultar Selección
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                         <button onClick={handleOpenImporter} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md text-sm flex items-center">
                            <span className="mr-2">📄</span> Importar CSV
                        </button>
                        <button onClick={handleOpenCreateForm} className="bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm flex items-center">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Crear Noticia
                        </button>
                    </div>
                )}
            </div>

            {loading ? <p className="text-center py-10">Cargando noticias...</p> : (
                <>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input 
                                    type="checkbox" 
                                    onChange={toggleSelectAll} 
                                    checked={newsItems.length > 0 && selectedNewsIds.size === newsItems.length}
                                    className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segmentación</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enlace</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {newsItems.map(item => (
                            <tr key={item.id} className={selectedNewsIds.has(item.id) ? 'bg-blue-50' : ''}>
                                <td className="px-4 py-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedNewsIds.has(item.id)}
                                        onChange={() => toggleSelectNews(item.id)}
                                        className="rounded border-gray-300 text-ecuador-blue focus:ring-ecuador-blue"
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.province ? (
                                        <span>{item.province}{item.city ? ` > ${item.city}` : ''}</span>
                                    ) : (
                                        <span className="italic text-gray-400">Global</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-blue-600 hover:underline text-xs max-w-xs truncate">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">{item.link}</a>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {item.published ? 'Publicado' : 'Oculto'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                    <button onClick={() => handleTogglePublish(item)} className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
                                        {item.published ? 'Ocultar' : 'Publicar'}
                                    </button>
                                    <button onClick={() => handleOpenEditForm(item)} className="text-blue-600 hover:underline text-xs">Editar</button>
                                    <button onClick={() => handleOpenDeleteModal(item)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                        {newsItems.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">No se encontraron noticias en esta página.</td>
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

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={itemToEdit ? 'Editar Noticia' : 'Crear Noticia'}>
                <ContentForm itemType="news" initialData={itemToEdit} onSubmit={handleFormSubmit} onCancel={() => setIsFormOpen(false)} />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <div className="p-4">
                    <p className="text-gray-700">¿Estás seguro de que quieres eliminar esta noticia?</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar</button>
                    </div>
                </div>
            </Modal>
            
            {isImporterOpen && (
                <NewsImporter onImportSuccess={handleImportSuccess} onCancel={handleCloseImporter} />
            )}
        </div>
    );
};

export default NewsManager;

