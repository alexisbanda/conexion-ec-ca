// /home/alexis/Sites/Landings/conexion-ec-ca/components/UserProfileForm.tsx
import React, { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import { updateOnboardingData } from '../services/userService';
import { User, EducationLevel, FamilyComposition, Industry } from '../types';
import { Timestamp } from 'firebase/firestore';
import { cityData } from '../constants'; // <--- IMPORTANTE: Añadir cityData

interface UserProfileFormProps {
    user: User;
    onSuccess: () => void;
}

const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";
const checkboxRadioStyle = "h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 mr-2";
const btnPrimary = "bg-ecuador-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50";

const dateToInputString = (date: Date | Timestamp | string | undefined): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = (date instanceof Timestamp) ? date.toDate() : date;
    return new Date(d).toISOString().split('T')[0];
};

const supportOptions = ['Empleo', 'Vivienda', 'Idioma', 'Comunidad', 'Asesoría', 'Otro'];

type TabKey = 'personal' | 'family' | 'work' | 'professional';

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ user, onSuccess }) => {
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<TabKey>('personal');
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            ...user,
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
            // Manejo especial para 'supportNeeded' y otros arrays de strings
            if (fieldName === 'supportNeeded' || fieldName === 'familyComposition' || fieldName === 'childrenAges') {
                 const currentValues = (formData[fieldName] as string[] | undefined) || [];
                 const newValues = checked
                    ? [...currentValues, value]
                    : currentValues.filter(v => v !== value);
                 setFormData(prev => ({ ...prev, [fieldName]: newValues }));
            } else {
                 setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else if (name === 'city') {
            const selectedCity = value;
            let province = '';
            if (selectedCity) {
                for (const provinceData of cityData) {
                    if (provinceData.ciudades.includes(selectedCity)) {
                        province = provinceData.provincia;
                        break;
                    }
                }
            }
            setFormData(prev => ({ ...prev, city: selectedCity, province }));
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
            className={`py-3 px-4 text-sm font-medium transition-colors text-center w-full rounded-md sm:rounded-t-lg sm:rounded-b-none ${
                activeTab === tabKey
                    ? 'bg-ecuador-blue text-white sm:bg-white sm:text-ecuador-blue sm:border-b-2 sm:border-ecuador-blue'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="sm:border-b sm:border-gray-200">
                <nav className="flex flex-col gap-y-1 sm:flex-row sm:-mb-px sm:space-x-2" aria-label="Tabs">
                    <TabButton tabKey="personal" label="Información Personal" />
                    <TabButton tabKey="family" label="Estatus y Familia" />
                    <TabButton tabKey="work" label="Educación y Trabajo" />
                    <TabButton tabKey="professional" label="Perfil Profesional" />
                </nav>
            </div>

            <div className="p-4 min-h-[350px]">
                {activeTab === 'personal' && (
                    <div className="space-y-6 animate-fade-in">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos de Contacto y Ubicación</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelStyle}>Nombre</label><input name="name" type="text" value={formData.name || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Apellidos</label><input name="lastName" type="text" value={formData.lastName || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Teléfono</label><input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Email</label><input name="email" type="email" value={formData.email || ''} readOnly className={`${inputStyle} bg-gray-100 cursor-not-allowed`} /></div>
                            <div><label className={labelStyle}>Año de Nacimiento</label><input name="birthYear" type="number" value={formData.birthYear || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Fecha de Llegada a Canadá</label><input name="arrivalDateCanada" type="date" value={formData.arrivalDateCanada as any || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div>
                                <label htmlFor="register-city" className={labelStyle}>Ciudad donde vives</label>
                                <select id="register-city" name="city" value={formData.city} onChange={handleChange} className={inputStyle}>
                                    <option value="">Selecciona una ciudad</option>
                                    {cityData.map((provincia) => (
                                        <optgroup key={provincia.provincia} label={provincia.provincia}>
                                            {provincia.ciudades.map((ciudad) => (
                                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                         <div className="pt-4 border-t">
                            <label className={labelStyle}>¿Qué tipo de apoyo necesitas?</label>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {supportOptions.map(option => (
                                    <label key={option} className="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" name="supportNeeded" value={option} checked={formData.supportNeeded?.includes(option)} onChange={handleChange} className={checkboxRadioStyle} />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center pt-4 border-t">
                            <input id="newsletter" name="newsletterSubscription" type="checkbox" checked={formData.newsletterSubscription} onChange={handleChange} className={checkboxRadioStyle} />
                            <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">Deseo recibir noticias y eventos</label>
                        </div>
                    </div>
                )}

                {activeTab === 'family' && (
                    <div className="space-y-6 animate-fade-in">
                         <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Situación Actual y Familiar</h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center"><label className={labelStyle}>Estatus actual en Canadá</label><button type="button" onClick={() => setIsDisclaimerVisible(!isDisclaimerVisible)} className="ml-2 text-ecuador-blue focus:outline-none text-sm">(¿Por qué?)</button></div>
                                {isDisclaimerVisible && <div className="mt-2 p-3 bg-gray-100 border rounded-md text-xs text-gray-700"><p>Tu estatus nos ayuda a ofrecerte contenido y beneficios relevantes. <strong>Esta información es confidencial.</strong></p></div>}
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">{['Ciudadano', 'Residente Permanente', 'Study Permit', 'Work Permit', 'Visitante', 'Otro'].map(status => (<label key={status} className="flex items-center text-sm"><input type="radio" name="immigrationStatus" value={status} checked={formData.immigrationStatus === status} onChange={handleChange} className={checkboxRadioStyle} />{status}</label>))}</div>
                            </div>
                            <div className="pt-4 border-t"><label className={labelStyle}>Núcleo familiar en Canadá</label>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">{Object.values(FamilyComposition).map(comp => (<label key={comp} className="flex items-center text-sm"><input type="checkbox" name="familyComposition" value={comp} checked={formData.familyComposition?.includes(comp)} onChange={handleChange} className={checkboxRadioStyle} />{comp}</label>))}</div>
                            </div>
                            {formData.familyComposition?.includes(FamilyComposition.PAREJA) && (
                                <div className="pt-4 border-t"><label className={labelStyle}>Nombre y apellido del cónyuge</label><input type="text" name="spouseName" value={formData.spouseName || ''} onChange={handleChange} className={inputStyle} /></div>
                            )}
                            <div className="pt-4 border-t"><label className={labelStyle}>¿Tienes Hijos?</label>
                                <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="hasChildren" value="true" checked={formData.hasChildren === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="hasChildren" value="false" checked={formData.hasChildren === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                            </div>
                            {formData.hasChildren && (
                                <div className="pt-4 border-t"><label className={labelStyle}>Edad aproximada de tus hijos</label><div className="grid grid-cols-2 gap-2 mt-2">{['0-5', '6-10', '11-15', '16-21'].map(range => (<label key={range} className="flex items-center"><input type="checkbox" name="childrenAges" value={range} checked={formData.childrenAges?.includes(range)} onChange={handleChange} className={checkboxRadioStyle} />{range} años</label>))}</div></div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'work' && (
                    <div className="space-y-6 animate-fade-in">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Formación Académica y Laboral</h4>
                        <div className="space-y-6">
                             <div><label className={labelStyle}>Nivel de Estudios</label>
                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">{Object.values(EducationLevel).map(level => (<label key={level} className="flex items-center text-sm"><input type="radio" name="educationLevel" value={level} checked={formData.educationLevel === level} onChange={handleChange} className={checkboxRadioStyle} />{level}</label>))}</div>
                            </div>
                            <div className="pt-4 border-t">
                                <label className={labelStyle}>Industria de tu profesión</label>
                                <select name="profession" value={formData.profession || ''} onChange={handleChange} className={inputStyle}>
                                    <option value="">Selecciona una industria</option>
                                    {Object.values(Industry).map(industry => (<option key={industry} value={industry}>{industry}</option>))}
                                </select>
                            </div>
                            <div className="pt-4 border-t"><label className={labelStyle}>¿Qué estudias en Canadá?</label><input name="studiesInCanada" type="text" placeholder='Si no estudias, escribe "Ninguno"' value={formData.studiesInCanada || ''} onChange={handleChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>¿En qué centro educativo estudias?</label><input name="educationalInstitution" type="text" value={formData.educationalInstitution || ''} onChange={handleChange} className={inputStyle} /></div>
                            
                            <div className="pt-4 border-t"><label className={labelStyle}>¿Tienes trabajo actualmente?</label>
                                <div className="flex space-x-4 mt-2"><label className="flex items-center"><input type="radio" name="isEmployed" value="true" checked={formData.isEmployed === true} onChange={handleChange} className={checkboxRadioStyle} />Sí</label><label className="flex items-center"><input type="radio" name="isEmployed" value="false" checked={formData.isEmployed === false} onChange={handleChange} className={checkboxRadioStyle} />No</label></div>
                            </div>
                            {formData.isEmployed && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div><label className={labelStyle}>¿En qué o dónde trabajas?</label><input type="text" name="currentEmployer" value={formData.currentEmployer || ''} onChange={handleChange} className={inputStyle} /></div>
                                <div><label className={labelStyle}>Posición - ¿Qué haces?</label><input type="text" name="currentPosition" value={formData.currentPosition || ''} onChange={handleChange} className={inputStyle} /></div>
                            </div>)}
                        </div>
                    </div>
                )}

                {activeTab === 'professional' && (
                    <div className="space-y-6 animate-fade-in">
                        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Presencia en Línea y Servicios</h4>
                        <div><label className={labelStyle}>¿Qué servicios profesionales o de emprendimiento ofreces?</label><textarea name="servicesOffered" value={formData.servicesOffered || ''} onChange={handleChange} rows={4} className={inputStyle} placeholder="Describe los servicios que puedes ofrecer a la comunidad..."/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <div><label className={labelStyle}>Instagram</label><input name="instagramUrl" type="text" value={formData.instagramUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Linkedin</label><input name="linkedinUrl" type="url" value={formData.linkedinUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>Facebook</label><input name="facebookUrl" type="url" value={formData.facebookUrl || ''} onChange={handleChange} placeholder="URL del perfil" className={inputStyle} /></div>
                            <div><label className={labelStyle}>X (Twitter)</label><input name="twitterUrl" type="text" value={formData.twitterUrl || ''} onChange={handleChange} placeholder="URL o @usuario" className={inputStyle} /></div>
                        </div>
                         <div className="pt-4 border-t">
                            <label htmlFor="register-message" className={labelStyle}>Mensaje o comentario adicional (Opcional)</label>
                            <textarea id="register-message" name="message" value={formData.message} onChange={handleChange} rows={3} className={inputStyle}></textarea>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 border-t mt-8">
                <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                    {isSubmitting ? 'Guardando Cambios...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};
