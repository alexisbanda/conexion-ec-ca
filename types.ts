// /home/alexis/Sites/Landings/conexion-ec-ca/types.ts
import React from 'react';
import { Timestamp } from 'firebase/firestore';

// --- INICIO DE LA CORRECCIÓN ---
// Se ha unificado la interfaz EventItem en una sola definición.
export interface EventItem {
  id: string;
  title: string;
  date: Timestamp;
  description: string;
  imageUrl?: string;
  isPremium?: boolean;
  published: boolean;
  createdAt: Timestamp;
  rsvps?: string[]; // Campo para RSVP añadido aquí
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: Timestamp;
  published: boolean;
}
// --- FIN DE LA CORRECCIÓN ---

export enum UserStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role?: 'admin' | 'member';
  status?: UserStatus;
  arrivalDateCanada?: Timestamp;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;
  createdAt?: Timestamp;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface RegistrationData {
  name: string;
  email: string;
  password?: string;
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
  refreshUserData: () => Promise<void>;
}

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