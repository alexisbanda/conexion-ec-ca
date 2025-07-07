// /home/alexis/Sites/Landings/conexion-ec-ca/contexts/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUserType, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User, AuthContextType, AuthState, ModalState, ModalContentType, RegistrationData, UserStatus } from '../types';
import { getUserData, createUserDocument } from '../services/userService';
import toast from 'react-hot-toast';
import { sendWelcomeEmail } from '../services/emailService';
// 1. Importar el componente del Directorio
import { CommunityDirectory } from '../components/CommunityDirectory';

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
        if (!additionalData) {
          await signOut(auth);
          setAuthState({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          ...additionalData,
        };

        const isApproved = appUser.role === 'admin' || appUser.status === UserStatus.APROBADO;
        setAuthState({ user: appUser, isAuthenticated: isApproved, loading: false });

      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      const { user } = userCredential;
      await updateProfile(user, { displayName: name });
      await createUserDocument(user.uid, registrationData);
      await sendWelcomeEmail({ name, email });
      closeAuthModal();
      toast.success(
          '¡Registro exitoso! Tu cuenta está pendiente de aprobación.',
          { duration: 6000, style: { background: '#333', color: '#fff' } }
      );
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    if (firebaseUser) {
      const additionalData = await getUserData(firebaseUser.uid);
      if (!additionalData) {
        toast.error('No se encontraron datos para este usuario. Contacta a soporte.');
        await signOut(auth);
        setAuthState({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      const appUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        ...additionalData,
      };
      const isApproved = appUser.role === 'admin' || appUser.status === UserStatus.APROBADO;
      setAuthState({ user: appUser, isAuthenticated: isApproved, loading: false });
      closeAuthModal();

      if (appUser.role === 'admin') {
        navigate('/admin');
        toast.success(`¡Bienvenido de nuevo, ${appUser.name}!`);
      } else if (isApproved) {
        if (appUser.onboardingCompleted) {
          navigate('/dashboard');
          toast.success(`¡Bienvenido de nuevo, ${appUser.name}!`);
        } else {
          navigate('/onboarding');
          toast.success(`¡Bienvenido, ${appUser.name}! Ayúdanos a completar tu perfil.`);
        }
      } else if (appUser.status === UserStatus.PENDIENTE) {
        navigate('/pending-approval');
        toast.error('Tu cuenta aún está pendiente de aprobación.');
      } else {
        toast.error('Tu cuenta no tiene acceso. Contacta a un administrador.');
        await signOut(auth);
        navigate('/');
      }
    }
  };

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

  const refreshUserData = async (): Promise<void> => {
    if (auth.currentUser) {
      const updatedData = await getUserData(auth.currentUser.uid);
      if (updatedData) {
        const appUser: User = {
          id: auth.currentUser.uid,
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
          ...updatedData,
        };
        setAuthState(prevState => ({
          ...prevState,
          user: appUser,
        }));
        console.log("Datos del usuario refrescados en el contexto.");
      }
    }
  };

  const openLoginModal = () => setAuthModalState({ isOpen: true, title: 'Iniciar Sesión', type: ModalContentType.LOGIN_FORM });
  const openRegisterModal = () => setAuthModalState({ isOpen: true, title: 'Crear Cuenta', type: ModalContentType.REGISTER_FORM });
  const openUserProfileModal = () => {
    if (authState.isAuthenticated && authState.user) {
      setAuthModalState({ isOpen: true, title: `Mi Espacio`, type: ModalContentType.USER_PROFILE, fullWidth: true });
    }
  };

  // 2. Definir la nueva función para abrir el modal del directorio
  const openDirectoryModal = () => {
    setAuthModalState({
      isOpen: true,
      title: 'Directorio Comunitario',
      content: <CommunityDirectory />,
      type: ModalContentType.COMMUNITY_DIRECTORY,
      fullWidth: true, // Usamos fullWidth para dar más espacio al directorio
    });
  };

  const closeAuthModal = () => setAuthModalState({ isOpen: false });

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    sendPasswordReset,
    openLoginModal,
    openRegisterModal,
    openUserProfileModal,
    openDirectoryModal, // 3. Añadir la función al valor del contexto
    closeAuthModal,
    authModalState,
    refreshUserData,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };