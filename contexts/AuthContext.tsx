import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUserType, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import initialized Firebase auth
import { User, AuthContextType, AuthState, ModalState, ModalContentType } from '../types';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Start with loading true to check for persisted state
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
        console.error("AuthContext: Firebase auth is not initialized. Check firebaseConfig.ts.");
        setAuthState({ user: null, isAuthenticated: false, loading: false });
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
        };
        setAuthState({ user: appUser, isAuthenticated: true, loading: false });
        console.log("Auth Provider: User is signed in.", appUser);
      } else {
        setAuthState({ user: null, isAuthenticated: false, loading: false });
        console.log("Auth Provider: User is signed out.");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

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
      await updateProfile(userCredential.user, { displayName: name });
      // Manually update the current user in state if onAuthStateChanged hasn't fired yet
      // or rely on onAuthStateChanged to pick up the displayName.
      // For immediate UI update, you might want to set user here too.
      // However, onAuthStateChanged should ideally handle the update.
      console.log("Auth Provider: Registration successful, user profile updated with name.");
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
    openLoginModal,
    openRegisterModal,
    openUserProfileModal,
    closeAuthModal,
    authModalState,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
