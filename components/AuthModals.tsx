import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Modal } from './Modal';
import { ModalContentType, User } from '../types';
import { ECUADOR_COLORS } from '../constants';
import { EnvelopeIcon, LockClosedIcon, IdentificationIcon, UserCircleIcon } from './icons';
import { FirebaseError } from 'firebase/app'; // Import FirebaseError for type checking

// Helper function to translate Firebase error codes to Spanish
const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
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


const LoginForm: React.FC<{
  onSwitchToRegister: () => void;
}> = ({ onSwitchToRegister }) => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!auth) return <p>Error: Auth context no disponible.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    // No need to setIsSubmitting(false) here if login is successful, as component might unmount or modal closes.
    // However, if login fails, we need to re-enable the button.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center" role="alert">
          <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.03a1 1 0 012 0v5.94a1 1 0 01-2 0zM9 14a1 1 0 012 0 1 1 0 11-2 0z"/></svg>
          {error}
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
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!auth) return <p>Error: Auth context no disponible.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.register(name, email, password);
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
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                placeholder="Tu Nombre Completo"
                autoComplete="name"
            />
        </div>
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="register-email"
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
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
            />
        </div>
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ecuador-yellow focus:border-ecuador-yellow sm:text-sm"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
            />
        </div>
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
