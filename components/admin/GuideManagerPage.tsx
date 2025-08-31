// components/admin/GuideManagerPage.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import { AddGuideForm } from './AddGuideForm';
import { getGuidesForAdmin, deleteGuide } from '../../services/guideService';
import { Guide } from '../../types';
import { TrashIcon, PencilIcon } from '../icons';
import { AuthContext } from '../../contexts/AuthContext';

// Mapeo de abreviaturas a nombres completos para solucionar inconsistencias
const PROVINCE_MAP: { [key: string]: string } = {
  'AB': 'Alberta',
  'BC': 'British Columbia',
  'MB': 'Manitoba',
  'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador',
  'NS': 'Nova Scotia',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
  'ON': 'Ontario',
  'PE': 'Prince Edward Island',
  'QC': 'Quebec',
  'SK': 'Saskatchewan',
  'YT': 'Yukon',
};

const getFullName = (provinceIdentifier: string) => {
    return PROVINCE_MAP[provinceIdentifier.toUpperCase()] || provinceIdentifier;
}

const GuideManagerPage: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const { user } = useContext(AuthContext);

  const fetchGuides = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let filters = {};
      if (user.role === 'regional_admin' && user.managedProvince) {
        const fullProvinceName = getFullName(user.managedProvince);
        filters = { region: fullProvinceName }; // <-- CORREGIDO: usa 'region'
      }

      const fetchedGuides = await getGuidesForAdmin(filters);
      setGuides(fetchedGuides);
    } catch (error) {
      toast.error("No se pudieron cargar las guías.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleSuccess = () => {
    toast.success('¡Operación exitosa!');
    setEditingGuide(null);
    fetchGuides();
  };

  const handleCancelEdit = () => {
    setEditingGuide(null);
  };

  const handleEdit = (guide: Guide) => {
    setEditingGuide(guide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (guide: Guide) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la guía "${guide.title}"?`)) {
      const toastId = toast.loading('Eliminando guía...');
      try {
        await deleteGuide(guide);
        toast.success('Guía eliminada.', { id: toastId });
        fetchGuides();
      } catch (error) {
        toast.error('No se pudo eliminar la guía.', { id: toastId });
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <AddGuideForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancelEdit}
          initialData={editingGuide}
          user={user}
        />
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Guías Existentes</h2>
            {user?.role === 'regional_admin' && user.managedProvince && (
                <p className="text-md text-gray-600">Mostrando guías para: <span className="font-bold text-ecuador-blue">{getFullName(user.managedProvince)}</span></p>
            )}
        </div>

        {isLoading ? (
          <p>Cargando lista de guías...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etapa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guides.map((guide) => (
                  <tr key={guide.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guide.title}</div>
                      <div className="text-sm text-gray-500">{guide.description.substring(0, 40)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.stage}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guide.isPremium ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sí</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(guide)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(guide)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideManagerPage;
