// /home/alexis/Sites/Landings/conexion-ec-ca/types.ts
import React from 'react';
import { Timestamp } from 'firebase/firestore';

// --- Contenido General ---
export interface EventItem {
  id: string;
  title: string;
  date: Timestamp;
  description: string;
  imageUrl?: string;
  isPremium?: boolean;
  published: boolean;
  createdAt: Timestamp;
  rsvps?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  publishedAt: Timestamp;
  published: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  target?: string;
  isPremium?: boolean;
  adminOnly?: boolean;
}

// --- Tipos para Beneficios y Recursos ---
export interface Benefit {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl?: string;
  isPremium?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
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


// --- Tipos de Usuario y Autenticación ---

export enum UserStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export enum EducationLevel {
  SECUNDARIA = 'Secundaria',
  TERCER_NIVEL = 'Tercer Nivel',
  CUARTO_NIVEL = 'Cuarto Nivel',
}

export enum FamilyComposition {
  SOLO = 'Solo(a)',
  PAREJA = 'En pareja',
  CON_HIJOS = 'Con Hijos',
  OTRO = 'Otro',
}

export enum RemittanceUsage {
  EC_TO_CA = 'Ecuador a Canadá',
  CA_TO_EC = 'Canadá a Ecuador',
  NO_ENVIO = 'No envío dinero',
}

/**
 * Representa la estructura completa de un usuario en Firestore.
 * Combina datos del registro inicial y del wizard de onboarding.
 */
export interface User {
  id: string;
  name: string | null; // Nombre completo del registro
  email: string | null;
  role?: 'admin' | 'member';
  status?: UserStatus;
  createdAt?: Timestamp;
  onboardingCompleted?: boolean;

  // --- Datos del Registro Inicial ---
  arrivalDateCanada?: Timestamp;
  city?: string;
  immigrationStatus?: string;
  supportNeeded?: string[];
  message?: string;
  newsletterSubscription?: boolean;

  // --- Datos del Onboarding Wizard ---
  lastName?: string; // Apellidos
  phone?: string;
  birthDate?: Timestamp;
  educationLevel?: EducationLevel;
  profession?: string;
  familyComposition?: FamilyComposition[];
  spouseName?: string;
  hasChildren?: boolean;
  childrenAges?: string[];
  studiesInCanada?: string;
  educationalInstitution?: string;
  remittanceUsage?: RemittanceUsage[];
  isEmployed?: boolean;
  currentEmployer?: string;
  currentPosition?: string;
  isWorkRelatedToStudies?: 'Sí' | 'No' | 'No tengo trabajo';
  servicesOffered?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

/**
 * Representa los datos que se envían desde el formulario de registro.
 */
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
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

// --- Tipos para el Directorio de Servicios ---

export enum ServiceType {
  OFERTA = 'Oferta',
  DEMANDA = 'Demanda',
}

export enum ServiceStatus {
  PENDIENTE = 'Pendiente',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
}

export enum ServiceCategory {
  COMIDA = 'Comida y Alimentos',
  LEGAL = 'Asesoría Legal y Migratoria',
  TECNOLOGIA = 'Tecnología y Soporte',
  BELLEZA = 'Salud y Belleza',
  DELIVERY = 'Envíos y Delivery',
  EDUCACION = 'Educación y Clases',
  EVENTOS = 'Eventos y Social',
  HOGAR = 'Servicios del Hogar',
  OTRO = 'Otro',
}

export interface CommunityServiceItem {
  id: string;
  serviceName: string;
  type: ServiceType;
  // --- CAMPOS NUEVOS ---
  shortDescription: string; // Descripción corta para la tarjeta
  category: ServiceCategory; // Categoría para filtrar y agrupar
  icon?: string; // Opcional: para un ícono representativo
  whatsapp?: string; // Número de WhatsApp
  instagram?: string; // Usuario de Instagram sin @
  isRecommended?: boolean; // Para que el admin pueda destacar un servicio
  // --- FIN DE CAMPOS NUEVOS ---
  contact: string; // Email del usuario (se mantiene como fallback)
  contactName: string;
  city: string;
  website?: string;
  websiteText?: string;
  userId: string;
  createdAt: Timestamp;
  status: ServiceStatus;
}

// --- Tipos para Modales ---

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