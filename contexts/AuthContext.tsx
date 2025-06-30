// /home/alexis/Sites/Landings/conexion-ec-ca/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUserType, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User, AuthContextType, AuthState, ModalState, ModalContentType, RegistrationData, UserStatus } from '../types';
import { getUserData, createUserDocument } from '../services/userService';
import toast from 'react-hot-toast';
import { sendWelcomeEmail } from '../services/emailService'; // <-- 1. IMPORTAR

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const [authModalState, setAuthModalState] = useState<ModalState>({ isOpen: false });

  useEffect(() => {
    if (!auth) {
      console.error("AuthContext: Firebase auth is not initialized.");
      setAuthState({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        const additionalData = await getUserData(firebaseUser.uid);
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          ...additionalData,
        };

        const isApproved = appUser.role === 'admin' || appUser.status === UserStatus.APROBADO;

        // Este efecto ahora solo se encarga de mantener la sesión al recargar la página.
        // La actualización de estado inmediata la hace la función de login.
        setAuthState({ user: appUser, isAuthenticated: isApproved, loading: false });

        if (isApproved) {
          console.log("Auth Provider: User session restored and approved.", appUser);
        } else {
          console.log(`Auth Provider: User session restored but not approved. Status: ${appUser.status}`);
        }

      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
        console.log("Auth Provider: User is signed out.");
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (registrationData: RegistrationData): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");

    const { email, password, name } = registrationData;

    if (!email || !password || !name) {
      throw new Error("Nombre, email y contraseña son requeridos.");
    }

    // 1. Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (userCredential.user) {
      const { user } = userCredential;

      // 2. Actualizar el perfil de Firebase (nombre visible)
      await updateProfile(user, { displayName: name });

      // 3. Crear nuestro documento de usuario personalizado en Firestore
      await createUserDocument(user.uid, registrationData);

      // --- ¡AQUÍ ESTÁ LA INTEGRACIÓN! ---
      // 4. Enviar el correo de bienvenida a través de nuestra Netlify Function.
      // Se ejecuta de forma asíncrona y no bloquea el flujo del usuario.
      await sendWelcomeEmail({ name, email });
      // --- FIN DE LA INTEGRACIÓN ---

      // 5. Cerrar el modal y notificar al usuario del éxito
      closeAuthModal();
      toast.success(
          '¡Registro exitoso! Tu cuenta está pendiente de aprobación.',
          {
            duration: 6000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }
      );
    }
  };

  // --- INICIO DE LA CORRECCIÓN ---
  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
      const additionalData = await getUserData(firebaseUser.uid);

      // 1. Construimos el objeto de usuario completo
      const appUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        ...additionalData,
      };

      // 2. Determinamos si está aprobado
      const isApproved = appUser.role === 'admin' || appUser.status === UserStatus.APROBADO;

      // 3. ¡LA CLAVE! Actualizamos el estado de la aplicación INMEDIATAMENTE
      setAuthState({ user: appUser, isAuthenticated: isApproved, loading: false });

      // 4. Cerramos el modal
      closeAuthModal();

      // 5. Ahora navegamos, con el estado ya actualizado
      if (appUser.role === 'admin') {
        navigate('/admin');
      } else if (appUser.status === UserStatus.APROBADO) {
        navigate('/dashboard');
      } else if (appUser.status === UserStatus.PENDIENTE) {
        navigate('/pending-approval');
      } else {
        // Caso para usuarios rechazados o con estado inválido
        toast.error('Tu cuenta no tiene acceso. Contacta a un administrador.');
        // Lo dejamos en la página de inicio
        navigate('/');
      }
    }
  };
  // --- FIN DE LA CORRECCIÓN ---

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    await signOut(auth);
    closeAuthModal();
    navigate('/');
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    await sendPasswordResetEmail(auth, email);
  };

  const openLoginModal = () => {
    setAuthModalState({
      isOpen: true,
      title: 'Iniciar Sesión',
      type: ModalContentType.LOGIN_FORM
    });
  };

  const openRegisterModal = () => {
    setAuthModalState({
      isOpen: true,
      title: 'Crear Cuenta',
      type: ModalContentType.REGISTER_FORM
    });
  };

  const openUserProfileModal = () => {
    if (authState.isAuthenticated && authState.user) {
      setAuthModalState({
        isOpen: true,
        title: `Perfil de ${authState.user.name || 'Usuario'}`,
        type: ModalContentType.USER_PROFILE,
      });
    }
  };

  const closeAuthModal = () => {
    setAuthModalState({ isOpen: false });
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    sendPasswordReset,
    openLoginModal,
    openRegisterModal,
    openUserProfileModal,
    closeAuthModal,
    authModalState,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };