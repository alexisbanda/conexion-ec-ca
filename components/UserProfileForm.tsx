// /home/alexis/Sites/Landings/conexion-ec-ca/components/UserProfileForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { updateOnboardingData } from '../services/userService';
import { User, EducationLevel, FamilyComposition, RemittanceUsage } from '../types';
import { Timestamp } from 'firebase/firestore';

interface UserProfileFormProps {
    user: User;
    onSuccess: () => void;
}

// --- INICIO DE LA CORRECCIÓN: Definición de estilos reutilizables ---
const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";
const checkboxRadioStyle = "h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 mr-2";
const btnPrimary = "bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";
// --- FIN DE LA CORRECCIÓN ---

const dateToInputString = (date: Date | Timestamp | string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = (date instanceof Timestamp) ? date.toDate() : date;
    return new Date(d).toISOString().split('T')[0];
};

type TabKey = 'personal' | 'family' | 'work' | 'professional';

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onSuccess }) => {
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<TabKey>('personal');
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Populate form with all user data when component mounts or user prop changes
        setFormData({
            ...user,
            birthDate: dateToInputString(user.birthDate) as any,
            arrivalDateCanada: dateToInputString(user.arrivalDateCanada) as any,
        });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'radio') {
            const radioValue = value === 'true' ? true : value === 'false' ? false : value;
            setFormData(prev => ({ ...prev, [name]: radioValue }));
        } else if (type === 'checkbox') {
            const fieldName = name as keyof User;
            const currentValues = (formData[fieldName] as string[] | undefined) || [];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter(v => v !== value);
            setFormData(prev => ({ ...prev, [fieldName]: newValues }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user?.id) {
            toast.error('No se pudo identificar al usuario.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToUpdate = { ...formData };
            // Convert date strings back to Timestamps for Firestore
            if (dataToUpdate.birthDate) {
                dataToUpdate.birthDate = Timestamp.fromDate(new Date(dataToUpdate.birthDate as any));
            }
            if (dataToUpdate.arrivalDateCanada) {
                dataToUpdate.arrivalDateCanada = Timestamp.fromDate(new Date(dataToUpdate.arrivalDateCanada as any));
            }

            await updateOnboardingData(auth.user.id, dataToUpdate);
            await auth.refreshUserData();
            toast.success('Perfil actualizado con éxito.');
            onSuccess();
        } catch (error) {
            toast.error('No se pudo actualizar el perfil.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const TabButton: React.FC<{ tabKey: TabKey; label: string }> = ({ tabKey, label }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`py-2 px-4 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tabKey
                    ? 'bg-white text-ecuador-blue border-b-2 border-ecuador-blue'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    <TabButton tabKey="personal" label="Personal" />
                    <TabButton tabKey="family" label="Familia y Estatus" />
                    <TabButton tabKey="work" label="Estudios y Trabajo" />
                    <TabButton tabKey="professional" label="Profesional" />
                </nav>
            </div>

            <div className="pt-4">
                {activeTab === 'personal' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Nombre</label><input name="name" type="text" value={formData.name || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Apellidos</label><input name="lastName" type="text" value={formData.lastName || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Teléfono</label><input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Email</label><input name="email" type="email" value={formData.email || ''} onChange={handleChange} readOnly className={`${inputStyle} bg-gray-100 cursor-not-allowed`} /></div>
                            <div><label className={labelStyle}>Fecha de Nacimiento</label><input name="birthDate" type="date" value={formData.birthDate as any || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Fecha de Llegada a Canadá</label><input name="arrivalDateCanada" type="date" value={formData.arrivalDateCanada as any || ''} onChange={handleChange} className={inputStyle} /></div>
                        </div>
                    </div>
                )}

                {activeTab === 'family' && (
                    <div className="space-y-4 animate-fade-in">
                        <div><label className={labelStyle}>Núcleo familiar en Canadá</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">{Object.values(FamilyComposition).map(comp => (<label key={comp} className="flex items-center"><input type="checkbox" name="familyComposition" value={comp} checked={formData.familyComposition?.includes(comp)} onChange={handleChange} className={checkboxRadioStyle} />{comp}</label>))}</div>
                        </div>
                        <div><label className={labelStyle}>Estatus actual en Canadá</label>
                            <div className="flex flex-wrap gap-2 mt-2">{['Ciudadano', 'Residente Permanente', 'Study Permit', 'Work Permit', 'Refugiado', 'Visitante', 'Otro'].map(status => (<label key={status} className="flex items-center"><input type="radio" name="immigrationStatus" value={status} checked={formData.immigrationStatus === status} onChange={handleChange} className={checkboxRadioStyle} />{status}</label>))}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'work' && (
                    <div className="space-y-4 animate-fade-in">
                        <div><label className={labelStyle}>Nivel de Estudios</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">{Object.values(EducationLevel).map(level => (<label key={level} className="flex items-center"><input type="radio" name="educationLevel" value={level} checked={formData.educationLevel === level} onChange={handleChange} className={checkboxRadioStyle} />{level}</label>))}</div>
                        </div>
                        <div><label className={labelStyle}>Profesión o título</label><input name="profession" type="text" value={formData.profession || ''} onChange={handleChange} className={inputStyle} /></div>
                        <div><label className={labelStyle}>¿Qué estudias en Canadá?</label><input name="studiesInCanada" type="text" value={formData.studiesInCanada || ''} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                )}

                {activeTab === 'professional' && (
                    <div className="space-y-4 animate-fade-in">
                        <div><label className={labelStyle}>¿Qué servicios ofreces?</label><textarea name="servicesOffered" value={formData.servicesOffered || ''} onChange={handleChange} rows={4} className={inputStyle} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Instagram</label><input name="instagramUrl" type="text" value={formData.instagramUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Linkedin</label><input name="linkedinUrl" type="url" value={formData.linkedinUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};