// /home/alexis/Sites/Landings/conexion-ec-ca/components/OnboardingWizard.tsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { updateOnboardingData } from '../services/userService';
import { User, EducationLevel, FamilyComposition, RemittanceUsage } from '../types';
import { Timestamp } from 'firebase/firestore';

// Componente de UI para la barra de progreso
const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div
            className="bg-ecuador-blue h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
        ></div>
        <p className="text-center text-sm text-gray-500 mt-2">Paso {current} de {total}</p>
    </div>
);

// Helper para convertir Timestamp o string a un string 'YYYY-MM-DD' para inputs de fecha
const dateToInputString = (date: Date | Timestamp | string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = (date instanceof Timestamp) ? date.toDate() : date;
    return new Date(d).toISOString().split('T')[0];
};

export const OnboardingWizard: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- INICIO DE LA CORRECCIÓN: Definición de estilos reutilizables ---
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";
    const checkboxRadioStyle = "h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 mr-2";
    const btnPrimary = "bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";
    const btnSecondary = "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";
    // --- FIN DE LA CORRECCIÓN ---

    useEffect(() => {
        if (auth?.user) {
            setFormData({
                name: auth.user.name || '',
                email: auth.user.email || '',
                city: auth.user.city || '',
                arrivalDateCanada: auth.user.arrivalDateCanada,
                immigrationStatus: auth.user.immigrationStatus || '',
                lastName: auth.user.lastName || '',
                phone: auth.user.phone || '',
                birthDate: auth.user.birthDate,
                educationLevel: auth.user.educationLevel,
                profession: auth.user.profession || '',
                familyComposition: auth.user.familyComposition || [],
                spouseName: auth.user.spouseName || '',
                hasChildren: auth.user.hasChildren,
                childrenAges: auth.user.childrenAges || [],
                studiesInCanada: auth.user.studiesInCanada || '',
                educationalInstitution: auth.user.educationalInstitution || '',
                remittanceUsage: auth.user.remittanceUsage || [],
                isEmployed: auth.user.isEmployed,
                currentEmployer: auth.user.currentEmployer || '',
                currentPosition: auth.user.currentPosition || '',
                isWorkRelatedToStudies: auth.user.isWorkRelatedToStudies,
                servicesOffered: auth.user.servicesOffered || '',
                instagramUrl: auth.user.instagramUrl || '',
                linkedinUrl: auth.user.linkedinUrl || '',
                facebookUrl: auth.user.facebookUrl || '',
                twitterUrl: auth.user.twitterUrl || '',
            });
        }
    }, [auth?.user]);

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

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.lastName && formData.phone && formData.email && formData.birthDate && formData.educationLevel && formData.profession && formData.arrivalDateCanada);
            case 2:
                const familyOk = !!(formData.familyComposition && formData.familyComposition.length > 0);
                const spouseOk = formData.familyComposition?.includes(FamilyComposition.PAREJA) ? !!formData.spouseName : true;
                const childrenOk = formData.hasChildren !== undefined;
                const statusOk = !!formData.immigrationStatus;
                return familyOk && spouseOk && childrenOk && statusOk;
            case 3:
                return !!formData.studiesInCanada;
            case 4:
                return !!(formData.remittanceUsage && formData.remittanceUsage.length > 0);
            case 5:
                const employedOk = formData.isEmployed !== undefined;
                const workRelatedOk = formData.isWorkRelatedToStudies !== undefined;
                return employedOk && workRelatedOk;
            case 6:
                return !!formData.servicesOffered;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        } else {
            toast.error('Por favor, completa todos los campos requeridos (*).');
        }
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(6)) {
            toast.error('Por favor, completa los campos requeridos en el último paso.');
            return;
        }
        if (!auth?.user?.id) {
            toast.error('Error de autenticación. Intenta iniciar sesión de nuevo.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateOnboardingData(auth.user.id, formData);
            await auth.refreshUserData();
            toast.success('¡Perfil completado! Bienvenido a tu espacio.');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error al guardar el onboarding:", error);
            toast.error('No se pudo guardar tu información. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!auth?.user) {
        return <div className="text-center p-10">Cargando...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl">
            <h2 className="text-3xl font-bold text-ecuador-blue mb-2 font-montserrat">Completa tu Perfil</h2>
            <p className="text-gray-600 mb-6">Ayúdanos a personalizar tu experiencia en el portal.</p>
            <ProgressBar current={currentStep} total={6} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Información Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Nombre</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Apellidos *</label><input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className={inputStyle} /></div>
                            <div><label className={labelStyle}>Número de Teléfono *</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required placeholder="+1 o +593" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Email *</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className={inputStyle} /></div>
                            <div><label className={labelStyle}>Fecha de Nacimiento *</label><input type="date" name="birthDate" value={dateToInputString(formData.birthDate)} onChange={handleChange} required className={inputStyle} /></div>
                            <div><label className={labelStyle}>Fecha de Llegada a Canadá *</label><input type="date" name="arrivalDateCanada" value={dateToInputString(formData.arrivalDateCanada)} onChange={handleChange} required className={inputStyle} /></div>
                        </div>
                        <div><label className={labelStyle}>Nivel de Estudios *</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">{Object.values(EducationLevel).map(level => (<label key={level} className="flex items-center"><input type="radio" name="educationLevel" value={level} checked={formData.educationLevel === level} onChange={handleChange} className={checkboxRadioStyle} />{level}</label>))}</div>
                        </div>
                        <div><label className={labelStyle}>¿Cuál es tu profesión o título? *</label><input type="text" name="profession" value={formData.profession || ''} onChange={handleChange} required className={inputStyle} /></div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Familia y Estatus Migratorio</h3>
                        <div><label className={labelStyle}>¿Cómo está conformado tu núcleo familiar en Canadá? *</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">{Object.values(FamilyComposition).map(comp => (<label key={comp} className="flex items-center"><input type="checkbox" name="familyComposition" value={comp} checked={formData.familyComposition?.includes(comp)} onChange={handleChange} className={checkboxRadioStyle} />{comp}</label>))}</div>
                        </div>
                        {formData.familyComposition?.includes(FamilyComposition.PAREJA) && (<div><label className={labelStyle}>Nombre y apellido del cónyuge</label><input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} className={inputStyle} /></div>)}
                        <div><label className={labelStyle}>¿Tienes Hijos? *</label>
                            <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="hasChildren" value="true" checked={formData.hasChildren === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="hasChildren" value="false" checked={formData.hasChildren === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                        </div>
                        {formData.hasChildren && (<div><label className={labelStyle}>Edad aproximada de tus hijos</label><div className="grid grid-cols-2 gap-2 mt-2">{['0-5', '6-10', '11-15', '16-21'].map(range => (<label key={range} className="flex items-center"><input type="checkbox" name="childrenAges" value={range} checked={formData.childrenAges?.includes(range)} onChange={handleChange} className={checkboxRadioStyle} />{range} años</label>))}</div></div>)}
                        <div><label className={labelStyle}>Estatus actual en Canadá? *</label>
                            <div className="flex flex-wrap gap-2 mt-2">{['Ciudadano', 'Residente Permanente', 'Study Permit', 'Work Permit', 'Refugiado', 'Visitante', 'Otro'].map(status => (<label key={status} className="flex items-center"><input type="radio" name="immigrationStatus" value={status} checked={formData.immigrationStatus === status} onChange={handleChange} className={checkboxRadioStyle} />{status}</label>))}</div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Estudios</h3>
                        <div><label className={labelStyle}>¿Qué estudias en Canadá? * (si no estudias, escribe "Nada")</label><input type="text" name="studiesInCanada" value={formData.studiesInCanada || ''} onChange={handleChange} required className={inputStyle} /></div>
                        <div><label className={labelStyle}>¿En qué centro educativo estudias?</label><input type="text" name="educationalInstitution" value={formData.educationalInstitution || ''} onChange={handleChange} className={inputStyle} /></div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Finanzas</h3>
                        <div><label className={labelStyle}>¿Haces Envíos de remesa / Cambios de Divisa? *</label>
                            <div className="grid grid-cols-1 gap-2 mt-2">{Object.values(RemittanceUsage).map(usage => (<label key={usage} className="flex items-center"><input type="checkbox" name="remittanceUsage" value={usage} checked={formData.remittanceUsage?.includes(usage)} onChange={handleChange} className={checkboxRadioStyle} />{usage}</label>))}</div>
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Trabajo</h3>
                        <div><label className={labelStyle}>¿Tienes trabajo actualmente? *</label>
                            <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="isEmployed" value="true" checked={formData.isEmployed === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="isEmployed" value="false" checked={formData.isEmployed === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                        </div>
                        {formData.isEmployed && (<><div><label className={labelStyle}>¿En qué o dónde trabajas?</label><input type="text" name="currentEmployer" value={formData.currentEmployer || ''} onChange={handleChange} className={inputStyle} /></div><div><label className={labelStyle}>Posición - ¿Qué haces en este trabajo?</label><input type="text" name="currentPosition" value={formData.currentPosition || ''} onChange={handleChange} className={inputStyle} /></div></>)}
                        <div><label className={labelStyle}>¿El trabajo es referente a tu formación? *</label>
                            <div className="flex space-x-4 mt-2">{['Sí', 'No', 'No tengo trabajo'].map(option => (<label key={option} className="flex items-center"><input type="radio" name="isWorkRelatedToStudies" value={option} checked={formData.isWorkRelatedToStudies === option} onChange={handleChange} className={checkboxRadioStyle} />{option}</label>))}</div>
                        </div>
                    </div>
                )}

                {currentStep === 6 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Profesional / Emprendedor</h3>
                        <div><label className={labelStyle}>¿Qué servicios ofreces? * (Incluye todos los detalles)</label><textarea name="servicesOffered" value={formData.servicesOffered || ''} onChange={handleChange} required rows={4} className={inputStyle} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Instagram</label><input type="text" name="instagramUrl" value={formData.instagramUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Linkedin</label><input type="url" name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Facebook</label><input type="url" name="facebookUrl" value={formData.facebookUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>X (Twitter)</label><input type="text" name="twitterUrl" value={formData.twitterUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t">
                    <button type="button" onClick={handleBack} disabled={currentStep === 1} className={btnSecondary}>Atrás</button>
                    {currentStep < 6 && <button type="button" onClick={handleNext} className={btnPrimary}>Siguiente</button>}
                    {currentStep === 6 && <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'Guardando...' : 'Finalizar'}</button>}
                </div>
            </form>
        </div>
    );
};