// /home/alexis/Sites/Landings/conexion-ec-ca/types.ts
import React from 'react';
import { Timestamp } from 'firebase/firestore';

// --- TIPOS DE AUTENTICACIÓN Y USUARIO (Unificados) ---
export interface User {
  id: string; // Firebase UID
  name: string | null; // Firebase displayName
  email: string | null; // Firebase email
  role?: 'admin' | 'member'; // Rol del usuario (admin o member)
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openUserProfileModal: () => void;
  closeAuthModal: () => void;
  authModalState: ModalState;
}

// --- TIPOS DE CONTENIDO ---
export interface NavItem {
  label: string;
  href: string;
  target?: string;
  isPremium?: boolean;
  adminOnly?: boolean; // <-- AÑADIR ESTA LÍNEA
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

// --- INTERFAZ CommunityServiceItem (Unificada) ---
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

export interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl?: string;
  resourceLink?: string;
  isPremium?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  isPremium?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  isPremium?: boolean;
}

export interface Resource {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details?: string;
  isPremium?: boolean;
}

export interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  modalContent: React.ReactNode;
  isPremium?: boolean;
}

// --- TIPOS DE MODAL ---
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