// /home/alexis/Sites/Landings/conexion-ec-ca/components/OnboardingWizard.tsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { updateOnboardingData } from '../services/userService';
import { User, EducationLevel, FamilyComposition, RemittanceUsage, Industry } from '../types';
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



// --- MEJORA: Definición de los pasos para una gestión más limpia ---
const TOTAL_STEPS = 4;

export const OnboardingWizard: React.FC = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1); // Mantenemos el estado del paso actual
    const [formData, setFormData] = useState<Partial<User>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- INICIO DE LA CORRECCIÓN: Definición de estilos reutilizables ---
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";
    const checkboxRadioStyle = "h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 mr-2";
    const btnPrimary = "bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";
    const btnSecondary = "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";
    // --- MEJORA: Estilo para inputs con error ---
    const errorInputStyle = "border-red-500 ring-red-300 focus:border-red-500 focus:ring-red-500";
    const errorTextStyle = "text-red-600 text-xs mt-1";
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
                birthYear: auth.user.birthYear,
                educationLevel: auth.user.educationLevel,
                profession: auth.user.profession || '',
                familyComposition: auth.user.familyComposition || [],
                spouseName: auth.user.spouseName || '',
                hasChildren: auth.user.hasChildren,
                childrenAges: auth.user.childrenAges || [],
                studiesInCanada: auth.user.studiesInCanada || '',
                educationalInstitution: auth.user.educationalInstitution || '',
                
                isEmployed: auth.user.isEmployed,
                currentEmployer: auth.user.currentEmployer || '',
                currentPosition: auth.user.currentPosition || '',
                
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

        // --- MEJORA: Limpiar el error del campo actual al modificarlo ---
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

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
        const newErrors: Record<string, string> = {};
        switch (step) {
            case 1: // Información Personal
                if (!formData.lastName?.trim()) newErrors.lastName = 'El apellido es requerido.';
                if (!formData.phone?.trim()) newErrors.phone = 'El teléfono es requerido.';
                if (!formData.birthYear) newErrors.birthYear = 'El año de nacimiento es requerido.';
                if (!formData.arrivalDateCanada) newErrors.arrivalDateCanada = 'La fecha de llegada es requerida.';
                break;
            case 2: // Familia y Estatus
                if (!formData.familyComposition || formData.familyComposition.length === 0) newErrors.familyComposition = 'Selecciona al menos una opción.';
                if (formData.familyComposition?.includes(FamilyComposition.PAREJA) && !formData.spouseName?.trim()) newErrors.spouseName = 'El nombre del cónyuge es requerido.';
                if (formData.hasChildren === undefined) newErrors.hasChildren = 'Indica si tienes hijos.';
                if (!formData.immigrationStatus) newErrors.immigrationStatus = 'El estatus migratorio es requerido.';
                break;
            case 3: // Estudios y Trabajo
                if (!formData.studiesInCanada?.trim()) newErrors.studiesInCanada = 'Este campo es requerido.';
                if (!formData.educationLevel) newErrors.educationLevel = 'Selecciona tu nivel de estudios.';
                if (!formData.profession?.trim()) newErrors.profession = 'Este campo es requerido.';
                if (formData.isEmployed === undefined) newErrors.isEmployed = 'Indica si tienes trabajo.';
                
                break;
            
                if (!formData.servicesOffered?.trim()) newErrors.servicesOffered = 'Este campo es requerido.';
                break;
            default:
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setErrors({}); // Limpiar errores al avanzar
            setCurrentStep(prev => prev + 1);
        } else {
            toast.error('Por favor, completa todos los campos requeridos (*).');
        }
    };

    const handleBack = () => {
        setErrors({}); // Limpiar errores al retroceder
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(TOTAL_STEPS)) {
            toast.error('Por favor, completa los campos requeridos en el último paso.');
            return;
        }
        if (!auth?.user?.id) {
            toast.error('Error de autenticación. Intenta iniciar sesión de nuevo.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Finalizando...');

        try {
            // 1. Guardar los datos del onboarding
            await updateOnboardingData(auth.user.id, formData);
            toast.success('Perfil guardado.', { id: toastId });

            // 2. Otorgar puntos (y esperar a que termine)
            toast.loading('Calculando puntos...', { id: toastId });
            await fetch('/.netlify/functions/update-gamification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: auth.user.id,
                    actionType: 'COMPLETE_PROFILE',
                }),
            });
            toast.success('¡Has ganado 100 Puntos de Conexión!', { id: toastId });

            // 3. Refrescar los datos del usuario en la app (ahora con los puntos)
            await auth.refreshUserData();
            
            toast.success('¡Bienvenido a tu espacio!', { 
                icon: '🎉',
                duration: 4000
            });

            navigate('/dashboard');

        } catch (error) {
            console.error("Error al guardar el onboarding:", error);
            toast.error('No se pudo guardar tu información. Inténtalo de nuevo.', { id: toastId });
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
            <ProgressBar current={currentStep} total={TOTAL_STEPS} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Información Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Nombre</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div>
                                <label className={labelStyle}>Apellidos *</label>
                                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} required className={`${inputStyle} ${errors.lastName ? errorInputStyle : ''}`} />
                                {errors.lastName && <p className={errorTextStyle}>{errors.lastName}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Número de Teléfono *</label>
                                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required placeholder="+1 o +593" className={`${inputStyle} ${errors.phone ? errorInputStyle : ''}`} />
                                {errors.phone && <p className={errorTextStyle}>{errors.phone}</p>}
                            </div>
                            <div><label className={labelStyle}>Email</label><input type="email" name="email" value={formData.email || ''} readOnly className={`${inputStyle} bg-gray-100 cursor-not-allowed`} /></div>
                            <div>
                                <label className={labelStyle}>Año de Nacimiento *</label>
                                <input type="number" name="birthYear" value={formData.birthYear || ''} onChange={handleChange} required className={`${inputStyle} ${errors.birthYear ? errorInputStyle : ''}`} />
                                {errors.birthYear && <p className={errorTextStyle}>{errors.birthYear}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Fecha de Llegada a Canadá *</label>
                                <input type="date" name="arrivalDateCanada" value={dateToInputString(formData.arrivalDateCanada)} onChange={handleChange} required className={`${inputStyle} ${errors.arrivalDateCanada ? errorInputStyle : ''}`} />
                                {errors.arrivalDateCanada && <p className={errorTextStyle}>{errors.arrivalDateCanada}</p>}
                            </div>
                        </div>
                        
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <h3 className="text-xl font-semibold">Familia y Estatus Migratorio</h3>
                        <div><label className={labelStyle}>¿Cómo está conformado tu núcleo familiar en Canadá? *</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">{Object.values(FamilyComposition).map(comp => (<label key={comp} className="flex items-center"><input type="checkbox" name="familyComposition" value={comp} checked={formData.familyComposition?.includes(comp)} onChange={handleChange} className={checkboxRadioStyle} />{comp}</label>))}</div>
                            {errors.familyComposition && <p className={errorTextStyle}>{errors.familyComposition}</p>}
                        </div>
                        {formData.familyComposition?.includes(FamilyComposition.PAREJA) && (
                            <div>
                                <label className={labelStyle}>Nombre y apellido del cónyuge *</label>
                                <input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} className={`${inputStyle} ${errors.spouseName ? errorInputStyle : ''}`} />
                                {errors.spouseName && <p className={errorTextStyle}>{errors.spouseName}</p>}
                            </div>
                        )}
                        <div><label className={labelStyle}>¿Tienes Hijos? *</label>
                            <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="hasChildren" value="true" checked={formData.hasChildren === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="hasChildren" value="false" checked={formData.hasChildren === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                            {errors.hasChildren && <p className={errorTextStyle}>{errors.hasChildren}</p>}
                        </div>
                        {formData.hasChildren && (<div><label className={labelStyle}>Edad aproximada de tus hijos</label><div className="grid grid-cols-2 gap-2 mt-2">{['0-5', '6-10', '11-15', '16-21'].map(range => (<label key={range} className="flex items-center"><input type="checkbox" name="childrenAges" value={range} checked={formData.childrenAges?.includes(range)} onChange={handleChange} className={checkboxRadioStyle} />{range} años</label>))}</div></div>)}
                        <div>
                            <div className="flex items-center">
                                <label className={labelStyle}>Estatus actual en Canadá *</label>
                                <button type="button" onClick={() => setIsDisclaimerVisible(!isDisclaimerVisible)} className="ml-2 text-ecuador-blue focus:outline-none">
                                    (¿Por qué pedimos esto?)
                                </button>
                            </div>
                            {isDisclaimerVisible && (
                                <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                                    <p>Tu estatus migratorio nos ayuda a entender mejor las necesidades de nuestra comunidad y a ofrecerte contenido, eventos y beneficios que sean realmente relevantes para ti. <strong>Esta información es confidencial y no será compartida.</strong></p>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">{['Ciudadano', 'Residente Permanente', 'Study Permit', 'Work Permit', 'Visitante', 'Otro'].map(status => (<label key={status} className="flex items-center"><input type="radio" name="immigrationStatus" value={status} checked={formData.immigrationStatus === status} onChange={handleChange} className={checkboxRadioStyle} />{status}</label>))}</div>
                            {errors.immigrationStatus && <p className={errorTextStyle}>{errors.immigrationStatus}</p>}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold">Estudios y Trabajo</h3>
                        {/* --- MEJORA: Campo de estudios más intuitivo --- */}
                        <div><label className={labelStyle}>¿Qué estudias en Canadá? *</label>
                            <input type="text" name="studiesInCanada" value={formData.studiesInCanada || ''} onChange={handleChange} required className={`${inputStyle} ${errors.studiesInCanada ? errorInputStyle : ''}`} placeholder='Si no estudias, escribe "Ninguno"'/>
                            {errors.studiesInCanada && <p className={errorTextStyle}>{errors.studiesInCanada}</p>}
                        </div>
                        <div><label className={labelStyle}>¿En qué centro educativo estudias?</label><input type="text" name="educationalInstitution" value={formData.educationalInstitution || ''} onChange={handleChange} className={inputStyle} /></div>
                        
                        <hr className="my-4"/>

                        <div><label className={labelStyle}>Nivel de Estudios Alcanzado *</label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">{Object.values(EducationLevel).map(level => (<label key={level} className="flex items-center"><input type="radio" name="educationLevel" value={level} checked={formData.educationLevel === level} onChange={handleChange} className={checkboxRadioStyle} />{level}</label>))}</div>
                            {errors.educationLevel && <p className={errorTextStyle}>{errors.educationLevel}</p>}
                        </div>
                        <div>
                            <label className={labelStyle}>Industria de tu profesión *</label>
                            <select name="profession" value={formData.profession || ''} onChange={handleChange} required className={`${inputStyle} ${errors.profession ? errorInputStyle : ''}`}>
                                <option value="">Selecciona una industria</option>
                                {Object.values(Industry).map(industry => (
                                    <option key={industry} value={industry}>{industry}</option>
                                ))}
                            </select>
                            {errors.profession && <p className={errorTextStyle}>{errors.profession}</p>}
                        </div>

                        <div><label className={labelStyle}>¿Tienes trabajo actualmente? *</label>
                            <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="isEmployed" value="true" checked={formData.isEmployed === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="isEmployed" value="false" checked={formData.isEmployed === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                            {errors.isEmployed && <p className={errorTextStyle}>{errors.isEmployed}</p>}
                        </div>
                        {formData.isEmployed && (<><div><label className={labelStyle}>¿En qué o dónde trabajas?</label><input type="text" name="currentEmployer" value={formData.currentEmployer || ''} onChange={handleChange} className={inputStyle} /></div><div><label className={labelStyle}>Posición - ¿Qué haces en este trabajo?</label><input type="text" name="currentPosition" value={formData.currentPosition || ''} onChange={handleChange} className={inputStyle} /></div></>)}
                        
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-semibold">Financiero y Profesional</h3>
                        

                        <div>
                            <label className={labelStyle}>¿Qué servicios profesionales o de emprendimiento ofreces? *</label>
                            <textarea name="servicesOffered" value={formData.servicesOffered || ''} onChange={handleChange} required rows={4} className={`${inputStyle} ${errors.servicesOffered ? errorInputStyle : ''}`} placeholder="Ej: Clases de inglés, contabilidad, desarrollo web, comida a domicilio..."/>
                            {errors.servicesOffered && <p className={errorTextStyle}>{errors.servicesOffered}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Instagram</label><input type="text" name="instagramUrl" value={formData.instagramUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Linkedin</label><input type="url" name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Facebook</label><input type="url" name="facebookUrl" value={formData.facebookUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>X (Twitter)</label><input type="text" name="twitterUrl" value={formData.twitterUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                        </div>
                    </div>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                    Al finalizar tu perfil, confirmas que has leído y aceptas nuestra <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">Política de Privacidad</a> y los <a href="/terminos-de-servicio" target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">Términos de Servicio</a>. Tus datos nos ayudan a ofrecerte una experiencia personalizada.
                </p>
                <div className="flex justify-between items-center pt-6 border-t">
                    <button type="button" onClick={handleBack} disabled={currentStep === 1} className={btnSecondary}>Atrás</button>
                    {currentStep < TOTAL_STEPS && <button type="button" onClick={handleNext} className={btnPrimary}>Siguiente</button>}
                    {currentStep === TOTAL_STEPS && <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'Guardando...' : 'Finalizar'}</button>}
                </div>
            </form>
        </div>
    );
};