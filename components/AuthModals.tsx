import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Modal } from './Modal';
import { ModalContentType, User } from '../types';
import { EnvelopeIcon, LockClosedIcon, IdentificationIcon, UserCircleIcon, CheckCircleIcon } from './icons';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for type checking

// Helper function to translate Firebase error codes to Spanish
const getFirebaseAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        // --- INICIO DE LA CORRECCIÓN ---
        case 'auth/invalid-credential':
            return 'El correo o la contraseña son incorrectos. Por favor, verifica tus credenciales.';
        // --- FIN DE LA CORRECCIÓN ---
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/user-disabled':
            return 'Este usuario ha sido deshabilitado.';
        case 'auth/user-not-found': // Estos dos son de versiones antiguas, pero los dejamos por si acaso.
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


const LoginForm: React.FC<{
    onSwitchToRegister: () => void;
}> = ({ onSwitchToRegister }) => {
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
            // Modal will be closed by AuthContext on successful login
        } catch (err) {
            console.error("Login error:", err);
            if (err instanceof FirebaseError) {
                setError(getFirebaseAuthErrorMessage(err.code));
            } else if (err instanceof Error) {
                setError(err.message || 'Ocurrió un error desconocido.');
            } else {
                setError('Ocurrió un error desconocido.');
            }
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico en el campo de arriba para restablecer la contraseña.');
            setSuccessMessage('');
            return;
        }
        setError('');
        setSuccessMessage('');
        try {
            await auth.sendPasswordReset(email);
            setSuccessMessage('¡Enlace enviado! Revisa tu bandeja de entrada (y la carpeta de spam) para restablecer tu contraseña.');
        } catch (err) {
            console.error("Password reset error:", err);
            if (err instanceof FirebaseError) {
                setError(getFirebaseAuthErrorMessage(err.code));
            } else {
                setError('Ocurrió un error al intentar restablecer la contraseña.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center" role="alert">
                    <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.03a1 1 0 012 0v5.94a1 1 0 01-2 0zM9 14a1 1 0 012 0 1 1 0 11-2 0z"/></svg>
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center" role="alert">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {successMessage}
                </div>
            )}
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                    />
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-sm font-medium text-ecuador-red hover:text-red-700 focus:outline-none"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ecuador-blue transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
            <p className="text-sm text-center text-gray-600">
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={onSwitchToRegister} className="font-medium text-ecuador-red hover:text-red-700">
                    Regístrate aquí
                </button>
            </p>
        </form>
    );
};

