// /home/alexis/Sites/Landings/conexion-ec-ca/components/AuthModals.tsx
import React, { useContext, useState, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Modal } from './Modal';
import { cityData } from '../constants';
import { ModalContentType, User, RegistrationData } from '../types';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from './icons';
import { FirebaseError } from 'firebase/app';
import { UserProfileForm } from './UserProfileForm';

// --- FUNCIÓN DE AYUDA PARA ERRORES ---
const getFirebaseAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-credential':
            return 'El correo o la contraseña son incorrectos. Por favor, verifica tus credenciales.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/user-disabled':
            return 'Este usuario ha sido deshabilitado.';
        case 'auth/user-not-found':
            return 'No se encontró ningún usuario con este correo electrónico.';
        case 'auth/wrong-password':
            return 'La contraseña es incorrecta.';
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso por otra cuenta.';
        case 'auth/operation-not-allowed':
            return 'El inicio de sesión con correo y contraseña no está habilitado.';
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.';
        default:
            return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    }
};

// --- FORMULARIO DE LOGIN ---
const LoginForm: React.FC<{ onSwitchToRegister: () => void; }> = ({ onSwitchToRegister }) => {
    const auth = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!auth) return <p>Error: Auth context no disponible.</p>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);
        try {
            await auth.login(email, password);
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(getFirebaseAuthErrorMessage(err.code));
            } else if (err instanceof Error) {
                setError(err.message || 'Ocurrió un error desconocido.');
            } else {
                setError('Ocurrió un error desconocido.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico para restablecer la contraseña.');
            return;
        }
        setError('');
        try {
            await auth.sendPasswordReset(email);
            setSuccessMessage('¡Enlace enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
        } catch (err) {
            if (err instanceof FirebaseError) setError(getFirebaseAuthErrorMessage(err.code));
            else setError('Error al enviar el enlace.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>}
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative"><EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /><input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="tu@correo.com" /></div>
            </div>
            <div>
                <div className="flex items-center justify-between"><label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Contraseña</label><button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-ecuador-red hover:text-red-700">¿Olvidaste tu contraseña?</button></div>
                <div className="relative mt-1"><LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /><input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" placeholder="••••••••" /></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-blue hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}</button>
            <p className="text-sm text-center text-gray-600">¿No tienes cuenta?{' '}<button type="button" onClick={onSwitchToRegister} className="font-medium text-ecuador-red hover:text-red-700">Regístrate aquí</button></p>
        </form>
    );
};

// --- FORMULARIO DE REGISTRO (CORREGIDO) ---
const RegisterForm: React.FC<{ onSwitchToLogin: () => void; }> = ({ onSwitchToLogin }) => {
    const auth = useContext(AuthContext);
    const [formData, setFormData] = useState<Omit<RegistrationData, 'password'>>({
        name: '',
        email: '',
        city: '',
        arrivalDateCanada: undefined,
        immigrationStatus: '',
        message: '',
        newsletterSubscription: true,
        supportNeeded: []
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- INICIO DE LA CORRECCIÓN: Definición de estilos reutilizables ---
    const labelStyle = "block text-sm font-medium text-gray-700";
    const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm";
    const checkboxStyle = "h-4 w-4 rounded text-ecuador-blue focus:ring-ecuador-yellow border-gray-300";
    const btnPrimary = "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-blue hover:bg-blue-700 disabled:opacity-50";
    // --- FIN DE LA CORRECCIÓN ---

    if (!auth) return <p>Error: Auth context no disponible.</p>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === "newsletterSubscription") {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            supportNeeded: checked
                ? [...(prev.supportNeeded || []), value]
                : (prev.supportNeeded || []).filter(item => item !== value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        setIsSubmitting(true);
        try {
            await auth.register({
                ...formData,
                password,
                arrivalDateCanada: formData.arrivalDateCanada ? new Date(formData.arrivalDateCanada) : undefined,
            });
        } catch (err) {
            if (err instanceof FirebaseError) setError(getFirebaseAuthErrorMessage(err.code));
            else if (err instanceof Error) setError(err.message);
            else setError('Ocurrió un error desconocido.');
        } finally {
            setIsSubmitting(false);
        }
    };

    

    const supportOptions = ['Empleo', 'Vivienda', 'Idioma', 'Comunidad', 'Asesoría', 'Otro'];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="register-name" className={labelStyle}>Nombre Completo</label>
                    <input id="register-name" name="name" type="text" value={formData.name} onChange={handleChange} required className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="register-email" className={labelStyle}>Correo Electrónico</label>
                    <input id="register-email" name="email" type="email" value={formData.email} onChange={handleChange} required className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="register-password" className={labelStyle}>Contraseña</label>
                    <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="register-confirmPassword" className={labelStyle}>Confirmar Contraseña</label>
                    <input id="register-confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputStyle} />
                </div>
                <div>
                    <label htmlFor="register-arrivalDate" className={labelStyle}>¿Cuándo llegaste a Canadá?</label>
                    <input id="register-arrivalDate" name="arrivalDateCanada" type="date" value={formData.arrivalDateCanada ? new Date(formData.arrivalDateCanada).toISOString().split('T')[0] : ''} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="register-city" className={labelStyle}>Ciudad donde vives</label>
                    <select
                      id="register-city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputStyle}
                    >
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

            <div>
                <label htmlFor="register-immigrationStatus" className={labelStyle}>Estatus migratorio</label>
                <select id="register-immigrationStatus" name="immigrationStatus" value={formData.immigrationStatus} onChange={handleChange} className={inputStyle}>
                    <option value="">Selecciona una opción</option>
                    <option value="Residente Permanente">Residente Permanente</option>
                    <option value="Study Permit">Study Permit</option>
                    <option value="Work Permit">Work Permit</option>
                    <option value="Ciudadano">Ciudadano</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>

            <div>
                <label className={labelStyle}>¿Qué tipo de apoyo necesitas?</label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {supportOptions.map(option => (
                        <label key={option} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" value={option} checked={formData.supportNeeded?.includes(option)} onChange={handleSupportChange} className={checkboxStyle} />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="register-message" className={labelStyle}>Mensaje o comentario (Opcional)</label>
                <textarea id="register-message" name="message" value={formData.message} onChange={handleChange} rows={3} className={inputStyle}></textarea>
            </div>

            <div className="flex items-center">
                <input id="newsletter" name="newsletterSubscription" type="checkbox" checked={formData.newsletterSubscription} onChange={handleChange} className={checkboxStyle} />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">Deseo recibir noticias y eventos de la comunidad por correo</label>
            </div>

            <p className="text-xs text-gray-500 mt-4">
                Al crear una cuenta, aceptas nuestra <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">Política de Privacidad</a> y los <a href="/terminos-de-servicio" target="_blank" rel="noopener noreferrer" className="text-ecuador-blue hover:underline">Términos de Servicio</a>. Tus datos serán utilizados para personalizar tu experiencia y mejorar nuestros servicios.
            </p>
            <button type="submit" disabled={isSubmitting} className={btnPrimary}>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</button>
            <p className="text-sm text-center text-gray-600">¿Ya tienes cuenta?{' '}<button type="button" onClick={onSwitchToLogin} className="font-medium text-ecuador-red hover:text-red-700">Inicia sesión</button></p>
        </form>
    );
};

// --- CONTENEDOR DEL PERFIL DE USUARIO ---
const UserProfileContainer: React.FC<{ user: User; onSuccess: () => void }> = ({ user, onSuccess }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                <UserCircleIcon className="w-16 h-16 text-ecuador-blue" />
                <div>
                    <h3 className="text-xl font-semibold text-ecuador-blue">{user.name || 'Usuario'}</h3>
                    <p className="text-sm text-gray-500">{user.email || 'Email no disponible'}</p>
                </div>
            </div>
            <UserProfileForm user={user} onSuccess={onSuccess} />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE MODALES ---
export const AuthModals: React.FC = () => {
    const auth = useContext(AuthContext);

    if (!auth) return null;

    const { authModalState, closeAuthModal, openLoginModal, openRegisterModal, user } = auth;

    let modalContentNode: React.ReactNode = null;
    let modalTitle = authModalState.title;

    const handleSwitchToRegister = () => {
        closeAuthModal();
        setTimeout(openRegisterModal, 150);
    };

    const handleSwitchToLogin = () => {
        closeAuthModal();
        setTimeout(openLoginModal, 150);
    };

    switch (authModalState.type) {
        case ModalContentType.LOGIN_FORM:
            modalContentNode = <LoginForm onSwitchToRegister={handleSwitchToRegister} />;
            break;
        case ModalContentType.REGISTER_FORM:
            modalContentNode = <RegisterForm onSwitchToLogin={handleSwitchToLogin} />;
            break;
        case ModalContentType.USER_PROFILE:
            if (user) {
                modalContentNode = <UserProfileContainer user={user} onSuccess={closeAuthModal} />;
            } else {
                modalContentNode = <p>Cargando perfil...</p>;
            }
            break;
        default:
            modalContentNode = authModalState.content;
    }

    return (
        <Modal isOpen={authModalState.isOpen} onClose={closeAuthModal} title={modalTitle} fullWidth={authModalState.fullWidth}>
            {modalContentNode}
        </Modal>
    );
};