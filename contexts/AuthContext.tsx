// /home/alexis/Sites/Landings/conexion-ec-ca/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUserType, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { User, AuthContextType, AuthState, ModalState, ModalContentType } from '../types';
import { getUserData } from '../services/userService';

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
        // --- INICIO DE LA CORRECCIÓN ---
        // Mantenemos el estado de carga mientras buscamos datos adicionales.
        let appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
        };

        const additionalData = await getUserData(firebaseUser.uid);
        if (additionalData) {
          appUser = { ...appUser, ...additionalData };
        }

        // Solo cuando tenemos toda la información, actualizamos el estado y ponemos loading en false.
        setAuthState({ user: appUser, isAuthenticated: true, loading: false });
        console.log("Auth Provider: User is signed in with all data.", appUser);
        // --- FIN DE LA CORRECCIÓN ---
      } else {
        // Si no hay usuario, la carga ha terminado.
        setAuthState({ user: null, isAuthenticated: false, loading: false });
        console.log("Auth Provider: User is signed out.");
      }
    });

    return () => unsubscribe();
  }, []);

  // ... (el resto de las funciones: login, register, logout, etc. no necesitan cambios)
  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    console.log("Auth Provider: Attempting login for", email);
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting user state
    closeAuthModal();
    console.log("Auth Provider: Login successful trigger for", email);
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    console.log("Auth Provider: Attempting registration for", name, email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      // 1. Actualiza el perfil en Firebase (esto ya lo hacías)
      await updateProfile(userCredential.user, { displayName: name });
      console.log("Auth Provider: Registration successful, user profile updated with name.");

      // 2. Actualiza el estado local INMEDIATAMENTE para que la UI refleje el cambio.
      //    onAuthStateChanged ya se disparó, pero sin el 'displayName'.
      //    Esta actualización manual sincroniza el estado de la app.
      const updatedUser: User = {
        id: userCredential.user.uid,
        name: name, // Usamos el nombre que acabamos de establecer
        email: userCredential.user.email,
      };
      setAuthState({ user: updatedUser, isAuthenticated: true, loading: false });
      console.log("Auth Provider: Local state updated manually with user name.", updatedUser);
    }
    // onAuthStateChanged will handle setting user state
    closeAuthModal();
  };

  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    console.log("Auth Provider: Logging out...");
    await signOut(auth);
    // onAuthStateChanged will handle setting user state to null
    closeAuthModal(); // Close any open auth modals
    console.log("Auth Provider: Logout successful.");
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth is not initialized.");
    console.log("Auth Provider: Sending password reset email to", email);
    await sendPasswordResetEmail(auth, email);
    // The component calling this will handle the UI update (e.g., showing a success message).
  };

  const openLoginModal = () => {
    console.log("Auth Provider: Opening login modal");
    setAuthModalState({
      isOpen: true,
      title: 'Iniciar Sesión',
      type: ModalContentType.LOGIN_FORM
    });
  };

  const openRegisterModal = () => {
    console.log("Auth Provider: Opening register modal");
    setAuthModalState({
      isOpen: true,
      title: 'Crear Cuenta',
      type: ModalContentType.REGISTER_FORM
    });
  };

  const openUserProfileModal = () => {
    if (authState.isAuthenticated && authState.user) {
      console.log("Auth Provider: Opening user profile modal for", authState.user.name);
      setAuthModalState({
        isOpen: true,
        title: `Perfil de ${authState.user.name || 'Usuario'}`,
        type: ModalContentType.USER_PROFILE,
      });
    }
  };

  const closeAuthModal = () => {
    console.log("Auth Provider: Closing auth modal");
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