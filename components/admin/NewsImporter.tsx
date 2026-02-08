
import React, { useState } from 'react';
import Papa from 'papaparse';
import { NewsItem } from '../../types';
import { batchCreateNews } from '../../services/newsService';
import toast from 'react-hot-toast';

interface ImportedNewsItem extends Omit<NewsItem, 'id' | 'publishedAt'> {
    publishedAt?: any; // Allow string for parsing
}

interface NewsImporterProps {
    onImportSuccess: () => void;
    onCancel: () => void;
}

const NewsImporter: React.FC<NewsImporterProps> = ({ onImportSuccess, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ImportedNewsItem[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            parseCSV(e.target.files[0]);
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedItems: ImportedNewsItem[] = results.data.map((row: any) => ({
                    title: row.title || '',
                    content: row.content || '',
                    imageUrl: row.imageUrl || '',
                    link: row.link || '',
                    province: row.province || '',
                    city: row.city || '',
                    published: row.published === 'true' || row.published === true || false,
                })).filter(item => item.title && item.content); // Basic validation

                setPreviewData(parsedItems);
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setUploading(true);
        const toastId = toast.loading(`Importing ${previewData.length} news items...`);

        try {
            const newsToCreate = previewData.map(item => ({
                ...item,
                publishedAt: new Date() // Sets current date as publish date
            }));

            // @ts-ignore - publishedAt type mismatch in strict mode, but Firestore handles Date
            await batchCreateNews(newsToCreate);
            
            toast.success('News imported successfully!', { id: toastId });
            onImportSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Failed to import news.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Importar Noticias desde CSV</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Sube un archivo CSV con las siguientes cabeceras: <code>title, content, imageUrl, link, province, city, published</code>
                    </p>
                    <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileChange} 
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                </div>

                {previewData.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Vista Previa ({previewData.length} items)</h4>
                        <div className="overflow-x-auto max-h-60 border border-gray-200 rounded">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resumen</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {previewData.slice(0, 10).map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-2 truncate max-w-xs">{item.title}</td>
                                            <td className="px-3 py-2 truncate max-w-xs">{item.content}</td>
                                            <td className="px-3 py-2">{item.province}</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.published ? 'Publicado' : 'Borrador'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 10 && (
                                <p className="text-xs text-center text-gray-500 py-2">... y {previewData.length - 10} más.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleImport}
                        disabled={uploading || previewData.length === 0}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? 'Importando...' : 'Importar Noticias'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsImporter;
