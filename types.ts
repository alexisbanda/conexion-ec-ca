// /home/alexis/Sites/Landings/conexion-ec-ca/types.ts

import React from 'react';
import { Timestamp } from 'firebase/firestore';

// --- AÑADIR ENUM PARA EL ESTADO DEL USUARIO ---
export enum UserStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

// --- TIPOS DE AUTENTICACIÓN Y USUARIO (Unificados) ---
export interface User {
  id: string; // Firebase UID
  name: string | null; // Firebase displayName
  email: string | null; // Firebase email
  role?: 'admin' | 'member'; // Rol del usuario (admin o member)
  status?: UserStatus; // <-- Usar el enum
  // Campos adicionales del registro
  arrivalDateCanada?: Timestamp;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;
  createdAt?: Timestamp; // Fecha de creación del perfil
}

// ... (el resto del archivo no necesita cambios, pero asegúrate de que esté así)
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Datos que se pasarán a la función de registro
export interface RegistrationData {
  name: string;
  email: string;
  password?: string; // Hacer la contraseña opcional aquí
  arrivalDateCanada?: Date;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;
}


export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (registrationData: RegistrationData) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openUserProfileModal: () => void;
  closeAuthModal: () => void;
  authModalState: ModalState;
}

// ... (resto de tipos sin cambios)
export interface NavItem {
  label: string;
  href: string;
  target?: string;
  isPremium?: boolean;
  adminOnly?: boolean;
}

export enum ServiceType {
  OFERTA = 'Oferta',
  DEMANDA = 'Demanda',
}

export enum ServiceStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export interface CommunityServiceItem {
  id: string;
  serviceName: string;
  type: ServiceType;
  contact: string;
  contactName: string;
  city: string;
  website?: string;
  websiteText?: string;
  userId: string;
  createdAt: Timestamp;
  status: ServiceStatus;
}

export enum ModalContentType {
  BENEFIT_DETAILS,
  RESOURCE_DETAILS,
  TOOL_CONTENT,
  LOGIN_FORM,
  REGISTER_FORM,
  USER_PROFILE,
  COMMUNITY_DIRECTORY,
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  type?: ModalContentType;
  fullWidth?: boolean;
}