const RegisterForm: React.FC<{
    onSwitchToLogin: () => void;
}> = ({ onSwitchToLogin }) => {
    const auth = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [arrivalDateCanada, setArrivalDateCanada] = useState('');
    const [city, setCity] = useState('');
    const [immigrationStatus, setImmigrationStatus] = useState('');
    const [supportNeeded, setSupportNeeded] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [newsletterSubscription, setNewsletterSubscription] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!auth) return <p>Error: Auth context no disponible.</p>;

    const handleSupportNeededChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setSupportNeeded(prev => 
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setIsSubmitting(true);
        try {
            await auth.register({
                name,
                email,
                password,
                arrivalDateCanada: arrivalDateCanada ? new Date(arrivalDateCanada) : undefined,
                city,
                immigrationStatus,
                supportNeeded,
                message,
                newsletterSubscription
            });
            // Modal will be closed by AuthContext on successful registration
        } catch (err) {
            console.error("Registration error:", err);
            if (err instanceof FirebaseError) {
                setError(getFirebaseAuthErrorMessage(err.code));
            } else if (err instanceof Error) {
                setError(err.message || 'Ocurrió un error desconocido.');
            } else {
                setError('Ocurrió un error desconocido.');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center" role="alert">
                    <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.03a1 1 0 012 0v5.94a1 1 0 01-2 0zM9 14a1 1 0 012 0 1 1 0 11-2 0z"/></svg>
                    {error}
                </div>
            )}
            {/* Campos existentes */}
            <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>
            <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>
            <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>
            <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>

            {/* Nuevos campos */}
            <div>
                <label htmlFor="arrival-date" className="block text-sm font-medium text-gray-700 mb-1">¿Cuándo llegaste a Canadá?</label>
                <input id="arrival-date" type="date" value={arrivalDateCanada} onChange={(e) => setArrivalDateCanada(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad donde vives</label>
                <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm" />
            </div>
            <div>
                <label htmlFor="immigration-status" className="block text-sm font-medium text-gray-700 mb-1">Estatus migratorio</label>
                <select id="immigration-status" value={immigrationStatus} onChange={(e) => setImmigrationStatus(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm">
                    <option value="">Selecciona...</option>
                    <option value="residente-permanente">Residente Permanente</option>
                    <option value="ciudadano">Ciudadano</option>
                    <option value="trabajador-temporal">Trabajador Temporal</option>
                    <option value="estudiante-internacional">Estudiante Internacional</option>
                    <option value="refugiado">Refugiado</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué tipo de apoyo necesitas?</label>
                <div className="space-y-2">
                    {['Empleo', 'Vivienda', 'Idioma', 'Comunidad', 'Asesoría', 'Otro'].map(item => (
                        <div key={item} className="flex items-center">
                            <input id={`support-${item}`} type="checkbox" value={item} onChange={handleSupportNeededChange} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 rounded" />
                            <label htmlFor={`support-${item}`} className="ml-3 block text-sm text-gray-900">{item}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje o comentario</label>
                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"></textarea>
            </div>
            <div className="flex items-center">
                <input id="newsletter" type="checkbox" checked={newsletterSubscription} onChange={(e) => setNewsletterSubscription(e.target.checked)} className="h-4 w-4 text-ecuador-blue focus:ring-ecuador-yellow border-gray-300 rounded" />
                <label htmlFor="newsletter" className="ml-3 block text-sm text-gray-900">Deseo recibir noticias y eventos de la comunidad por correo</label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ecuador-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ecuador-red transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
            <p className="text-sm text-center text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={onSwitchToLogin} className="font-medium text-ecuador-blue hover:text-blue-700">
                    Inicia sesión aquí
                </button>
            </p>
        </form>
    );
};

const UserProfileDisplay: React.FC<{ user: User | null }> = ({ user }) => {
    if (!user) return <p>No se pudo cargar la información del usuario.</p>;
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <UserCircleIcon className="w-16 h-16 text-ecuador-blue" />
                <div>
                    <h3 className="text-xl font-semibold text-ecuador-blue">{user.name || 'Usuario'}</h3>
                    <p className="text-sm text-gray-500">{user.email || 'Email no disponible'}</p>
                </div>
            </div>
            <div className="mt-6 border-t pt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Actividad Reciente (Próximamente)</h4>
                <p className="text-sm text-gray-500">Aquí verás tus interacciones, eventos guardados, etc.</p>
            </div>
            <p className="mt-6 text-xs text-center text-gray-400">
                ID de Usuario: {user.id}
            </p>
        </div>
    );
};


export const AuthModals: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) return null;

    const { authModalState, closeAuthModal, openLoginModal, openRegisterModal, user } = authContext;

    let modalContentNode: React.ReactNode = null;

    switch (authModalState.type) {
        case ModalContentType.LOGIN_FORM:
            modalContentNode = <LoginForm onSwitchToRegister={openRegisterModal} />;
            break;
        case ModalContentType.REGISTER_FORM:
            modalContentNode = <RegisterForm onSwitchToLogin={openLoginModal} />;
            break;
        case ModalContentType.USER_PROFILE:
            modalContentNode = <UserProfileDisplay user={user} />;
            break;
    }

    return (
        <Modal
            isOpen={authModalState.isOpen}
            onClose={closeAuthModal}
            title={authModalState.title}
        >
            {modalContentNode}
        </Modal>
    );
};